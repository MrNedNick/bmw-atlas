import type { ModelFamily, Source } from "../../../domain/catalog";
import type { Photo } from "../../../domain/catalog";

export type CoverageStatus = "index" | "overview" | "detailed";

export interface SeriesInventoryItem {
  id: string;
  series: "1" | "2" | "4" | "6" | "7" | "8";
  lineage: string;
  generationKey: string;
  chassisCodes: string[];
  bodyStyles: string[];
  status: CoverageStatus;
  generationId: string | null;
  aliases: string[];
  sourceIds: string[];
  missingFields: string[];
  continuity: "continuous" | "new-lineage" | "restart-after-gap";
}

const row = (item: Omit<SeriesInventoryItem, "id">): SeriesInventoryItem => ({
  id: `bmw-series-${item.series}-${item.generationKey}`,
  ...item,
});

const overview = (
  series: "1" | "7",
  generationKey: string,
  chassisCodes: string[],
  generationId: string,
  sourceIds: string[],
  bodyStyles: string[],
  missingFields: string[],
): SeriesInventoryItem =>
  row({
    series,
    lineage: `${series} Series`,
    generationKey,
    chassisCodes,
    bodyStyles,
    status: "overview",
    generationId,
    aliases: chassisCodes,
    sourceIds,
    missingFields,
    continuity: "continuous",
  });

const indexed = (
  series: "2" | "4" | "6" | "8",
  lineage: string,
  generationKey: string,
  chassisCodes: string[],
  bodyStyles: string[],
  sourceIds: string[],
  continuity: SeriesInventoryItem["continuity"] = "continuous",
): SeriesInventoryItem =>
  row({
    series,
    lineage,
    generationKey,
    chassisCodes,
    bodyStyles,
    status: "index",
    generationId: null,
    aliases: chassisCodes,
    sourceIds,
    missingFields: [
      "проверенные даты производства",
      "фотография точного кузова и лицензия",
      "двигатели по рынкам и годам",
      "рестайлинги",
      "география производства",
    ],
    continuity,
  });

export const bmwSeriesInventory: SeriesInventoryItem[] = [
  overview(
    "1",
    "e8x",
    ["E81", "E82", "E87", "E88"],
    "bmw-1-e8x",
    ["bmw-1-production"],
    ["Хэтчбек", "Купе", "Кабриолет"],
    ["двигатели по рынкам", "рестайлинг с отдельным изображением"],
  ),
  overview(
    "1",
    "f20-f21",
    ["F20", "F21"],
    "bmw-1-f20",
    ["bmw-1-f20-launch", "bmw-1-f20-update"],
    ["Хэтчбек"],
    ["изображение дорестайлинга", "география по периодам"],
  ),
  overview(
    "1",
    "f40",
    ["F40"],
    "bmw-1-f40",
    ["bmw-1-f40-launch", "bmw-1-leipzig-production"],
    ["Хэтчбек"],
    ["рестайлинги", "двигатели по рынкам"],
  ),
  overview(
    "1",
    "f70",
    ["F70"],
    "bmw-1-f70",
    ["bmw-1-f70-launch", "bmw-1-f70-production"],
    ["Хэтчбек"],
    ["оценки безопасности", "полный список двигателей"],
  ),

  indexed(
    "2",
    "2 Series Coupé",
    "f22",
    ["F22"],
    ["Купе"],
    ["bmw-2-series-index"],
    "new-lineage",
  ),
  indexed(
    "2",
    "2 Series Coupé",
    "g42",
    ["G42"],
    ["Купе"],
    ["bmw-2-g42-update"],
  ),
  indexed(
    "2",
    "2 Series Active Tourer",
    "f45",
    ["F45"],
    ["Active Tourer"],
    ["bmw-2-f45-launch"],
    "new-lineage",
  ),
  indexed(
    "2",
    "2 Series Active Tourer",
    "u06",
    ["U06"],
    ["Active Tourer"],
    ["bmw-2-series-index"],
  ),
  indexed(
    "2",
    "2 Series Gran Tourer",
    "f46",
    ["F46"],
    ["Gran Tourer"],
    ["bmw-2-f45-f46-update"],
    "new-lineage",
  ),
  indexed(
    "2",
    "2 Series Gran Coupé",
    "f44",
    ["F44"],
    ["Gran Coupé"],
    ["bmw-2-f44-launch"],
    "new-lineage",
  ),
  indexed(
    "2",
    "2 Series Gran Coupé",
    "f74",
    ["F74"],
    ["Gran Coupé"],
    ["bmw-2-f74-launch"],
  ),

  indexed(
    "4",
    "4 Series",
    "f3x",
    ["F32", "F33", "F36"],
    ["Купе", "Кабриолет", "Gran Coupé"],
    ["bmw-4-first-generation"],
    "new-lineage",
  ),
  indexed(
    "4",
    "4 Series",
    "g2x",
    ["G22", "G23", "G26"],
    ["Купе", "Кабриолет", "Gran Coupé"],
    ["bmw-4-second-generation"],
  ),

  indexed(
    "6",
    "6 Series",
    "e24",
    ["E24"],
    ["Купе"],
    ["bmw-6-e24-classic"],
    "new-lineage",
  ),
  indexed(
    "6",
    "6 Series",
    "e63-e64",
    ["E63", "E64"],
    ["Купе", "Кабриолет"],
    ["bmw-6-modern-history"],
    "restart-after-gap",
  ),
  indexed(
    "6",
    "6 Series",
    "f06-f12-f13",
    ["F06", "F12", "F13"],
    ["Gran Coupé", "Кабриолет", "Купе"],
    ["bmw-6-f-series-update"],
  ),
  indexed(
    "6",
    "6 Series Gran Turismo",
    "g32",
    ["G32"],
    ["Gran Turismo"],
    ["bmw-6-g32-launch"],
    "new-lineage",
  ),

  overview(
    "7",
    "e23",
    ["E23"],
    "bmw-7-e23",
    ["bmw-7-history", "bmw-7-generations"],
    ["Седан"],
    ["двигатели", "рестайлинги", "тираж поколения"],
  ),
  overview(
    "7",
    "e32",
    ["E32"],
    "bmw-7-e32",
    ["bmw-7-history", "bmw-7-generations"],
    ["Седан", "Длиннобазный седан"],
    ["двигатели", "рестайлинги", "тираж поколения"],
  ),
  overview(
    "7",
    "e38",
    ["E38"],
    "bmw-7-e38",
    ["bmw-7-history", "bmw-7-generations"],
    ["Седан", "Длиннобазный седан"],
    ["двигатели", "рестайлинги", "тираж поколения"],
  ),
  overview(
    "7",
    "e65-e66",
    ["E65", "E66"],
    "bmw-7-e65",
    ["bmw-7-history", "bmw-7-e65-update"],
    ["Седан", "Длиннобазный седан"],
    ["изображение дорестайлинга", "двигатели по рынкам"],
  ),
  overview(
    "7",
    "f01-f02",
    ["F01", "F02"],
    "bmw-7-f01",
    ["bmw-7-history", "bmw-7-f01-update"],
    ["Седан", "Длиннобазный седан"],
    ["изображение дорестайлинга", "двигатели по рынкам"],
  ),
  overview(
    "7",
    "g11-g12",
    ["G11", "G12"],
    "bmw-7-g11",
    ["bmw-7-g11-launch", "bmw-7-g11-update"],
    ["Седан", "Длиннобазный седан"],
    ["изображение дорестайлинга", "оценки безопасности"],
  ),
  row({
    series: "7",
    lineage: "7 Series / i7",
    generationKey: "g70",
    chassisCodes: ["G70"],
    bodyStyles: ["Длиннобазный седан"],
    status: "detailed",
    generationId: "bmw-7-g70",
    aliases: ["G70", "i7", "740i", "760i", "M760e"],
    sourceIds: ["bmw-7-g70-launch", "bmw-7-g70-update"],
    missingFields: [
      "полный перечень двигателей по рынкам",
      "оценки безопасности",
      "тираж поколения",
      "отдельное изображение обновления 2026 года",
    ],
    continuity: "continuous",
  }),

  indexed(
    "8",
    "8 Series",
    "e31",
    ["E31"],
    ["Купе"],
    ["bmw-8-e31-history"],
    "new-lineage",
  ),
  indexed(
    "8",
    "8 Series",
    "g1x",
    ["G14", "G15", "G16"],
    ["Кабриолет", "Купе", "Gran Coupé"],
    ["bmw-8-g-series-update"],
    "restart-after-gap",
  ),
];

