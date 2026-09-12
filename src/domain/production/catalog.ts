import type { Factory, ProductionRun } from ".";

const location = (
  id: string,
  name: string,
  city: string,
  country: string,
  source: string,
): Factory => ({
  id,
  name,
  city,
  country,
  coordinates: null,
  source,
  locationEvidence: "production-source",
});

export const factories: Factory[] = [
  location(
    "munich",
    "BMW Group Plant Munich",
    "Мюнхен",
    "Германия",
    "bmw-production",
  ),
  location(
    "dingolfing",
    "BMW Group Plant Dingolfing",
    "Дингольфинг",
    "Германия",
    "bmw-production",
  ),
  location(
    "regensburg",
    "BMW Group Plant Regensburg",
    "Регенсбург",
    "Германия",
    "bmw-production",
  ),
  location(
    "leipzig",
    "BMW Group Plant Leipzig",
    "Лейпциг",
    "Германия",
    "bmw-1-f70-production",
  ),
  location(
    "rosslyn",
    "BMW Group Plant Rosslyn",
    "Росслин",
    "ЮАР",
    "bmw-production",
  ),
  location(
    "spartanburg",
    "BMW Manufacturing Spartanburg",
    "Спартанберг",
    "США",
    "bmw-production",
  ),
  location(
    "dadong",
    "BMW Brilliance Plant Dadong",
    "Шэньян · Дадун",
    "Китай",
    "bmw-production",
  ),
  location(
    "tiexi",
    "BMW Brilliance Plant Tiexi",
    "Шэньян · Теси",
    "Китай",
    "bmw-production",
  ),
  location(
    "san-luis-potosi",
    "BMW Group Plant San Luis Potosí",
    "Сан-Луис-Потоси",
    "Мексика",
    "bmw-production",
  ),
];

const bodiesByGeneration: Record<string, string[]> = {
  "bmw-e21": ["Седан"],
  "bmw-e30": ["Седан", "Кабриолет", "Touring", "M3 Coupé", "M3 Cabrio"],
  "bmw-e36": ["Седан", "Купе", "Кабриолет", "Touring", "Compact", "M3"],
  "bmw-e46": ["Седан", "Купе", "Кабриолет", "Touring", "Compact", "M3"],
  "bmw-e90": ["Седан", "Купе", "Кабриолет", "Touring", "M3"],
  "bmw-f30": ["Седан", "Touring", "Gran Turismo", "M3 Sedan"],
  "bmw-g20": [
    "Седан",
    "Touring",
    "M3 Sedan",
    "M3 Touring",
    "i3 Sedan (только Китай)",
  ],
};

const generationPlants: Array<{
  generationId: string;
  from: string;
  to: string | null;
  factoryIds: string[];
}> = [
  {
    generationId: "bmw-e21",
    from: "1975",
    to: "1983",
    factoryIds: ["munich", "dingolfing"],
  },
  {
    generationId: "bmw-e30",
    from: "1982",
    to: "1994",
    factoryIds: ["munich", "dingolfing", "regensburg", "rosslyn"],
  },
  {
    generationId: "bmw-e36",
    from: "1990",
    to: "2000",
    factoryIds: [
      "munich",
      "dingolfing",
      "regensburg",
      "spartanburg",
      "rosslyn",
    ],
  },
  {
    generationId: "bmw-e46",
    from: "1997",
    to: "2006",
    factoryIds: ["munich", "dingolfing", "regensburg", "rosslyn"],
  },
  {
    generationId: "bmw-e90",
    from: "2004",
    to: "2013",
    factoryIds: ["munich", "regensburg", "rosslyn", "dadong", "leipzig"],
  },
  {
    generationId: "bmw-f30",
    from: "2011",
    to: "2021",
    factoryIds: ["munich", "dingolfing", "regensburg", "rosslyn", "tiexi"],
  },
  {
    generationId: "bmw-g20",
    from: "2018",
    to: null,
    factoryIds: ["munich", "tiexi", "san-luis-potosi"],
  },
];

const series3Runs: ProductionRun[] = generationPlants.flatMap((entry) =>
  entry.factoryIds.map((factoryId) => ({
    id: `${entry.generationId}-${factoryId}`,
    generationId: entry.generationId,
    factoryId,
    from: entry.from,
    to: entry.to,
    datePrecision: "year",
    region: "Полные заводы мировой производственной сети BMW",
    bodies: {
      status: "known",
      values: bodiesByGeneration[entry.generationId],
      appliesTo: "generation",
    },
    assemblyType: "full",
    source: "bmw-production",
    note: "Источник перечисляет кузова и заводы на уровне поколения; распределение отдельных кузовов между заводами не детализировано.",
  })),
);

export const productionRuns: ProductionRun[] = [
  ...series3Runs,
  {
    id: "bmw-1-f70-leipzig",
    generationId: "bmw-1-f70",
    factoryId: "leipzig",
    from: "2024-07-01",
    to: null,
    datePrecision: "day",
    region: "Мировое производство",
    bodies: {
      status: "known",
      values: ["Пятидверный хэтчбек"],
      appliesTo: "factory",
    },
    assemblyType: "unknown",
    source: "bmw-1-f70-production",
    note: "BMW называет Лейпциг единственным заводом четвёртого поколения 1 Series.",
  },
  {
    id: "bmw-x3-g45-rosslyn-phev",
    generationId: "bmw-x3-g45",
    factoryId: "rosslyn",
    from: "2024-10-01",
    to: null,
    datePrecision: "day",
    region: "Мировой экспорт",
    bodies: {
      status: "known",
      values: ["X3 Plug-in Hybrid"],
      appliesTo: "factory",
    },
    assemblyType: "unknown",
    source: "bmw-x3-rosslyn-production",
    note: "Росслин — единственный завод X3 PHEV этого поколения; запись не распространяется на остальные силовые версии G45.",
  },
];

export const factoryById = Object.fromEntries(
  factories.map((factory) => [factory.id, factory]),
);
