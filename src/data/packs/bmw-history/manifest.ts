import type { ModelFamily, Photo, Source } from "../../../domain/catalog";

export type HistoryCoverageStatus = "index" | "overview" | "detailed";

export interface BMWHistoryItem {
  id: string;
  family: string;
  version: string;
  generationId: string | null;
  status: HistoryCoverageStatus;
  production: { from: string; to: string };
  aliases: string[];
  sourceIds: string[];
  missingFields: string[];
}

// T28 grows one archived body at a time. The list is progress state, not a
// claim that the historical BMW catalogue is complete.
export const bmwHistoryInventory: BMWHistoryItem[] = [
  {
    id: "bmw-history-isetta-standard",
    family: "Isetta",
    version: "Standard",
    generationId: "bmw-isetta-standard",
    status: "detailed",
    production: { from: "1955-03", to: "1957-02" },
    aliases: ["Isetta 250 Standard", "Isetta 300 Standard"],
    sourceIds: [
      "bmw-isetta-standard-classic",
      "bmw-isetta-250-standard-classic",
      "bmw-isetta-300-standard-classic",
    ],
    missingFields: [
      "завод и география сборки",
      "крутящий момент и коробка передач",
      "кабриолет на базе Standard",
    ],
  },
  {
    id: "bmw-history-isetta-export",
    family: "Isetta",
    version: "Export",
    generationId: "bmw-isetta-export",
    status: "detailed",
    production: { from: "1956-11", to: "1962-05" },
    aliases: ["Isetta 250 Export", "Isetta 300 Export"],
    sourceIds: [
      "bmw-isetta-export-classic",
      "bmw-isetta-250-export-classic",
      "bmw-isetta-300-export-classic",
    ],
    missingFields: [
      "завод и география сборки",
      "крутящий момент и коробка передач",
      "трёхколёсная версия, кабриолет и Pick-up",
    ],
  },
];

const acceptedLicense =
  /^(Public domain|CC0( 1\.0)?|CC BY(-SA)? \d\.\d( [a-z]{2})?|Редакционная визуализация)$/;

const year = (month: string) => Number(month.slice(0, 4));

export function validateBMWHistoryInventory(
  inventory: BMWHistoryItem[],
  sources: Source[],
  families: ModelFamily[],
  assets: Record<string, Photo>,
) {
  const errors: string[] = [];
  const sourceIds = new Set(sources.map((source) => source.id));
  const generations = new Map(
    families.flatMap((family) =>
      family.generations.map((generation) => [generation.id, generation]),
    ),
  );
  const ids = new Set<string>();
  for (const entry of inventory) {
    if (ids.has(entry.id)) errors.push(`duplicate history item: ${entry.id}`);
    ids.add(entry.id);
    if (
      !entry.sourceIds.length ||
      entry.sourceIds.some((id) => !sourceIds.has(id))
    )
      errors.push(`missing history source: ${entry.id}`);
    if (!entry.missingFields.length)
      errors.push(`missing history coverage report: ${entry.id}`);
    if (entry.status === "index") continue;
    const generation = entry.generationId
      ? generations.get(entry.generationId)
      : undefined;
    if (!generation) {
      errors.push(`missing history generation: ${entry.id}`);
      continue;
    }
    if (
      generation.start !== year(entry.production.from) ||
      generation.end !== year(entry.production.to)
    )
      errors.push(`history dates differ from generation: ${entry.id}`);
    if (entry.status !== "detailed") continue;
    const photo = assets[generation.id];
    if (!photo) errors.push(`missing history photo: ${entry.id}`);
    else if (!acceptedLicense.test(photo.license))
      errors.push(`unknown history photo license: ${entry.id}`);
    else if (!photo.reference || photo.reference.verifiedDetails.length < 5)
      errors.push(`unverified history photo: ${entry.id}`);
    if (!entry.aliases.length)
      errors.push(`missing history aliases: ${entry.id}`);
  }
  return errors;
}
