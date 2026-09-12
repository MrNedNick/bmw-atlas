import { format } from "prettier";
import { readFileSync, writeFileSync } from "node:fs";
import { families, allGenerations } from "../src/data/models";
import { sources } from "../src/data/sources";
import { faceliftCount } from "../src/domain/revisions";
import { bmwSeriesInventory } from "../src/data/packs/bmw-series/manifest";
import {
  bmwXZImageTasks,
  bmwXZInventory,
} from "../src/data/packs/bmw-x-z/manifest";
const snapshot = JSON.parse(readFileSync("public/data/catalog.json", "utf8"));
const lines = [
  "# Состояние каталога BMW",
  "",
  `Индекс NHTSA: ${snapshot.modelCount} названий BMW, снимок ${snapshot.retrievedAt.slice(0, 10)}. Это названия, не полные технические карточки.`,
  "",
  `Исследованных историй: ${families.length}. Поколений / обзорных ветвей: ${allGenerations.length}. С фотографией: ${allGenerations.filter((x) => x.generation.photo).length}. Силовых записей: ${allGenerations.reduce((n, x) => n + x.generation.powertrains.length, 0)}. Источников фактов: ${sources.length}.`,
  "",
  "| Семейство | Поколение / ветвь | Фото | Силовых записей | Известных обновлений | Оценка безопасности |",
  "| --- | --- | --- | --- | --- | --- |",
  ...allGenerations.map(
    ({ family: f, generation: g }) =>
      `| ${f.name} | ${g.code} | ${g.photo ? "Есть" : "Нет"} | ${g.powertrains.length || "Не добавлены"} | ${faceliftCount(g.revisions) || "Не добавлены"} | ${g.ratings.length ? g.ratings.map((rating) => (rating.status === "rated" ? rating.scheme + " " + rating.protocolYear : rating.scheme + ": нет данных")).join("; ") : "Не добавлена"} |`,
  ),
  "",
  "Отсутствующие записи не означают отсутствие двигателя, обновления или оценки. Фото покрывает подписанную версию, не все кузова и комплектации поколения. Isetta пока общий обзор семейства.",
  "",
  "## Инвентаризация номерных серий",
  "",
  `Всего ветвей в пакете: ${bmwSeriesInventory.length}. Подробных: ${bmwSeriesInventory.filter((item) => item.status === "detailed").length}. Обзорных: ${bmwSeriesInventory.filter((item) => item.status === "overview").length}. Только в индексе: ${bmwSeriesInventory.filter((item) => item.status === "index").length}.`,
  "",
  "| Серия | Ветвь | Коды кузовов | Статус | Что ещё нужно |",
  "| --- | --- | --- | --- | --- |",
  ...bmwSeriesInventory.map(
    (item) =>
      `| ${item.series} Series | ${item.lineage} | ${item.chassisCodes.join(", ")} | ${item.status} | ${item.missingFields.join("; ")} |`,
  ),
  "",
  "Кузовные варианты внутри одной ветви не считаются отдельными поколениями. Для 8 Series сохранён разрыв между E31 и современной линией G14/G15/G16.",
  "",
  "## Инвентаризация BMW X и Z",
  "",
  `Всего поколений / ветвей: ${bmwXZInventory.length}. Подробных: ${bmwXZInventory.filter((item) => item.status === "detailed").length}. Обзорных: ${bmwXZInventory.filter((item) => item.status === "overview").length}. Только в индексе: ${bmwXZInventory.filter((item) => item.status === "index").length}. Изображений в очереди: ${bmwXZImageTasks.length}.`,
  "",
  "| Семейство | Поколение | Коды | Период | Визуальные фазы | Связанные M / i | Статус |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  ...bmwXZInventory.map(
    (item) =>
      `| ${item.family} | ${item.generationKey.toUpperCase()} | ${item.chassisCodes.join(", ")} | ${item.production.from}–${item.production.to ?? "н. в."} | ${item.visualPhases.map((phase) => `${phase.label} (${phase.status})`).join("; ")} | ${[...item.mDerivativeIds, ...item.electricDerivativeIds].join("; ") || "—"} | ${item.status} |`,
  ),
  "",
  "Каждый подтверждённый рестайлинг — самостоятельная визуальная фаза. M и электрические производные связаны с донорским кузовом, но не объединены с обычной моделью.",
  "",
  "Обновление отчёта: `npm run data:report`. Проверка соответствия данным выполняется командой `npm run data:validate`.",
  "",
];
const content = await format(lines.join("\n"), { parser: "markdown" }),
  path = "docs/catalog-status.md";
if (process.argv.includes("--check")) {
  let actual = "";
  try {
    actual = readFileSync(path, "utf8");
  } catch {}
  if (actual !== content) {
    console.error("Catalogue report is stale. Run npm run data:report.");
    process.exitCode = 1;
  }
} else writeFileSync(path, content);
