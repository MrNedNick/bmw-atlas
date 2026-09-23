export interface CatalogGroup {
  id: string;
  eyebrow: string;
  title: string;
  familyIds: readonly string[];
}

export const catalogGroups: readonly CatalogGroup[] = [
  {
    id: "series",
    eyebrow: "ОСНОВНЫЕ СЕРИИ",
    title: "Классическая линейка BMW",
    familyIds: ["bmw-1-series", "bmw-3-series", "bmw-5-series", "bmw-7-series"],
  },
  {
    id: "x",
    eyebrow: "BMW X",
    title: "SAV и Sports Activity Coupé",
    familyIds: ["bmw-x1", "bmw-x3", "bmw-x5", "bmw-x6", "bmw-x7"],
  },
  {
    id: "m",
    eyebrow: "BMW M",
    title: "Высокопроизводительные модели",
    familyIds: [
      "bmw-m1",
      "bmw-m2",
      "bmw-m3",
      "bmw-m4",
      "bmw-m5",
      "bmw-m6",
      "bmw-m8",
      "bmw-x3-m-f97-lineage",
      "bmw-x4-m-f98-lineage",
      "bmw-z3-m",
      "bmw-z4-m",
      "bmw-xm",
    ],
  },
  {
    id: "i",
    eyebrow: "BMW i",
    title: "Электрические и гибридные BMW i",
    familyIds: [
      "bmw-i3-i01-lineage",
      "bmw-i4-g26-lineage",
      "bmw-i5-g60-lineage",
      "bmw-i8",
      "bmw-ix1-u11-lineage",
      "bmw-ix2-u10-lineage",
      "bmw-ix3-g08-lineage",
      "bmw-ix",
    ],
  },
  {
    id: "classic",
    eyebrow: "BMW CLASSIC",
    title: "Исторические модели",
    familyIds: ["bmw-isetta"],
  },
  {
    id: "motorrad",
    eyebrow: "BMW MOTORRAD",
    title: "Мотоциклы BMW",
    familyIds: [
      "bmw-r32",
      "bmw-gs-boxer",
      "bmw-s1000rr",
      "bmw-r18-lineage",
      "bmw-ce04-lineage",
    ],
  },
];
