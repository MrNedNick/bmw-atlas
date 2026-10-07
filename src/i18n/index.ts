import { readStaticJson } from "../lib/static-json";
import type { ru as RussianMessages } from "./ru";
type Dictionary = Record<keyof typeof RussianMessages, string>;
async function loadMessages(): Promise<{ ru: Dictionary; en: Dictionary }> {
  if (import.meta.env.MODE === "test") {
    const [{ ru }, { en }] = await Promise.all([
      import("./ru"),
      import("./en"),
    ]);
    return { ru, en };
  }
  return readStaticJson("data/translations.json");
}
export const messages = await loadMessages();
const { ru } = messages;
export type Locale = "ru" | "en";
export type MessageKey = keyof typeof ru;
export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
export function catalogText(
  locale: Locale,
  key:
    | `family.${string}.summary`
    | `family.${string}.tagline`
    | `generation.${string}.description`,
): string {
  if (!(key in ru)) throw new Error(`Missing catalogue translation: ${key}`);
  return t(locale, key as MessageKey);
}
export function label(locale: Locale, value: string): string {
  const exact = `term.${value}`;
  if (exact in ru) return t(locale, exact as MessageKey);
  return value
    .split(" · ")
    .map((part) => {
      const key = [`term.${part}`, `body.${part}`].find((key) => key in ru);
      return key ? t(locale, key as MessageKey) : part;
    })
    .join(" · ");
}
