import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Úložiště souborů. `local` = ./uploads (vývoj, servíruje /media/...),
 * `s3` = libovolné S3-kompatibilní úložiště (Supabase Storage, Cloudflare R2…).
 */
export interface Storage {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  remove(keys: string[]): Promise<void>;
  publicUrl(key: string): string;
}

const LOCAL_ROOT = path.resolve(process.cwd(), "uploads");

/** Bezpečně převede klíč na cestu uvnitř ./uploads (ochrana proti ../). */
export function localPath(key: string) {
  const full = path.resolve(LOCAL_ROOT, key);
  if (!full.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Neplatná cesta");
  return full;
}

const localStorage: Storage = {
  async put(key, body) {
    const file = localPath(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  },
  async remove(keys) {
    await Promise.all(keys.map((k) => unlink(localPath(k)).catch(() => undefined)));
  },
  publicUrl: (key) => `/media/${key}`,
};

export const readLocalFile = (key: string) => readFile(localPath(key));

function s3Storage(): Storage {
  const bucket = requireEnv("S3_BUCKET");
  const publicBase = requireEnv("S3_PUBLIC_URL").replace(/\/$/, "");
  // Klient se načítá až při prvním použití, ať lokální vývoj nepotřebuje AWS SDK.
  const client = import("@aws-sdk/client-s3").then(
    ({ S3Client }) =>
      new S3Client({
        endpoint: requireEnv("S3_ENDPOINT"),
        region: process.env.S3_REGION || "auto",
        forcePathStyle: true,
        credentials: {
          accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
          secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
        },
      }),
  );
  return {
    async put(key, body, contentType) {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await (await client).send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    },
    async remove(keys) {
      if (!keys.length) return;
      const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
      await (await client).send(
        new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }),
      );
    },
    publicUrl: (key) => `${publicBase}/${key}`,
  };
}

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Chybí proměnná prostředí ${name}`);
  return v;
}

let instance: Storage | undefined;
export function getStorage(): Storage {
  instance ??= process.env.STORAGE_DRIVER === "s3" ? s3Storage() : localStorage;
  return instance;
}
