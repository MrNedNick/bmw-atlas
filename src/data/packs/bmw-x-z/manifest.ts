import type { ModelFamily, Photo, Source } from "../../../domain/catalog";

export type XZCoverageStatus = "index" | "overview" | "detailed";
export type VisualPhaseKind = "launch" | "facelift";
export type VisualStatus = "available" | "needed";

export interface VisualPhase {
  id: string;
  kind: VisualPhaseKind;
  label: string;
  from: number;
  to: number | null;
  status: VisualStatus;
  sourceIds: string[];
}

export interface BMWXZInventoryItem {
  id: string;
  family:
    | "X1"
    | "X2"
    | "X3"
    | "X4"
    | "X5"
    | "X6"
    | "X7"
    | "Z1"
    | "Z3"
    | "Z4"
    | "Z8";
  lineage: string;
  generationKey: string;
  chassisCodes: string[];
  production: { from: number; to: number | null };
  bodyStyles: string[];
  status: XZCoverageStatus;
  generationId: string | null;
  aliases: string[];
  sourceIds: string[];
  visualPhases: VisualPhase[];
  mDerivativeIds: string[];
  electricDerivativeIds: string[];
  relatedVariants: string[];
  missingFields: string[];
}

type Seed = Omit<
  BMWXZInventoryItem,
  "id" | "visualPhases" | "missingFields"
> & {
  facelifts?: Array<{ year: number; label?: string; sourceIds?: string[] }>;
};

const item = (seed: Seed): BMWXZInventoryItem => {
  const launch: VisualPhase = {
    id: `${seed.family.toLowerCase()}-${seed.generationKey}-launch`,
    kind: "launch",
    label: "Дорестайлинг",
    from: seed.production.from,
    to: seed.facelifts?.[0] ? seed.facelifts[0].year - 1 : seed.production.to,
    status: seed.generationId ? "available" : "needed",
    sourceIds: seed.sourceIds,
  };
  const faceliftPhases = (seed.facelifts ?? []).map((facelift, index, all) => ({
    id: `${seed.family.toLowerCase()}-${seed.generationKey}-lci-${facelift.year}`,
    kind: "facelift" as const,
    label: facelift.label ?? `Рестайлинг ${facelift.year}`,
    from: facelift.year,
    to: all[index + 1]?.year ? all[index + 1].year - 1 : seed.production.to,
    status: "needed" as const,
    sourceIds: facelift.sourceIds ?? seed.sourceIds,
  }));
  return {
    id: `bmw-x-z-${seed.family.toLowerCase()}-${seed.generationKey}`,
    ...seed,
    visualPhases: [launch, ...faceliftPhases],
    missingFields: [
      ...(seed.generationId ? [] : ["полная карточка поколения"]),
      ...[launch, ...faceliftPhases]
        .filter((phase) => phase.status === "needed")
        .map((phase) => `изображение: ${phase.label}`),
      "двигатели по рынкам и годам",
      "производство по заводам и периодам",
      "оценки безопасности с годом протокола",
    ],
  };
};

const x = (
  family: Seed["family"],
  generationKey: string,
  chassisCodes: string[],
  from: number,
  to: number | null,
  sourceIds: string[],
  options: Partial<
    Omit<
      Seed,
      "family" | "generationKey" | "chassisCodes" | "production" | "sourceIds"
    >
  > = {},
) =>
  item({
    family,
    lineage: family,
    generationKey,
    chassisCodes,
    production: { from, to },
    bodyStyles: family.startsWith("Z")
      ? ["Родстер"]
      : [family === "X2" || family === "X4" || family === "X6" ? "SAC" : "SAV"],
    status: "index",
    generationId: null,
    aliases: chassisCodes,
    sourceIds,
    mDerivativeIds: [],
    electricDerivativeIds: [],
    relatedVariants: [],
    ...options,
  });

