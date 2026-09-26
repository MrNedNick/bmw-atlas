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

const archiveGaps = [
  "карточка кузова с поколением и фотографией",
  "фотография точного кузова и лицензия",
  "завод и география сборки",
];

// Inventory row: dates come from BMW Group Classic model pages; a year
// without a month means the archive page only gives year precision.
const indexed = (
  key: string,
  family: string,
  version: string,
  production: BMWHistoryItem["production"],
  aliases: string[],
  sourceIds: string[],
  missingFields: string[] = [],
): BMWHistoryItem => ({
  id: `bmw-history-${key}`,
  family,
  version,
  generationId: null,
  status: "index",
  production,
  aliases,
  sourceIds,
  missingFields: [...missingFields, ...archiveGaps],
});

// Archived bodies that already have a card: generation, photo and the fields
// still missing from it. Everything else stays an index row.
const detailedBodies: Record<
  string,
  { generationId: string; missingFields: string[] }
> = {
  "bmw-history-328": {
    generationId: "bmw-328-roadster",
    missingFields: [
      "месяцы начала и конца выпуска",
      "тираж",
      "завод и география сборки",
      "крутящий момент и коробка передач",
    ],
  },
  "bmw-history-503": {
    generationId: "bmw-503-coupe-cabriolet",
    missingFields: [
      "фотография купе",
      "месяцы выпуска Coupé",
      "завод и география сборки",
      "крутящий момент и коробка передач",
    ],
  },
};

