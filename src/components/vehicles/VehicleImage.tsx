/* eslint-disable @next/next/no-img-element -- fotky mají vlastní předgenerované WebP varianty (srcset) */
import { CarIcon } from "@/components/ui/icons";

type Props = {
  image: { src: string; srcSet: string; alt: string; width: number; height: number } | null;
  sizes: string;
  /** Nejdůležitější fotka stránky: načte se hned a s vysokou prioritou. */
  priority?: boolean;
  /** Načte se hned (bez lazy loadingu), ale bez zvýšené priority – např. další fotky v galerii po prvním dotyku. */
  eager?: boolean;
  className?: string;
};

export function VehicleImage({ image, sizes, priority = false, eager = false, className = "" }: Props) {
  if (!image) {
    return (
      <div className={`flex items-center justify-center bg-card2 text-muted ${className}`}>
        <CarIcon size={48} strokeWidth={1.2} />
      </div>
    );
  }
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={priority || eager ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
