import { readStaticJson } from "../lib/static-json";
import type { ModelFamily } from "../domain/catalog";
const details = new Map<string, Promise<ModelFamily>>();
function fetchFamily(id: string): Promise<ModelFamily> {
  const cached = details.get(id);
  if (cached) return cached;
  const pending = readStaticJson<ModelFamily>(`data/families/${id}.json`)
    .then((family) => {
      if (family.id !== id || !Array.isArray(family.generations))
        throw new Error("Invalid model history");
      return family;
    })
    .catch((error) => {
      details.delete(id);
      throw error;
    });
  details.set(id, pending);
  return pending;
}
async function readIndex(): Promise<ModelFamily[]> {
  const index = await readStaticJson<ModelFamily[]>("data/family-index.json");
  const query = new URLSearchParams(location.search);
  const family = index.find((item) => item.id === query.get("model"));
  if (family) {
    void fetchFamily(family.id).catch(() => {});
    const generation =
      family.generations.find((item) => item.id === query.get("generation")) ??
      family.generations.find(
        (item) =>
          item.id ===
          (family.id === "bmw-3-series"
            ? "bmw-g20"
            : family.id === "bmw-2-coupe"
              ? "bmw-2-g42"
              : family.generations.at(-1)!.id),
      );
    if (generation?.photo) {
      const stem = generation.photo.url
        .split("/")
        .at(-1)!
        .replace(/\.[^.]+$/, "");
      const preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "image";
      preload.type = "image/avif";
      preload.imageSrcset = [480, 960]
        .map(
          (width) =>
            `${import.meta.env.BASE_URL}images/responsive/${stem}-${width}.avif ${width}w`,
        )
        .join(", ");
      preload.imageSizes = "(max-width: 900px) 100vw, 60vw";
      document.head.append(preload);
    }
  }
  return index;
}
export const families: ModelFamily[] =
  import.meta.env.MODE === "test"
    ? (await import("./models")).families
    : await readIndex();
export const allGenerations = families.flatMap((family) =>
  family.generations.map((generation) => ({ family, generation })),
);
export async function loadFamily(id: string): Promise<ModelFamily> {
  if (!families.some((family) => family.id === id))
    throw new Error("Unknown BMW family");
  return fetchFamily(id);
}
