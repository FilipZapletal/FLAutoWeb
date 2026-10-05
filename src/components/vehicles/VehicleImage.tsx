/* eslint-disable @next/next/no-img-element -- fotky mají vlastní předgenerované WebP varianty (srcset) */
import type { PublicImage } from "@/lib/vehicles/public";
import { CarIcon } from "@/components/ui/icons";

type Props = {
  image: Pick<PublicImage, "src" | "srcSet" | "alt" | "width" | "height"> | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function VehicleImage({ image, sizes, priority = false, className = "" }: Props) {
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
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
