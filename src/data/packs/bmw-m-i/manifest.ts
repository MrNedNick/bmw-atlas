export type MICoverageStatus = "index" | "overview" | "detailed";

export interface MIInventoryItem {
  id: string;
  lineage: "M" | "i";
  family: string;
  generation: string;
  generationId: string;
  status: MICoverageStatus;
  sourceIds: string[];
  imagePhase: "launch" | "facelift";
  missingFields: string[];
}

// T27 grows one verified object at a time. This file is progress state, not a
// claim that the whole M/i catalogue is complete.
export const bmwMIInventory: MIInventoryItem[] = [
  {
    id: "bmw-m-i-m4-g82-lci",
    lineage: "M",
    family: "M4",
    generation: "G82 LCI",
    generationId: "bmw-m4-g82-lci",
    status: "detailed",
    sourceIds: ["bmw-m4-g82-update"],
    imagePhase: "facelift",
    missingFields: ["дорестайлинг G82", "G83 Convertible", "производство"],
  },
  {
    id: "bmw-m-i-xm-g09",
    lineage: "M",
    family: "XM",
    generation: "G09",
    generationId: "bmw-xm-g09",
    status: "detailed",
    sourceIds: ["bmw-xm-g09-launch"],
    imagePhase: "launch",
    missingFields: ["XM Label", "оценки безопасности"],
  },
  {
    id: "bmw-m-i-i8-i12-lci",
    lineage: "i",
    family: "i8",
    generation: "I12 LCI / I15",
    generationId: "bmw-i8-i12-lci",
    status: "detailed",
    sourceIds: ["bmw-i8-history", "bmw-i8-2018-update"],
    imagePhase: "facelift",
    missingFields: [
      "дорестайлинг I12",
      "отдельное изображение I15 Roadster",
      "тираж",
    ],
  },
];
