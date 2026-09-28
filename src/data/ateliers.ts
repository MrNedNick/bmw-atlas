import type { MessageKey } from "../i18n";
export interface Atelier {
  id: string;
  name: string;
  years: string;
  sources: string[];
  status: MessageKey;
  story: MessageKey;
  transition: MessageKey;
  next: MessageKey;
}
export const ateliers: Atelier[] = [
  {
    id: "alpina",
    name: "ALPINA",
    years: "1965 · 1983 · 2026",
    sources: ["alpina-brand-agreement", "alpina-brand-2026"],
    status: "heritage.alpina.status",
    story: "heritage.alpina.story",
    transition: "heritage.alpina.transition",
    next: "heritage.alpina.next",
  },
  {
    id: "hartge",
    name: "HARTGE",
    years: "1985",
    sources: ["hartge-manufacturer", "birds-hartge-history"],
    status: "heritage.hartge.status",
    story: "heritage.hartge.story",
    transition: "heritage.hartge.transition",
    next: "heritage.hartge.next",
  },
  {
    id: "schnitzer",
    name: "AC SCHNITZER",
    years: "1987",
    sources: ["schnitzer-bmw-history"],
    status: "heritage.schnitzer.status",
    story: "heritage.schnitzer.story",
    transition: "heritage.schnitzer.transition",
    next: "heritage.schnitzer.next",
  },
];
