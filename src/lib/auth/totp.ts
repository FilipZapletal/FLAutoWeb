import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Dvoufázové ověření: TOTP podle RFC 6238 (SHA-1, 6 číslic, 30 s) – kompatibilní
 * s Google Authenticator, Microsoft Authenticator, 1Password apod.
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
/** Tolerance ±1 krok (nepřesné hodiny v telefonu). */
const WINDOW = 1;
export const ISSUER = "FL Auto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(text: string) {
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of text.replace(/=+$/, "").toUpperCase()) {
    const idx = BASE32.indexOf(ch);
    if (idx < 0) throw new Error("Neplatný base32");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Nový tajný klíč (160 bitů) v base32. */
export const generateTotpSecret = () => base32Encode(randomBytes(20));

function hotp(secret: Buffer, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", secret).update(msg).digest();
  const offset = h[h.length - 1] & 0xf;
  const code = (h.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return code.toString().padStart(DIGITS, "0");
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

/**
 * Ověří 6místný kód. Vrací číslo kroku, ke kterému kód patří (pro ochranu proti
 * opakovanému použití), nebo null. Kroky ≤ lastStep se už nepřijímají.
 */
export function verifyTotp(secretBase32: string, code: string, lastStep: number | null, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  const secret = base32Decode(secretBase32);
  const step = currentStep(now);
  for (let s = step - WINDOW; s <= step + WINDOW; s++) {
    if (lastStep !== null && s <= lastStep) continue;
    const expected = hotp(secret, s);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return s;
  }
  return null;
}

/** Adresa otpauth:// pro QR kód v aplikaci. */
export function totpUri(secretBase32: string, account: string) {
  const label = encodeURIComponent(`${ISSUER}:${account}`);
  const params = new URLSearchParams({ secret: secretBase32, issuer: ISSUER, algorithm: "SHA1", digits: String(DIGITS), period: String(STEP_SECONDS) });
  return `otpauth://totp/${label}?${params}`;
}

// --- Šifrování tajného klíče v DB (AES-256-GCM, klíč odvozený ze SESSION_SECRET) ---

function encryptionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET musí mít alespoň 32 znaků");
  return Buffer.from(hkdfSync("sha256", secret, "flauto", "admin-totp-secret", 32));
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

/** Dešifruje klíč; při změně SESSION_SECRET nebo poškození vrací null. */
export function decryptSecret(stored: string) {
  try {
    const [v, iv, tag, data] = stored.split(".");
    if (v !== "v1") return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

// --- Záložní kódy ---

export const RECOVERY_CODE_COUNT = 8;

/** Normalizace zadaného záložního kódu: bez mezer a pomlček, velkými písmeny. */
export const normalizeRecoveryCode = (code: string) => code.replace(/[\s-]/g, "").toUpperCase();

/** Kódy mají 50 bitů náhody, proto stačí SHA-256 (není potřeba pomalý hash jako u hesla). */
export const hashRecoveryCode = (code: string) => createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");

/** Vygeneruje záložní kódy ve tvaru XXXXX-XXXXX. */
export function generateRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const raw = base32Encode(randomBytes(7)).slice(0, 10);
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
