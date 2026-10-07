import { modelDossiers } from "../data/model-dossiers";
import { type RefObject, type MouseEvent } from "react";
import { ArrowUpRight, Bookmark, Search, X } from "lucide-react";
import { catalogGroups } from "../data/catalog-groups";
import type { Filters, Generation, ModelFamily } from "../domain/catalog";
import { familyMatches, matchesText } from "../domain/catalog";
import {
  t,
  catalogText,
  messages,
  type Locale,
  type MessageKey,
} from "../i18n";
import { VehiclePhoto } from "./media/VehiclePhoto";

export interface CollectionSelection {
  collection: string;
  decade: string;
  phase: "" | "facelift";
  filters: Filters;
}
export function isFacelift(generation: Generation) {
  return (
    /\bLCI\b/.test(generation.code) ||
    generation.revisions.some(
      (r) => r.kind === "facelift" && r.year === generation.start,
    )
  );
}
export function collectionSelection(
  families: ModelFamily[],
  selection: CollectionSelection,
  saved: string[],
) {
  const group = catalogGroups.find((g) => g.id === selection.collection);
  return families.flatMap((family) => {
    if (
      (group && !group.familyIds.includes(family.id)) ||
      !familyMatches(family, selection.filters, saved)
    )
      return [];
    const chassisQuery = /\b[EFGKRU]\d{2}\b/i.test(selection.filters.query);
    const familyQuery =
      !chassisQuery &&
      matchesText(
        [family.brand, family.name, ...family.aliases].join(" "),
        selection.filters.query,
      );
    const generations = family.generations.filter(
      (g) =>
        (!selection.decade ||
          (g.start <= Number(selection.decade) + 9 &&
            (g.end === null || g.end >= Number(selection.decade)))) &&
        (!selection.phase || isFacelift(g)) &&
        (!selection.filters.year ||
          (g.start <= Number(selection.filters.year) &&
            (g.end === null || g.end >= Number(selection.filters.year)))) &&
        (!selection.filters.fuel ||
          g.powertrains.some((p) => p.fuel === selection.filters.fuel)) &&
        (familyQuery ||
          matchesText(
            [
              family.brand,
              family.name,
              g.code,
              g.label,
              ...(g.highlights ?? []),
              ...g.powertrains.map((p) => p.name),
            ].join(" "),
            selection.filters.query,
          )),
    );
    return generations.length ? [{ family, generations }] : [];
  });
}
function bodyLabel(value: string, language: Locale) {
  const key = `body.${value}`;
  return key in messages.ru ? t(language, key as MessageKey) : value;
}
export function CollectionCatalog({
  families,
  selection,
  saved,
  language,
  onChange,
  onSave,
  onOpen,
  hrefFor,
  inputRef,
  expanded,
  onExpandedChange,
}: {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  families: ModelFamily[];
  selection: CollectionSelection;
  saved: string[];
  language: Locale;
  onChange: (patch: Partial<CollectionSelection>) => void;
  onSave: (id: string) => void;
  onOpen: (family: ModelFamily, generation: Generation) => void;
  hrefFor: (family: ModelFamily, generation: Generation) => string;
}) {
  const entries = collectionSelection(families, selection, saved);
  const count = entries.reduce(
    (total, entry) => total + entry.generations.length,
    0,
  );
  const decades = Array.from(
    new Set(
      families.flatMap((f) =>
        f.generations.flatMap((g) => {
          const from = Math.floor(g.start / 10) * 10,
            to = Math.floor((g.end ?? new Date().getFullYear()) / 10) * 10;
          return Array.from({ length: (to - from) / 10 + 1 }, (_, i) =>
            String(from + i * 10),
          );
        }),
      ),
    ),
  ).sort();
  const bodies = [...new Set(families.flatMap((f) => f.body))];
  const activeCount = [
    selection.collection,
    selection.decade,
    selection.phase,
    ...Object.values(selection.filters),
  ].filter(Boolean).length;
  const active = activeCount > 0;
  const reset = () =>
    onChange({
      collection: "",
      decade: "",
      phase: "",
      filters: {
        query: "",
        year: "",
        body: "",
        fuel: "",
        country: "",
        savedOnly: false,
      },
    });
  const follow = (
    event: MouseEvent<HTMLAnchorElement>,
    family: ModelFamily,
    generation: Generation,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onOpen(family, generation);
  };
  const classicIds = catalogGroups.find(
    (group) => group.id === "classic",
  )!.familyIds;
  const chapters = [
    {
      id: "modern",
      entries: entries.filter(
        ({ family }) =>
          !classicIds.includes(family.id) && family.vehicleKind !== "Мотоцикл",
      ),
    },
    {
      id: "classic",
      entries: entries
        .filter(({ family }) => classicIds.includes(family.id))
        .sort(
          (a, b) =>
            Math.min(...a.generations.map((g) => g.start)) -
            Math.min(...b.generations.map((g) => g.start)),
        ),
    },
    {
      id: "motorrad",
      entries: entries.filter(
        ({ family }) => family.vehicleKind === "Мотоцикл",
      ),
    },
  ].filter((chapter) => chapter.entries.length);
  return (
    <>
      <header className="archive-heading">
        <div>
          <span className="eyebrow">{t(language, "collection.eyebrow")}</span>
          <h1>
            {t(language, "collection.titleLead")}{" "}
            <em>{t(language, "collection.titleAccent")}</em>
          </h1>
        </div>
        <p>{t(language, "collection.intro")}</p>
      </header>
      <section
        className="archive-filters"
        aria-label={t(language, "collection.search")}
      >
        <div className="archive-search-row">
          <div className="search-box archive-search">
            <Search size={22} />
            <input
              ref={inputRef}
              aria-label={t(language, "collection.search")}
              placeholder={t(language, "collection.search")}
              value={selection.filters.query}
              onChange={(e) =>
                onChange({
                  filters: { ...selection.filters, query: e.target.value },
                })
              }
            />
            {selection.filters.query && (
              <button
                aria-label={t(language, "clear.search.c7e7dd")}
                onClick={() =>
                  onChange({ filters: { ...selection.filters, query: "" } })
                }
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            className="archive-filter-toggle"
            aria-expanded={expanded}
            aria-controls="archive-filter-options"
            onClick={() => onExpandedChange(!expanded)}
          >
            {t(language, "collection.filters")}
            {activeCount > 0 && (
              <span className="filter-active-count">{activeCount}</span>
            )}{" "}
            <span>{expanded ? "−" : "+"}</span>
          </button>
          {active && (
            <button className="archive-reset" onClick={reset}>
              {t(language, "collection.reset")}
              <X size={15} />
            </button>
          )}
        </div>
        <div
          id="archive-filter-options"
          hidden={!expanded}
          className={
            "archive-filter-options" + (expanded ? " is-expanded" : "")
          }
        >
          <div className="archive-filter-row">
            <span>{t(language, "collection.series")}</span>
            <div role="group" aria-label={t(language, "collection.series")}>
              {[
                { id: "", label: t(language, "collection.all") },
                ...catalogGroups.map((g) => ({
                  id: g.id,
                  label:
                    g.id === "series"
                      ? t(language, "collection.core")
                      : g.id === "classic"
                        ? t(language, "collection.classic")
                        : g.id === "motorrad"
                          ? t(language, "collection.motorcycles")
                          : g.eyebrow,
                })),
              ].map((g) => (
                <button
                  key={g.id}
                  aria-pressed={selection.collection === g.id}
                  onClick={() =>
                    onChange({
                      collection: selection.collection === g.id ? "" : g.id,
                    })
                  }
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div className="archive-filter-row">
            <span>{t(language, "collection.era")}</span>
            <div role="group" aria-label={t(language, "collection.era")}>
              {["", ...decades].map((decade) => (
                <button
                  key={decade}
                  aria-pressed={selection.decade === decade}
                  onClick={() =>
                    onChange({
                      decade: selection.decade === decade ? "" : decade,
                    })
                  }
                >
                  {decade
                    ? decade + (language === "ru" ? "-е" : "s")
                    : t(language, "collection.all")}
                </button>
              ))}
            </div>
          </div>
          <div className="archive-filter-bottom">
            <label>
              {t(language, "collection.body")}
              <select
                value={selection.filters.body}
                onChange={(e) =>
                  onChange({
                    filters: { ...selection.filters, body: e.target.value },
                  })
                }
              >
                <option value="">{t(language, "collection.all")}</option>
                {bodies.map((body) => (
                  <option key={body} value={body}>
                    {bodyLabel(body, language)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="archive-facelift"
              aria-pressed={selection.phase === "facelift"}
              onClick={() =>
                onChange({ phase: selection.phase ? "" : "facelift" })
              }
            >
              <span className="filter-checkbox">
                {selection.phase ? "✓" : ""}
              </span>
              {t(language, "collection.facelift")}
            </button>
          </div>
        </div>
      </section>
      <span className="archive-count" role="status">
        {t(language, "collection.families")}: {entries.length} ·{" "}
        {t(language, "collection.versions")}: {count}
      </span>
      <div className="archive-families">
        {chapters.map((chapter) => (
          <section
            key={chapter.id}
            className={
              chapter.id === "classic" ? "archive-classics" : "archive-modern"
            }
            aria-labelledby={
              chapter.id === "classic" ? "archive-classics-title" : undefined
            }
          >
            {chapter.id === "classic" && (
              <header className="section-heading">
                <div>
                  <span className="eyebrow">BMW CLASSIC</span>
                  <h2 id="archive-classics-title">
                    {language === "en"
                      ? "Historic BMW cars"
                      : "Исторические автомобили BMW"}
                  </h2>
                  <p>
                    {language === "en"
                      ? "The early cars and ideas that shaped BMW, together in one collection."
                      : "Ранние автомобили и идеи, сформировавшие BMW, — в одной коллекции."}
                  </p>
                </div>
              </header>
            )}
            {chapter.id === "classic" ? (
              <div className="archive-grid">
                {chapter.entries.flatMap(({ family, generations }) =>
                  generations.map((g) => (
                    <article key={g.id} className="classic-card">
                      <a
                        className="archive-card"
                        href={hrefFor(family, g)}
                        onClick={(event) => follow(event, family, g)}
                        aria-label={`BMW ${family.name} ${g.code}`}
                      >
                        <div className="archive-card-photo">
                          <VehiclePhoto
                            photo={g.photo}
                            compact
                            language={language}
                          />
                        </div>
                        <div className="archive-card-caption">
                          <div>
                            <span>
                              {g.start}–
                              {g.end ?? t(language, "collection.present")} ·{" "}
                              {g.code}
                            </span>
                            <h3>BMW {family.name}</h3>
                          </div>
                          <ArrowUpRight size={23} />
                        </div>
                      </a>
                      <button
                        className="archive-save classic-save"
                        aria-pressed={saved.includes(family.id)}
                        aria-label={`${t(language, saved.includes(family.id) ? "collection.saved" : "collection.save")} BMW ${family.name}`}
                        onClick={() => onSave(family.id)}
                      >
                        <Bookmark
                          size={19}
                          fill={
                            saved.includes(family.id) ? "currentColor" : "none"
                          }
                        />
                      </button>
                    </article>
                  )),
                )}
              </div>
            ) : (
              chapter.entries.map(({ family, generations }) => (
                <section
                  className="archive-family"
                  key={family.id}
                  aria-labelledby={`family-${family.id}`}
                >
                  <header className="archive-family-heading">
                    <div>
                      <span className="eyebrow">
                        {family.vehicleKind === "Мотоцикл"
                          ? "BMW MOTORRAD"
                          : "BMW"}{" "}
                        · {Math.min(...family.generations.map((g) => g.start))}
                      </span>
                      <h2 id={`family-${family.id}`}>{family.name}</h2>
                    </div>
                    <p>
                      {catalogText(language, `family.${family.id}.summary`)}
                    </p>
                    <button
                      className="archive-save"
                      aria-pressed={saved.includes(family.id)}
                      aria-label={`${t(language, saved.includes(family.id) ? "collection.saved" : "collection.save")} BMW ${family.name}`}
                      onClick={() => onSave(family.id)}
                    >
                      <Bookmark
                        size={21}
                        fill={
                          saved.includes(family.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </header>
                  <div className="archive-grid">
                    {generations.map((g) => (
                      <a
                        className="archive-card"
                        key={g.id}
                        href={hrefFor(family, g)}
                        onClick={(e) => follow(e, family, g)}
                        aria-label={`BMW ${family.name} ${g.code} · ${g.start}–${g.end ?? t(language, "collection.present")}`}
                      >
                        <div className="archive-card-photo">
                          <VehiclePhoto
                            photo={g.photo}
                            compact
                            language={language}
                            planned={modelDossiers[g.id]?.subject}
                          />
                          {isFacelift(g) && (
                            <span className="archive-phase">
                              {t(language, "collection.facelift")}
                            </span>
                          )}
                        </div>
                        <div className="archive-card-caption">
                          <div>
                            <span>
                              {g.start}–
                              {g.end ?? t(language, "collection.present")}
                            </span>
                            <h3>{g.code}</h3>
                          </div>
                          <ArrowUpRight size={23} />
                        </div>
                        {!g.photo && (
                          <p className="archive-card-note">
                            {catalogText(
                              language,
                              `generation.${g.id}.description`,
                            )}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </section>
              ))
            )}
          </section>
        ))}
        {!entries.length && (
          <div className="collection-empty">
            <h2>{t(language, "collection.empty")}</h2>
            <p>{t(language, "collection.emptyHint")}</p>
            <button className="museum-cta" onClick={reset}>
              {t(language, "collection.reset")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