export function validateSeriesInventory(
  inventory: SeriesInventoryItem[],
  sources: Source[],
  families: ModelFamily[],
  assets: Record<string, Photo>,
) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const generationKeys = new Set<string>();
  const sourceIds = new Set(sources.map((source) => source.id));
  const generations = new Map(
    families.flatMap((family) =>
      family.generations.map(
        (generation) => [generation.id, generation] as const,
      ),
    ),
  );

  for (const item of inventory) {
    if (ids.has(item.id)) errors.push(`duplicate series item: ${item.id}`);
    ids.add(item.id);
    const lineageKey = `${item.series}:${item.generationKey}`;
    if (generationKeys.has(lineageKey))
      errors.push(`body split counted as another generation: ${lineageKey}`);
    generationKeys.add(lineageKey);
    if (!item.chassisCodes.length || !item.bodyStyles.length)
      errors.push(`unscoped series item: ${item.id}`);
    if (
      !item.sourceIds.length ||
      item.sourceIds.some((id) => !sourceIds.has(id))
    )
      errors.push(`missing source dossier: ${item.id}`);
    if (!item.missingFields.length)
      errors.push(`missing coverage report: ${item.id}`);

    if (item.status !== "index") {
      if (!item.generationId || !generations.has(item.generationId))
        errors.push(`missing catalogue generation: ${item.id}`);
    }
    if (item.status === "detailed") {
      if (!item.aliases.length)
        errors.push(`missing detailed aliases: ${item.id}`);
      if (!item.generationId || !assets[item.generationId])
        errors.push(`missing detailed photo: ${item.id}`);
      const generation = item.generationId
        ? generations.get(item.generationId)
        : undefined;
      if (!generation?.dateScope || !generation.source)
        errors.push(`missing detailed dates: ${item.id}`);
    }
  }

  const e31 = inventory.find((item) => item.id === "bmw-series-8-e31");
  const modernEight = inventory.find((item) => item.id === "bmw-series-8-g1x");
  if (!e31 || modernEight?.continuity !== "restart-after-gap")
    errors.push("8 Series production gap is not preserved");

  return errors;
}
