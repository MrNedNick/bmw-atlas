import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { families } from "../src/data/models";
const root = new URL("../public/", import.meta.url);
mkdirSync(new URL("images/responsive/", root), { recursive: true });
const paths = new Set(
  families.flatMap((family) =>
    family.generations.flatMap((generation) =>
      generation.photo ? [generation.photo.url] : [],
    ),
  ),
);
for (const path of paths) {
  const stem = path
    .split("/")
    .at(-1)!
    .replace(/\.[^.]+$/, "");
  for (const width of [480, 960]) {
    const image = sharp(new URL(path, root).pathname).resize({
      width,
      withoutEnlargement: true,
    });
    await image
      .clone()
      .webp({ quality: 78 })
      .toFile(
        new URL(`images/responsive/${stem}-${width}.webp`, root).pathname,
      );
    await image
      .clone()
      .avif({ quality: 45, effort: 4 })
      .toFile(
        new URL(`images/responsive/${stem}-${width}.avif`, root).pathname,
      );
  }
}
console.log(`Prepared responsive images for ${paths.size} photographs.`);
