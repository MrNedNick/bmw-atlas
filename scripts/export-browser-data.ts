import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { families } from "../src/data/models";
import { ru } from "../src/i18n/ru";
import { en } from "../src/i18n/en";
const destination = new URL("../public/data/families/", import.meta.url);
mkdirSync(destination, { recursive: true });
function writeJson(path: URL, value: unknown) {
  const json = JSON.stringify(value);
  writeFileSync(path, json);
  writeFileSync(new URL(path.href + ".gz"), gzipSync(json, { level: 9 }));
}
for (const family of families)
  writeJson(new URL(`${family.id}.json`, destination), family);
const index = families.map((family) => ({
  ...family,
  generations: family.generations.map((generation) => ({
    ...generation,
    powertrains: generation.powertrains.map((powertrain) => ({
      ...powertrain,
      note: undefined,
      market: "",
      asOf: "",
      source: "",
    })),
    ratings: [],
    assembly: [],
    volume: null,
  })),
}));
writeJson(new URL("../public/data/family-index.json", import.meta.url), index);
writeJson(new URL("../public/data/translations.json", import.meta.url), {
  ru,
  en,
});