export const bmwXZInventory: BMWXZInventoryItem[] = [
  x("X1", "e84", ["E84"], 2009, 2015, ["bmw-x-history", "bmw-x1-e84-update"], {
    facelifts: [{ year: 2012, sourceIds: ["bmw-x1-e84-update"] }],
  }),
  x(
    "X1",
    "f48",
    ["F48", "F49"],
    2015,
    2022,
    ["bmw-x1-f48-launch", "bmw-x1-f48-update"],
    {
      facelifts: [{ year: 2019, sourceIds: ["bmw-x1-f48-update"] }],
      relatedVariants: ["F49 · длинная база · Китай"],
    },
  ),
  x("X1", "u11", ["U11", "U12"], 2022, null, ["bmw-x1-u11-launch"], {
    electricDerivativeIds: ["iX1 U11"],
    relatedVariants: ["U12 · длинная база · Китай"],
  }),
  x("X2", "f39", ["F39"], 2017, 2023, ["bmw-x2-f39-launch"], {
    electricDerivativeIds: [],
    mDerivativeIds: ["X2 M35i · M Performance"],
  }),
  x("X2", "u10", ["U10"], 2023, null, ["bmw-x2-u10-launch"], {
    electricDerivativeIds: ["iX2 U10"],
    mDerivativeIds: ["X2 M35i · M Performance"],
  }),
  x("X3", "e83", ["E83"], 2003, 2010, ["bmw-x3-history", "bmw-x3-e83-update"], {
    status: "overview",
    generationId: "bmw-x3-e83",
    facelifts: [{ year: 2006, sourceIds: ["bmw-x3-e83-update"] }],
  }),
  x(
    "X3",
    "f25",
    ["F25"],
    2010,
    2017,
    ["bmw-x3-f25-launch", "bmw-x3-f25-update"],
    {
      status: "overview",
      generationId: "bmw-x3-f25",
      facelifts: [{ year: 2014, sourceIds: ["bmw-x3-f25-update"] }],
    },
  ),
  x(
    "X3",
    "g01",
    ["G01", "G08"],
    2017,
    2024,
    ["bmw-x3-g01-launch", "bmw-x3-g01-update"],
    {
      status: "overview",
      generationId: "bmw-x3-g01",
      facelifts: [{ year: 2021, sourceIds: ["bmw-x3-g01-update"] }],
      mDerivativeIds: ["X3 M F97"],
      electricDerivativeIds: ["iX3 G08"],
      relatedVariants: ["G08 · Китай / iX3"],
    },
  ),
  x("X3", "g45", ["G45"], 2024, null, ["bmw-x3-g45-launch"], {
    status: "overview",
    generationId: "bmw-x3-g45",
    mDerivativeIds: ["X3 M50 · M Performance"],
  }),
  x("X4", "f26", ["F26"], 2014, 2018, ["bmw-x4-f26-launch"]),
  x(
    "X4",
    "g02",
    ["G02"],
    2018,
    2025,
    ["bmw-x4-g02-launch", "bmw-x3-g01-update"],
    {
      facelifts: [{ year: 2021, sourceIds: ["bmw-x3-g01-update"] }],
      mDerivativeIds: ["X4 M F98"],
    },
  ),
  x("X5", "e53", ["E53"], 1999, 2006, ["bmw-x-history", "bmw-x5-e53-update"], {
    status: "overview",
    generationId: "bmw-x5-e53",
    facelifts: [{ year: 2003, sourceIds: ["bmw-x5-e53-update"] }],
  }),
  x("X5", "e70", ["E70"], 2006, 2013, ["bmw-x-history", "bmw-x5-e70-update"], {
    status: "overview",
    generationId: "bmw-x5-e70",
    facelifts: [{ year: 2010, sourceIds: ["bmw-x5-e70-update"] }],
    mDerivativeIds: ["X5 M E70"],
  }),
  x("X5", "f15", ["F15"], 2013, 2018, ["bmw-x5-f15-launch"], {
    status: "overview",
    generationId: "bmw-x5-f15",
    mDerivativeIds: ["X5 M F85"],
  }),
  x(
    "X5",
    "g05",
    ["G05", "G18"],
    2018,
    2026,
    ["bmw-x5-g05-launch", "bmw-x5-g05-update", "bmw-x5-g18-china"],
    {
      status: "overview",
      generationId: "bmw-x5-g05",
      facelifts: [{ year: 2023, sourceIds: ["bmw-x5-g05-update"] }],
      mDerivativeIds: ["X5 M F95"],
      relatedVariants: ["G18 · длинная база · Китай"],
    },
  ),
  x(
    "X5",
    "g65",
    ["G65"],
    2026,
    null,
    ["bmw-x5-g65-launch", "bmw-x5-five-generations"],
    {
      status: "detailed",
      generationId: "bmw-x5-g65",
      electricDerivativeIds: ["iX5 G65", "iX5 Hydrogen · заявлен на 2028"],
    },
  ),
  x(
    "X6",
    "e71",
    ["E71"],
    2008,
    2014,
    ["bmw-x6-e71-launch", "bmw-x6-e71-update"],
    {
      facelifts: [{ year: 2012, sourceIds: ["bmw-x6-e71-update"] }],
      mDerivativeIds: ["X6 M E71"],
    },
  ),
  x("X6", "f16", ["F16"], 2014, 2019, ["bmw-x6-f16-launch"], {
    mDerivativeIds: ["X6 M F86"],
  }),
  x(
    "X6",
    "g06",
    ["G06"],
    2019,
    null,
    ["bmw-x6-g06-launch", "bmw-x5-g05-update"],
    {
      facelifts: [{ year: 2023, sourceIds: ["bmw-x5-g05-update"] }],
      mDerivativeIds: ["X6 M F96"],
    },
  ),
  x(
    "X7",
    "g07",
    ["G07"],
    2018,
    null,
    ["bmw-x7-g07-launch", "bmw-x7-g07-update"],
    {
      facelifts: [{ year: 2022, sourceIds: ["bmw-x7-g07-update"] }],
      mDerivativeIds: ["X7 M60i · M Performance"],
    },
  ),
  x(
    "Z1",
    "z1",
    ["Z1", "E30 (архивное обозначение)"],
    1988,
    1991,
    ["bmw-z1-classic"],
    { aliases: ["Z1", "BMW Technik Z1"] },
  ),
  x("Z3", "e36-7-e36-8", ["E36/7", "E36/8"], 1995, 2002, ["bmw-z3-classic"], {
    bodyStyles: ["Родстер", "Купе"],
    facelifts: [{ year: 1999, sourceIds: ["bmw-z3-classic"] }],
    mDerivativeIds: ["Z3 M Roadster", "Z3 M Coupé"],
  }),
  x(
    "Z4",
    "e85-e86",
    ["E85", "E86"],
    2002,
    2008,
    ["bmw-z4-history", "bmw-z4-e85-update"],
    {
      bodyStyles: ["Родстер", "Купе"],
      facelifts: [{ year: 2006, sourceIds: ["bmw-z4-e85-update"] }],
      mDerivativeIds: ["Z4 M Roadster E85", "Z4 M Coupé E86"],
    },
  ),
  x(
    "Z4",
    "e89",
    ["E89"],
    2009,
    2016,
    ["bmw-z4-e89-launch", "bmw-z4-e89-update"],
    { facelifts: [{ year: 2013, sourceIds: ["bmw-z4-e89-update"] }] },
  ),
  x(
    "Z4",
    "g29",
    ["G29"],
    2018,
    2026,
    ["bmw-z4-g29-history", "bmw-z4-g29-update"],
    {
      facelifts: [
        {
          year: 2022,
          label: "Обновление модельного года 2023",
          sourceIds: ["bmw-z4-g29-update"],
        },
      ],
      mDerivativeIds: ["Z4 M40i · M Performance"],
    },
  ),
  x("Z8", "e52", ["E52"], 1999, 2003, ["bmw-z8-classic"], {
    aliases: ["Z8", "E52", "Alpina Roadster V8 · связанная модель"],
  }),
];

