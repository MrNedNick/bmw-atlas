import type { MessageKey } from "../i18n";
import type { Generation } from "../domain/catalog";

export interface ModelSpotlight {
  variant: string;
  source: string;
  powerKw: number;
  zeroTo100: number;
  intro: MessageKey;
  detail: MessageKey;
  price?: {
    amount: number;
    currency: string;
    year: number;
    market: string;
    source: string;
    note: MessageKey;
  };
}

export const spotlights: Record<string, ModelSpotlight> = {
  "bmw-8-g15": {
    variant: "M850i xDrive · 2018",
    source: "bmw-8-g15-launch",
    powerKw: 390,
    zeroTo100: 3.7,
    intro: "generation.bmw-8-g15.description",
    detail: "dossier.bmw-8-g15.2",
  },
  "bmw-8-g14": {
    variant: "M850i xDrive · 2019",
    source: "bmw-8-g14-launch",
    powerKw: 390,
    zeroTo100: 3.9,
    intro: "generation.bmw-8-g14.description",
    detail: "dossier.bmw-8-g14.2",
  },
  "bmw-8-g16": {
    variant: "M850i xDrive · 2019",
    source: "bmw-8-g16-launch",
    powerKw: 390,
    zeroTo100: 3.9,
    intro: "generation.bmw-8-g16.description",
    detail: "dossier.bmw-8-g16.2",
  },
  "bmw-6-g32-lci": {
    variant: "640i xDrive · 2020",
    source: "bmw-6-g32-update",
    powerKw: 245,
    zeroTo100: 5.4,
    intro: "story.4d47f1f9c8",
    detail: "story.161e42ebd3",
  },

  "bmw-xm-g09": {
    variant: "XM · 2023",
    source: "bmw-xm-g09-launch",
    powerKw: 480,
    zeroTo100: 4.3,
    intro: "story.3fc2bf4da0",
    detail: "story.76246ca53d",
    price: {
      amount: 159000,
      currency: "USD",
      year: 2023,
      market: "US",
      source: "bmw-xm-us-price",
      note: "story.a1b4d671a5",
    },
  },
  "bmw-2-g42": {
    variant: "M240i xDrive · 2021",
    source: "bmw-2-g42-launch",
    powerKw: 275,
    zeroTo100: 4.3,
    intro: "story.4b80df5d47",
    detail: "story.2fb80f21ee",
  },
};

export function heroPower(
  generation: Generation,
): { value: string; variant: string } | null {
  const spotlight = spotlights[generation.id];
  const engine = generation.powertrains[0];
  const kw =
    spotlight?.powerKw ??
    (engine?.powerUnit === "кВт" ? engine.power : undefined);
  if (kw !== undefined)
    return {
      value: `${Math.round(kw * 1.359621617)} PS`,
      variant: spotlight?.variant ?? engine.name,
    };
  return engine
    ? { value: `${engine.power} ${engine.powerUnit}`, variant: engine.name }
    : null;
}
