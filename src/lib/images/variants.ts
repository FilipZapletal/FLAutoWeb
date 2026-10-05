import "server-only";
import { getStorage } from "./storage";

/** Šířky generovaných variant (px). */
export const IMAGE_WIDTHS = [400, 1024, 1920] as const;

export const variantKey = (storageKey: string, width: number) => `${storageKey}-${width}.webp`;

/** JPEG pro náhledy při sdílení (WhatsApp a další neumí spolehlivě WebP). */
export const ogKey = (storageKey: string) => `${storageKey}-og.jpg`;

export type ImageUrls = {
  thumb: string;
  src: string;
  large: string;
  og: string;
  srcSet: string;
};

export function imageUrls(storageKey: string): ImageUrls {
  const storage = getStorage();
  const url = (w: number) => storage.publicUrl(variantKey(storageKey, w));
  return {
    thumb: url(400),
    src: url(1024),
    large: url(1920),
    og: storage.publicUrl(ogKey(storageKey)),
    srcSet: IMAGE_WIDTHS.map((w) => `${url(w)} ${w}w`).join(", "),
  };
}
