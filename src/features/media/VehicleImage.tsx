import type { ImgHTMLAttributes } from "react";
import type { Photo } from "../../domain/catalog";
export function VehicleImage({
  photo,
  compact = false,
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  photo: Photo;
  compact?: boolean;
}) {
  const base = import.meta.env.BASE_URL;
  const sizes = compact
    ? "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw"
    : "(max-width: 900px) 100vw, 60vw";
  const stem = photo.url
    .split("/")
    .at(-1)!
    .replace(/\.[^.]+$/, "");
  const srcset = (format: string) =>
    [480, 960]
      .map(
        (width) =>
          `${base}images/responsive/${stem}-${width}.${format} ${width}w`,
      )
      .join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img {...props} src={base + photo.url} decoding="async" />
    </picture>
  );
}
