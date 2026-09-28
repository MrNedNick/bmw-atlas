# Localization

UI messages, collection summaries, generation introductions, featured model stories and common technical labels live in two dictionaries: `src/i18n/ru.ts` and `src/i18n/en.ts`. English has the same typed keys as Russian. Both dictionaries ship locally; changing language needs no network request.

Use `t(language, key)` for interface text, `catalogText(language, key)` for catalogue prose, and `label(language, value)` for canonical technical labels. Keep fuel, body style, country and ID values in the domain data stable: filters and references use these canonical values. Translate them when rendering. Never change a filter's stored value to its translated label.

Every new family needs `family.<id>.summary` and `family.<id>.tagline`. Every generation needs `generation.<id>.description`. Add both languages in the same change. Missing content keys fail the catalogue translation test; do not use a Russian fallback on English screens. Source titles, official product names and image licence names may retain their original spelling.

## Remaining migration

The collection and generation introductions are bilingual. Legacy deep-detail content still needs a separate migration: generation highlights, revision descriptions and market scopes, engine notes and markets, production scope text, safety commentary and image credit notes. Preserve the source, market, date and unit for each fact when translating. Do not remove an untranslated fact to make a page appear complete.

Translate one family with all its generations at a time. Move prose to the same two dictionaries, render through the locale helpers, and verify the overview, engines, production, ratings and credits in both languages. Common labels belong under `term.*`; do not duplicate translations per family. A subsequent locale should implement the complete key set before it is offered in the language switcher.

## Checks

Run `npm test`, `npm run check`, `npm run data:validate` and `npm run build:pages`. Open the collection and a model at desktop and 360 px widths. Change language with an active query and filters, then navigate back: selection and scroll must remain intact. Check that the document language follows the switch.