// T28 grows one archived body at a time. The list is progress state, not a
// claim that the historical BMW catalogue is complete.
const inventoryRows: BMWHistoryItem[] = [
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
  indexed(
    "3-15-da-2",
    "3/15 PS",
    "DA 2",
    { from: "1929-03", to: "1930-11" },
    ["3/15 DA 2", "DA 2"],
    ["bmw-classic-3-15-ps-da-2-sedan"],
    ["периоды кузовов Tourer, Cabriolet и Sport"],
  ),
  indexed(
    "3-15-da-3",
    "3/15 PS",
    "DA 3 Wartburg",
    { from: "1930-04", to: "1931-01" },
    ["3/15 DA 3", "Wartburg"],
    ["bmw-classic-3-15-ps-da-3-type-wartburg"],
  ),
  indexed(
    "3-15-da-4",
    "3/15 PS",
    "DA 4",
    { from: "1931-01", to: "1932-02" },
    ["3/15 DA 4", "DA 4"],
    ["bmw-classic-3-15-ps-da-4-sedan"],
    ["периоды кузовов Coupé, Phaeton и Sport"],
  ),
  indexed(
    "3-20-am",
    "3/20 PS",
    "AM 1–4",
    { from: "1932-03", to: "1934-04" },
    ["3/20", "AM 1", "AM 4"],
    ["bmw-classic-3-20-ps-am-1-4-sedan", "bmw-classic-3-20-ps-am-1-4-tourer"],
    ["границы серий AM 1 — AM 4"],
  ),
  indexed(
    "303",
    "303",
    "Sedan и открытые кузова",
    { from: "1933-05", to: "1934-05" },
    ["BMW 303"],
    ["bmw-classic-303-sedan"],
  ),
  indexed(
    "309",
    "309",
    "Sedan и открытые кузова",
    { from: "1934-02", to: "1936-06" },
    ["BMW 309"],
    ["bmw-classic-309-sedan"],
  ),
  indexed(
    "315",
    "315",
    "Sedan, открытые кузова и 315/1",
    { from: "1934-04", to: "1936-10" },
    ["BMW 315", "315/1"],
    ["bmw-classic-315-sedan", "bmw-classic-315-1-sports-car"],
  ),
  indexed(
    "319",
    "319",
    "Sedan, открытые кузова и 319/1",
    { from: "1934-09", to: "1937-05" },
    ["BMW 319", "319/1"],
    ["bmw-classic-319-sedan", "bmw-classic-319-1-sports-car"],
  ),
  indexed(
    "326",
    "326",
    "Sedan и Convertible",
    { from: "1936-02", to: "1941-04" },
    ["BMW 326"],
    ["bmw-classic-326-sedan"],
  ),
  indexed(
    "327",
    "327",
    "Sports Convertible, Sports Coupé и 327/28",
    { from: "1937-07", to: "1941-04" },
    ["BMW 327", "327/28"],
    [
      "bmw-classic-327-sports-convertible",
      "bmw-classic-327-sports-coupe",
      "bmw-classic-327-28-sports-coupe",
    ],
  ),
  indexed(
    "328",
    "328",
    "Roadster",
    { from: "1936", to: "1940" },
    ["BMW 328", "328 Roadster"],
    ["bmw-classic-328"],
    ["месяцы начала и конца выпуска", "тираж"],
  ),
  indexed(
    "320",
    "320",
    "Sedan и Convertible",
    { from: "1937-02", to: "1938-12" },
    ["BMW 320 (1937)"],
    ["bmw-classic-320-sedan"],
  ),
  indexed(
    "321",
    "321",
    "Sedan и Convertible",
    { from: "1938-12", to: "1941-04" },
    ["BMW 321"],
    ["bmw-classic-321-sedan"],
  ),
  indexed(
    "335",
    "335",
    "Sedan и Convertible",
    { from: "1939-01", to: "1940-12" },
    ["BMW 335"],
    ["bmw-classic-335-sedan"],
  ),
  indexed(
    "501-502",
    "501/502",
    "Sedan, включая 2600 и 3200 L/S",
    { from: "1952-11", to: "1963-12" },
    ["BMW 501", "BMW 502", "Barockengel", "2600", "3200 S"],
    [
      "bmw-classic-501",
      "bmw-classic-501-six-cylinder",
      "bmw-classic-502",
      "bmw-classic-502-3-2-litre",
      "bmw-classic-2600",
      "bmw-classic-3200-s",
    ],
    ["кузова Coupé и Cabriolet от сторонних ателье", "тираж по версиям"],
  ),
  indexed(
    "503",
    "503",
    "Coupé и Convertible",
    { from: "1956-05", to: "1960-05" },
    ["BMW 503"],
    ["bmw-classic-503-convertible", "bmw-classic-503-coupe"],
    ["месяцы выпуска Coupé", "тираж"],
  ),
  indexed(
    "507",
    "507",
    "Roadster",
    { from: "1956-12", to: "1959-12" },
    ["BMW 507"],
    ["bmw-classic-507"],
    ["тираж и серии 1/2"],
  ),
  indexed(
    "3200-cs",
    "3200 CS",
    "Coupé Bertone",
    { from: "1962", to: "1965" },
    ["BMW 3200 CS", "Bertone"],
    ["bmw-classic-3200-cs"],
    ["месяцы начала и конца выпуска", "тираж"],
  ),
  indexed(
    "600",
    "600",
    "Sedan",
    { from: "1957-09", to: "1959-11" },
    ["BMW 600"],
    ["bmw-classic-600"],
  ),
  indexed(
    "700-coupe",
    "700",
    "Coupé, Sport и CS",
    { from: "1959-07", to: "1964-06" },
    ["700 Coupé", "700 Sport", "700 CS"],
    ["bmw-classic-700-coupe", "bmw-classic-700-sport", "bmw-classic-700-cs"],
    ["700 Cabriolet"],
  ),
  indexed(
    "700-sedan",
    "700",
    "Sedan и Luxus",
    { from: "1959-09", to: "1962-04" },
    ["700 Sedan", "700 Luxus"],
    ["bmw-classic-700-sedan", "bmw-classic-700-luxus"],
    [
      "700 LS с удлинённой базой: нет страницы в каталоге BMW Group Classic, конец выпуска ветви указан только по Sedan и Luxus",
    ],
  ),
  indexed(
    "neue-klasse-sedan",
    "Neue Klasse",
    "Sedan 1500–2000",
    { from: "1962-02", to: "1972-01" },
    ["Neue Klasse", "1500", "1800", "2000 tilux"],
    [
      "bmw-classic-1500",
      "bmw-classic-1600",
      "bmw-classic-1800",
      "bmw-classic-2000",
      "bmw-classic-2000-tilux",
    ],
    ["версии TI, TI/SA и tii", "тираж по версиям"],
  ),
  indexed(
    "neue-klasse-coupe",
    "Neue Klasse",
    "Coupé 2000 C/CS",
    { from: "1965-09", to: "1970-02" },
    ["2000 CS", "2000 C", "2000 CA"],
    ["bmw-classic-2000-cs", "bmw-classic-2000-c-bmw-2000-ca"],
  ),
  indexed(
    "02-sedan",
    "02",
    "двухдверный Sedan",
    { from: "1966-03", to: "1977-07" },
    ["1602", "2002", "2002 tii", "2002 turbo", "1502"],
    [
      "bmw-classic-1602",
      "bmw-classic-2002",
      "bmw-classic-2002-turbo",
      "bmw-classic-1502",
    ],
    ["рестайлинг 1973 с отдельной фотографией", "тираж по версиям"],
  ),
  indexed(
    "02-touring",
    "02",
    "Touring",
    { from: "1971-04", to: "1974-04" },
    ["1602 Touring", "1802 Touring", "2002 Touring"],
    [
      "bmw-classic-1600-touring-1602-touring",
      "bmw-classic-1800-touring-1802-touring",
      "bmw-classic-touring-2000-2002-touring",
    ],
  ),
  indexed(
    "02-convertible",
    "02",
    "Cabriolet 1600 и 2002 Baur",
    { from: "1968-01", to: "1976-01" },
    ["1600 Cabriolet", "2002 Baur"],
    [
      "bmw-classic-1600-convertible",
      "bmw-classic-2002-baur-convertible-with-roll-over-bar",
    ],
    ["полностью открытый 2002 Baur 1971 года"],
  ),
  indexed(
    "e3",
    "E3",
    "Sedan 2500–3.3 Li",
    { from: "1968-08", to: "1977-02" },
    ["E3", "2500", "2800", "3.0 Si", "3.3 Li"],
    [
      "bmw-classic-2500-e3",
      "bmw-classic-2800-e3",
      "bmw-classic-3-0-si-e3",
      "bmw-classic-3-3-li-e3",
    ],
    ["версии с длинной базой L/Li по годам", "тираж по версиям"],
  ),
  indexed(
    "e9",
    "E9",
    "Coupé 2800 CS–3.0 CSL",
    { from: "1968-12", to: "1975-11" },
    ["E9", "2800 CS", "3.0 CS", "3.0 CSi", "3.0 CSL", "2.5 CS"],
    [
      "bmw-classic-2800-cs-e9",
      "bmw-classic-3-0-cs-e9",
      "bmw-classic-2-5-cs-e9",
      "bmw-classic-3-0-csl-e9-206-hp",
    ],
    ["серии 3.0 CSL 180/200/206 л. с. по годам", "тираж по версиям"],
  ),
];

export const bmwHistoryInventory: BMWHistoryItem[] = inventoryRows.map((row) =>
  detailedBodies[row.id]
    ? { ...row, status: "detailed", ...detailedBodies[row.id] }
    : row,
);

const acceptedLicense =
  /^(Public domain|CC0( 1\.0)?|CC BY(-SA)? \d\.\d( [a-z]{2})?|Редакционная визуализация)$/;

const period = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

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
    if (
      !period.test(entry.production.from) ||
      !period.test(entry.production.to) ||
      entry.production.from > entry.production.to
    )
      errors.push(`invalid history period: ${entry.id}`);
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
