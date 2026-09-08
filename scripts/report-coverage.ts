import { format } from "prettier";
import { readFileSync, writeFileSync } from "node:fs";
import { families, allGenerations } from "../src/data/models";
import { sources } from "../src/data/sources";
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
      `| ${f.name} | ${g.code} | ${g.photo ? "Есть" : "Нет"} | ${g.powertrains.length || "Не добавлены"} | ${g.revisions.length || "Не добавлены"} | ${g.ratings.length ? g.ratings.map((rating) => (rating.status === "rated" ? rating.scheme + " " + rating.protocolYear : rating.scheme + ": нет данных")).join("; ") : "Не добавлена"} |`,
  ),
  "",
  "Отсутствующие записи не означают отсутствие двигателя, обновления или оценки. Фото покрывает подписанную версию, не все кузова и комплектации поколения. Isetta пока общий обзор семейства.",
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