export const bmwXZImageTasks = bmwXZInventory.flatMap((entry) =>
  entry.visualPhases
    .filter((phase) => phase.status === "needed")
    .map((phase) => ({
      id: phase.id,
      family: entry.family,
      generationKey: entry.generationKey,
      chassisCodes: entry.chassisCodes,
      phase: phase.label,
      years: `${phase.from}–${phase.to ?? "н. в."}`,
      bodyStyles: entry.bodyStyles,
      sourceIds: phase.sourceIds,
      outputFile: `public/images/editorial-bmw-${entry.family.toLowerCase()}-${entry.generationKey}-${phase.kind === "launch" ? "pre" : `lci-${phase.from}`}.webp`,
    })),
);

export function validateBMWXZInventory(
  inventory: BMWXZInventoryItem[],
  sources: Source[],
  families: ModelFamily[],
  assets: Record<string, Photo>,
) {
  const errors: string[] = [];
  const sourceIds = new Set(sources.map((source) => source.id));
  const generationIds = new Set(
    families.flatMap((family) =>
      family.generations.map((generation) => generation.id),
    ),
  );
  const ids = new Set<string>();
  for (const entry of inventory) {
    if (ids.has(entry.id)) errors.push(`duplicate X/Z item: ${entry.id}`);
    ids.add(entry.id);
    if (
      !entry.sourceIds.length ||
      entry.sourceIds.some((id) => !sourceIds.has(id))
    )
      errors.push(`missing X/Z source dossier: ${entry.id}`);
    if (
      !entry.aliases.length ||
      !entry.chassisCodes.length ||
      !entry.bodyStyles.length
    )
      errors.push(`unscoped X/Z item: ${entry.id}`);
    if (!entry.visualPhases.length || entry.visualPhases[0].kind !== "launch")
      errors.push(`missing X/Z launch phase: ${entry.id}`);
    for (const phase of entry.visualPhases) {
      if (
        phase.from < entry.production.from ||
        (entry.production.to !== null && phase.from > entry.production.to)
      )
        errors.push(`visual phase outside production: ${phase.id}`);
      if (
        !phase.sourceIds.length ||
        phase.sourceIds.some((id) => !sourceIds.has(id))
      )
        errors.push(`missing visual phase source: ${phase.id}`);
    }
    if (
      entry.status !== "index" &&
      (!entry.generationId || !generationIds.has(entry.generationId))
    )
      errors.push(`missing X/Z catalogue generation: ${entry.id}`);
    if (
      entry.status === "detailed" &&
      (!entry.generationId || !assets[entry.generationId])
    )
      errors.push(`missing detailed X/Z photo: ${entry.id}`);
    if (!entry.missingFields.length)
      errors.push(`missing X/Z coverage report: ${entry.id}`);
  }
  const required = [
    "X1",
    "X2",
    "X3",
    "X4",
    "X5",
    "X6",
    "X7",
    "Z1",
    "Z3",
    "Z4",
    "Z8",
  ];
  for (const family of required)
    if (!inventory.some((entry) => entry.family === family))
      errors.push(`missing X/Z family: ${family}`);
  return errors;
}
