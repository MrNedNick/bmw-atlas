import { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import type { MouseEvent } from "react";
import {
  Shuffle,
  ArrowUpRight,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Bookmark,
  Sun,
  Moon,
  ChevronDown,
  X,
  ShieldCheck,
  Database,
  ArrowLeft,
} from "lucide-react";
import { families, allGenerations } from "./data/models";
import { catalogGroups } from "./data/catalog-groups";
import { sources } from "./data/sources";
import {
  EMPTY_FILTERS,
  familyMatches,
  matchesText,
  formatYears,
  type Filters,
  type IndexSnapshot,
  type ModelFamily,
  type IndexModel,
} from "./domain/catalog";
import { Button } from "./components/button/button";
import {
  type Language,
  useLanguage,
  useSaved,
  useTheme,
} from "./lib/preferences";
import { gallerySelection } from "./features/media/gallery";
import { VehiclePhoto } from "./features/media/VehiclePhoto";
import { collectionTaglines } from "./features/collection-copy";
import { Exhibition } from "./features/Exhibition";
import { FamilyDetail, SourceLink } from "./features/FamilyDetail";
const number = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const defaults = (f: ModelFamily) =>
  f.id === "bmw-3-series" ? "bmw-g20" : f.generations.at(-1)!.id;
const catalogOrder = catalogGroups.flatMap((group) => group.familyIds);
const catalogRank = (id: string) => {
  const rank = catalogOrder.indexOf(id);
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
};
const orderedFamilies = [...families].sort(
  (a, b) => catalogRank(a.id) - catalogRank(b.id),
);
const familyById = Object.fromEntries(
  families.map((family) => [family.id, family]),
) as Record<string, ModelFamily>;
interface PageState {
  view: "catalog" | "models" | "sources" | "photos";
  phase: "" | "facelift";
  collection: string;
  family: string;
  generation: string;
  filters: Filters;
}
function readUrl(): PageState {
  const q = new URLSearchParams(location.search),
    family = q.get("model") ?? "";
  const filter = { ...EMPTY_FILTERS };
  for (const key of ["query", "year", "fuel", "body", "country"] as const)
    filter[key] = q.get(key) ?? "";
  if (filter.year && !/^\d{4}$/.test(filter.year)) filter.year = "";
  filter.savedOnly = q.get("saved") === "1";
  const v = q.get("view");
  return {
    view: v === "models" || v === "sources" || v === "photos" ? v : "catalog",
    phase: q.get("phase") === "facelift" ? "facelift" : "",
    collection: catalogGroups.some((group) => group.id === q.get("collection"))
      ? q.get("collection")!
      : "",
    family: families.some((f) => f.id === family) ? family : "",
    generation: q.get("generation") ?? "",
    filters: filter,
  };
}
function urlFor(state: PageState) {
  const q = new URLSearchParams();
  if (state.view !== "catalog") q.set("view", state.view);
  if (state.phase) q.set("phase", state.phase);
  if (state.collection) q.set("collection", state.collection);
  if (state.family) q.set("model", state.family);
  if (state.generation) q.set("generation", state.generation);
  for (const [key, value] of Object.entries(state.filters)) {
    if (key === "savedOnly") {
      if (value) q.set("saved", "1");
    } else if (value) q.set(key, String(value));
  }
  return location.pathname + (q.size ? "?" + q : "");
}
function FamilyCard({
  family,
  href,
  onOpen,
  saved,
  onSave,
  language,
}: {
  family: ModelFamily;
  href: string;
  onOpen: () => void;
  saved: boolean;
  onSave: () => void;
  language: Language;
}) {
  const isEnglish = language === "en";
  return (
    <article className="family-card blue-card">
      <div className="card-top">
        <span>
          {family.vehicleKind === "Мотоцикл" ? "BMW MOTORRAD" : family.brand}
        </span>
        <button
          className={"bookmark " + (saved ? "is-saved" : "")}
          aria-label={
            (saved
              ? isEnglish
                ? "Remove from garage "
                : "Убрать из гаража "
              : isEnglish
                ? "Add to garage "
                : "В гараж ") + family.name
          }
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <a
        className="card-open"
        href={href}
        onClick={(event) => {
          if (!plainLeftClick(event)) return;
          event.preventDefault();
          onOpen();
        }}
      >
        <div className="card-visual">
          <VehiclePhoto
            language={language}
            photo={
              family.generations.find((g) => g.id === defaults(family))?.photo
            }
            compact
          />
        </div>
        <div className="card-title">
          <div>
            <span className="eyebrow">
              {family.generations[0].start} —{" "}
              {family.generations.at(-1)!.end ??
                (isEnglish ? "TODAY" : "СЕГОДНЯ")}
            </span>
            <h3>{family.name}</h3>
          </div>
          <span className="round-arrow">
            <ArrowUpRight size={22} />
          </span>
        </div>
        <p>
          {isEnglish
            ? (collectionTaglines[family.id] ?? family.name)
            : family.tagline}
        </p>
        <div className="card-metrics">
          <span>
            {isEnglish ? "Generations / versions: " : "Поколения / версии: "}
            <strong>{family.generations.length}</strong>
          </span>
        </div>
      </a>
    </article>
  );
}
function plainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
interface AtlasHistoryState {
  atlasScrollY?: number;
  atlasModelReturn?: boolean;
}
function historyState(): AtlasHistoryState {
  const value: unknown = history.state;
  return value && typeof value === "object" ? (value as AtlasHistoryState) : {};
}
function BMWMark() {
  return (
    <svg className="bmw-mark" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#111820" stroke="currentColor" />
      <circle cx="24" cy="24" r="15" fill="#f4f7fb" />
      <path d="M24 9a15 15 0 0 0-15 15h15Z" fill="#0c6fbb" />
      <path d="M24 39a15 15 0 0 0 15-15H24Z" fill="#0c6fbb" />
      <circle
        cx="24"
        cy="24"
        r="15"
        fill="none"
        stroke="#111820"
        strokeWidth="1.5"
      />
      <text
        x="24"
        y="7.7"
        textAnchor="middle"
        fill="#fff"
        fontSize="7"
        fontWeight="700"
        letterSpacing="1"
      >
        BMW
      </text>
    </svg>
  );
}
export default function App() {
  const [state, setState] = useState<PageState>(readUrl);
  const [index, setIndex] = useState<IndexSnapshot | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [indexVersion, setIndexVersion] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [indexPage, setIndexPage] = useState(1);
  const [indexDetail, setIndexDetail] = useState<IndexModel | null>(null);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const indexOpener = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pendingScroll = useRef<number | null>(null);
  const [faceliftSelection, setFaceliftSelection] = useState(0);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const photoOpener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = photoDialog.current;
    if (photoIndex !== null) {
      if (!dialog?.open) dialog?.showModal();
    } else if (dialog?.open) {
      dialog.close();
      photoOpener.current?.focus({ preventScroll: true });
    }
  }, [photoIndex]);
  useLayoutEffect(() => {
    if (pendingScroll.current === null) return;
    window.scrollTo({ top: pendingScroll.current, behavior: "instant" });
    pendingScroll.current = null;
  }, [state]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (indexDetail) dialog?.showModal();
    return () => {
      dialog?.close();
      if (indexOpener.current?.isConnected) indexOpener.current.focus();
    };
  }, [indexDetail]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !(e.target instanceof HTMLElement && e.target.isContentEditable) &&
        !indexDetail
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [indexDetail]);
  const { saved, toggle } = useSaved(families.map((f) => f.id)),
    { theme, toggleTheme } = useTheme(),
    { language, toggleLanguage } = useLanguage();
  const l = (ru: string, en: string) => (language === "en" ? en : ru);
  const groupText = (group: (typeof catalogGroups)[number]) => {
    if (language !== "en") return group;
    const translated: Record<string, { eyebrow: string; title: string }> = {
      series: { eyebrow: "CORE SERIES", title: "BMW series" },
      x: { eyebrow: "BMW X", title: "SAV and Sports Activity Coupé" },
      m: { eyebrow: "BMW M", title: "High-performance models" },
      i: { eyebrow: "BMW i", title: "Electric and hybrid BMW i" },
      classic: { eyebrow: "BMW CLASSIC", title: "Historic models" },
      motorrad: { eyebrow: "BMW MOTORRAD", title: "BMW motorcycles" },
    };
    return { ...group, ...translated[group.id] };
  };
  const text =
    language === "en"
      ? {
          skip: "Skip to content",
          catalog: "BMW Atlas catalog",
          models: "All models",
          garage: "My garage",
          photos: "Photos",
          about: "About the data",
          light: "Light theme",
          dark: "Dark theme",
          language: "Русский",
        }
      : {
          skip: "Перейти к содержимому",
          catalog: "BMW Atlas — каталог",
          models: "Все модели",
          garage: "Мой гараж",
          photos: "Фото",
          about: "О данных",
          light: "Светлая тема",
          dark: "Тёмная тема",
          language: "English",
        };
  useEffect(() => {
    const c = new AbortController();
    setIndexError(false);
    fetch(import.meta.env.BASE_URL + "data/catalog.json", { signal: c.signal })
      .then((r) => {
        if (!r.ok) throw new Error("catalog");
        return r.json();
      })
      .then((j: IndexSnapshot) => {
        if (
          j.version !== 1 ||
          !Array.isArray(j.models) ||
          !j.models.every(
            (m) =>
              typeof m.id === "string" &&
              typeof m.make === "string" &&
              typeof m.name === "string",
          )
        )
          throw new Error("schema");
        if (j.models.some((m) => m.make !== "BMW"))
          throw new Error("BMW-only catalogue required");
        setIndex(j);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setIndexError(true);
      });
    return () => c.abort();
  }, [indexVersion]);
  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const pop = () => {
      pendingScroll.current = historyState().atlasScrollY ?? 0;
      setState(readUrl());
      setIndexDetail(null);
      setPhotoIndex(null);
    };
    window.addEventListener("popstate", pop);
    return () => {
      window.removeEventListener("popstate", pop);
      history.scrollRestoration = previousRestoration;
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(patch: Partial<PageState>, replace = false) {
    const next = { ...state, ...patch };
    const currentHistory = historyState();
    if (replace) {
      history.replaceState(currentHistory, "", urlFor(next));
    } else {
      history.replaceState(
        { ...currentHistory, atlasScrollY: window.scrollY },
        "",
        location.href,
      );
      history.pushState(
        {
          atlasScrollY: 0,
          atlasModelReturn: !state.family && Boolean(next.family),
        } satisfies AtlasHistoryState,
        "",
        urlFor(next),
      );
    }
    setState(next);
    if (next.view !== state.view || next.family !== state.family) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    setIndexDetail(null);
  }
  function filters(patch: Partial<Filters>) {
    navigate({ filters: { ...state.filters, ...patch } }, true);
    setIndexPage(1);
  }
  function saveFamily(id: string) {
    toggle(id);
    setNotice(
      (saved.includes(id)
        ? l("Убрано из гаража: ", "Removed from garage: ")
        : l("В вашем гараже: ", "In your garage: ")) +
        "BMW " +
        familyById[id].name,
    );
  }
  function openFamily(f: ModelFamily) {
    navigate({ family: f.id, generation: defaults(f) });
  }
  function backToModels() {
    if (historyState().atlasModelReturn) {
      history.back();
    } else {
      navigate({ view: "models", family: "", generation: "", phase: "" }, true);
    }
  }
  function go(view: PageState["view"], garage = false) {
    navigate({
      view,
      collection: "",
      phase: "",
      family: "",
      generation: "",
      filters: { ...EMPTY_FILTERS, savedOnly: garage },
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function showDetailedStories() {
    setIndexDetail(null);
    setShowFilters(false);
    go("models");
  }
  const filtered = useMemo(
    () => families.filter((f) => familyMatches(f, state.filters, saved)),
    [state.filters, saved],
  );
  const nameRows = useMemo(() => {
    if (
      !index ||
      state.filters.savedOnly ||
      state.filters.year ||
      state.filters.fuel ||
      state.filters.body ||
      state.filters.country
    )
      return [];
    return index.models.filter((m) =>
      matchesText(m.make + " " + m.name, state.filters.query),
    );
  }, [index, state.filters]);
  const modelIndexRows = useMemo(
    () =>
      index
        ? index.models.filter((m) =>
            matchesText(m.make + " " + m.name, state.filters.query),
          )
        : [],
    [index, state.filters.query],
  );
  const galleryEntries = useMemo(
    () =>
      gallerySelection(
        state.collection,
        state.filters.query,
        state.phase === "facelift",
      ),
    [state.collection, state.filters.query, state.phase],
  );
  function surprise() {
    const pool = galleryEntries.filter(
      (entry) => entry.generation.id !== state.generation,
    );
    if (!pool.length) return;
    const entry = pool[Math.floor(Math.random() * pool.length)];
    navigate(
      { family: entry.family.id, generation: entry.generation.id },
      Boolean(state.family),
    );
  }
  const family = families.find((f) => f.id === state.family);
  const generation =
    family?.generations.find((g) => g.id === state.generation) ??
    (family
      ? family.generations.find((g) => g.id === defaults(family))
      : undefined);
  const activeFilters = Object.entries(state.filters).filter(
    ([k, v]) => k !== "query" && k !== "savedOnly" && !!v,
  ).length;
  const hasCatalogFilters = Boolean(state.filters.query) || activeFilters > 0;
  return (
    <>
      <a className="skip" href="#main">
        {text.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => go("catalog")}
            aria-label={text.catalog}
          >
            <span className="brand-mark">
              <BMWMark />
            </span>
            <span>
              BMW<span className="brand-light">atlas</span>
              <sup>●</sup>
            </span>
          </button>
          <nav aria-label={l("Основная навигация", "Main navigation")}>
            <button
              className={state.view === "models" ? "active" : ""}
              onClick={() => (family ? backToModels() : go("models"))}
            >
              {text.models}
            </button>
            <button
              className={state.filters.savedOnly ? "active" : ""}
              onClick={() => go("catalog", true)}
            >
              {text.garage}
              {saved.length > 0 && (
                <span className="nav-count">{saved.length}</span>
              )}
            </button>
            <button className="photo-nav" onClick={() => go("photos")}>
              {text.photos}
            </button>
          </nav>
          <div className="header-right">
            <button className="about-link" onClick={() => go("sources")}>
              {text.about} <ArrowUpRight size={14} />
            </button>
            <button
              className="language-button"
              onClick={toggleLanguage}
              aria-label={text.language}
            >
              {text.language}
            </button>
            <button
              className="theme-button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? text.light : text.dark}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="main-container">
        {family && generation ? (
          <>
            <FamilyDetail
              family={family}
              generation={generation}
              onGeneration={(id) => navigate({ generation: id }, true)}
              hrefForGeneration={(id) => urlFor({ ...state, generation: id })}
              onBack={backToModels}
              saved={saved.includes(family.id)}
              onSave={() => saveFamily(family.id)}
              language={language}
            />
            <section
              className="next-exhibits"
              aria-labelledby="next-exhibits-title"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    {l("ПРОДОЛЖИТЬ ПРОГУЛКУ", "KEEP EXPLORING")}
                  </span>
                  <h2 id="next-exhibits-title">
                    {l("Рядом в коллекции", "Nearby in the collection")}
                  </h2>
                </div>
                <button className="text-action" onClick={backToModels}>
                  {l("Вернуться к коллекции", "Back to the collection")}
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="family-grid">
                {[
                  ...new Set([
                    ...(catalogGroups.find((group) =>
                      group.familyIds.includes(family.id),
                    )?.familyIds ?? []),
                    "bmw-m1",
                    "bmw-i8",
                    "bmw-gs-boxer",
                  ]),
                ]
                  .filter((id) => id !== family.id)
                  .slice(0, 2)
                  .map((id) => {
                    const next = familyById[id];
                    return (
                      <FamilyCard
                        key={id}
                        family={next}
                        href={urlFor({
                          ...state,
                          family: id,
                          generation: defaults(next),
                        })}
                        onOpen={() =>
                          navigate(
                            { family: id, generation: defaults(next) },
                            true,
                          )
                        }
                        saved={saved.includes(id)}
                        onSave={() => saveFamily(id)}
                        language={language}
                      />
                    );
                  })}
              </div>
            </section>
          </>
        ) : state.view === "models" ? (
          <section className="page-enter all-models-page">
            <div className="page-heading">
              <span className="eyebrow">BMW CATALOGUE</span>
              <h1>
                {l("Коллекция BMW.", "The BMW collection.")}{" "}
                <em>{l("Найдите свой характер.", "Find your character.")}</em>
              </h1>
              <p>
                {l(
                  "Любимые серии, редкие силуэты и новые открытия.",
                  "Favourite series, rare silhouettes and new discoveries.",
                )}
              </p>
            </div>
            <div className="collection-tools">
              <div className="search-box collection-search">
                <Search size={22} />
                <input
                  ref={searchRef}
                  aria-label={l("Найти в коллекции", "Search the collection")}
                  placeholder={l(
                    "Что вам интересно? M3, E30, X7, GS…",
                    "What are you curious about? M3, E30, X7, GS…",
                  )}
                  value={state.filters.query}
                  onChange={(e) => filters({ query: e.target.value })}
                />
                {state.filters.query && (
                  <button
                    aria-label={l("Очистить поиск", "Clear search")}
                    onClick={() => filters({ query: "" })}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <nav
                className="collection-tabs"
                aria-label={l("Разделы коллекции", "Collection rooms")}
              >
                {[
                  { id: "", label: l("Вся коллекция", "All rooms") },
                  ...catalogGroups.map((group) => ({
                    id: group.id,
                    label:
                      group.id === "series"
                        ? l("Серии", "Series")
                        : group.eyebrow.replace("BMW ", ""),
                  })),
                ].map((group) => (
                  <button
                    key={group.id}
                    aria-pressed={state.collection === group.id}
                    onClick={() => navigate({ collection: group.id }, true)}
                  >
                    {group.label}
                  </button>
                ))}
              </nav>
            </div>
            <section className="models-section" aria-labelledby="stories-title">
              <button
                className="museum-random collection-random"
                onClick={surprise}
                disabled={!galleryEntries.length}
              >
                <Shuffle size={17} />
                {l("Случайная находка", "Surprise me")}
              </button>
              <div className="collection-results" aria-live="polite">
                <h2 id="stories-title">
                  {state.collection
                    ? groupText(
                        catalogGroups.find(
                          (group) => group.id === state.collection,
                        )!,
                      ).title
                    : l("Все залы", "All rooms")}
                </h2>
                <span>
                  {
                    filtered.filter(
                      (f) =>
                        !state.collection ||
                        catalogGroups
                          .find((g) => g.id === state.collection)!
                          .familyIds.includes(f.id),
                    ).length
                  }{" "}
                  / {families.length} {l("семейств", "families")}
                </span>
              </div>
              {!filtered.some(
                (f) =>
                  !state.collection ||
                  catalogGroups
                    .find((g) => g.id === state.collection)!
                    .familyIds.includes(f.id),
              ) && (
                <div className="collection-empty">
                  <h3>
                    {l(
                      "В этом зале ничего не нашлось",
                      "Nothing found in this room",
                    )}
                  </h3>
                  <p>
                    {l(
                      "Попробуйте другой запрос или откройте всю коллекцию.",
                      "Try another search or explore the whole collection.",
                    )}
                  </p>
                  <button
                    className="museum-cta"
                    onClick={() =>
                      navigate(
                        { collection: "", filters: { ...EMPTY_FILTERS } },
                        true,
                      )
                    }
                  >
                    {l("Показать всю коллекцию", "Show the whole collection")}
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
              <div className="catalog-groups">
                {catalogGroups
                  .filter(
                    (group) =>
                      !state.collection || group.id === state.collection,
                  )
                  .map((group) => {
                    const translatedGroup = groupText(group);
                    const groupFamilies = group.familyIds
                      .map((familyId) => familyById[familyId])
                      .filter((f) => filtered.includes(f));
                    if (!groupFamilies.length) return null;

                    return (
                      <section
                        key={group.id}
                        className="catalog-group"
                        aria-labelledby={`catalog-group-${group.id}`}
                      >
                        <div
                          className={
                            state.collection
                              ? "sr-only"
                              : "catalog-group-heading"
                          }
                        >
                          <div>
                            <span className="eyebrow">
                              {translatedGroup.eyebrow}
                            </span>
                            <h3 id={`catalog-group-${group.id}`}>
                              {translatedGroup.title}
                            </h3>
                          </div>
                          <span>
                            {groupFamilies.length}{" "}
                            {l("в коллекции", "in this room")}
                          </span>
                        </div>
                        <div className="family-grid">
                          {groupFamilies.map((f) => (
                            <FamilyCard
                              key={f.id}
                              family={f}
                              href={urlFor({
                                ...state,
                                family: f.id,
                                generation: defaults(f),
                              })}
                              onOpen={() => openFamily(f)}
                              saved={saved.includes(f.id)}
                              onSave={() => saveFamily(f.id)}
                              language={language}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
              </div>
            </section>
            <details className="collection-index">
              <summary>
                {l(
                  "Ищете конкретную модификацию? Открыть указатель названий",
                  "Looking for a specific variant? Open the name index",
                )}
              </summary>
              <section
                className="index-section models-index"
                aria-labelledby="index-title-all"
              >
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      {l("УКАЗАТЕЛЬ НАЗВАНИЙ", "NAME INDEX")}
                    </span>
                    <h2 id="index-title-all">
                      {l("Указатель BMW", "BMW name index")}
                    </h2>
                  </div>
                  <span className="edition">
                    {l(
                      "Названия модификаций · NHTSA vPIC",
                      "Variant names · NHTSA vPIC",
                    )}
                  </span>
                </div>
                {indexError ? (
                  <div className="empty-block panel">
                    <h3>
                      {l("Индекс не загрузился", "The index did not load")}
                    </h3>
                    <Button
                      variant="outline"
                      className="outline-action"
                      onClick={() => setIndexVersion((v) => v + 1)}
                    >
                      {l("Повторить загрузку", "Retry loading")}
                    </Button>
                  </div>
                ) : !index ? (
                  <p role="status">
                    {l("Загружаем полный индекс…", "Loading the full index…")}
                  </p>
                ) : modelIndexRows.length ? (
                  <>
                    <div className="index-grid all-model-index-grid">
                      {modelIndexRows.slice(0, indexPage * 36).map((m) => (
                        <button
                          key={m.id}
                          onClick={(event) => {
                            indexOpener.current = event.currentTarget;
                            setIndexDetail(m);
                          }}
                        >
                          <span>{m.make}</span>
                          <strong>{m.name}</strong>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                    {modelIndexRows.length > indexPage * 36 && (
                      <button
                        className="load-more"
                        onClick={() => setIndexPage((n) => n + 1)}
                      >
                        {l("Показать ещё 36", "Show 36 more")}{" "}
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </>
                ) : (
                  <p className="empty-inline">
                    {l(
                      "Такого названия пока нет в полном индексе BMW.",
                      "This name is not in the full BMW index yet.",
                    )}
                  </p>
                )}
              </section>
            </details>
          </section>
        ) : state.view === "photos" ? (
          <section className="page-enter">
            <div className="page-heading">
              <span className="eyebrow">
                {l("ФОРМЫ, КОТОРЫЕ ЗАПОМИНАЮТСЯ", "MEMORABLE FORMS")}
              </span>
              <h1>
                BMW {l("в", "in")} <em>{l("кадре.", "focus.")}</em>
              </h1>
              <p>
                {l(
                  "Рассматривайте силуэты, открывайте модели и замечайте изменения. Нажмите на фотографию, чтобы открыть её крупно.",
                  "Explore silhouettes and spot the changes. Select a photograph to see it in full detail.",
                )}
              </p>
            </div>
            <div className="gallery-tools">
              <div className="search-box collection-search">
                <Search size={22} />
                <input
                  ref={searchRef}
                  aria-label={l("Найти фотографию", "Find a photograph")}
                  placeholder={l(
                    "Модель или кузов: M3, E30, X7…",
                    "Model or body code: M3, E30, X7…",
                  )}
                  value={state.filters.query}
                  onChange={(e) => filters({ query: e.target.value })}
                />
                {state.filters.query && (
                  <button
                    aria-label={l("Очистить поиск", "Clear search")}
                    onClick={() => filters({ query: "" })}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <nav
                className="collection-tabs"
                aria-label={l("Залы фотогалереи", "Photo gallery rooms")}
              >
                {[
                  { id: "", label: l("Все фотографии", "All photographs") },
                  ...catalogGroups.map((group) => ({
                    id: group.id,
                    label:
                      group.id === "series"
                        ? l("Серии", "Series")
                        : group.eyebrow.replace("BMW ", ""),
                  })),
                ].map((group) => (
                  <button
                    key={group.id}
                    aria-pressed={state.collection === group.id}
                    onClick={() => navigate({ collection: group.id }, true)}
                  >
                    {group.label}
                  </button>
                ))}
              </nav>
              <div className="gallery-options">
                <button
                  className="facelift-filter"
                  aria-pressed={state.phase === "facelift"}
                  onClick={() =>
                    navigate({ phase: state.phase ? "" : "facelift" }, true)
                  }
                >
                  {state.phase && <span aria-hidden="true">✓ </span>}
                  {l("Только рестайлинги", "Facelifts only")}
                </button>
                <span aria-live="polite">
                  {l("Фотографий:", "Photographs:")} {galleryEntries.length}
                </span>
              </div>
            </div>
            {!galleryEntries.length && (
              <div className="collection-empty">
                <h3>
                  {l("Таких снимков пока нет", "No photographs match yet")}
                </h3>
                <p>
                  {l(
                    "Попробуйте другую модель или снимите ограничения.",
                    "Try another model or clear the filters.",
                  )}
                </p>
                <button
                  className="museum-cta"
                  onClick={() =>
                    navigate(
                      {
                        collection: "",
                        phase: "",
                        filters: { ...EMPTY_FILTERS },
                      },
                      true,
                    )
                  }
                >
                  {l("Все фотографии", "All photographs")}
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
            <div className="photo-gallery">
              {galleryEntries.map(({ family: f, generation: g }, index) => (
                <article className="panel" key={g.id}>
                  <VehiclePhoto
                    photo={g.photo}
                    language={language}
                    onOpen={() => {
                      photoOpener.current =
                        document.activeElement as HTMLElement;
                      setPhotoIndex(index);
                    }}
                  />
                  <a
                    className="text-action"
                    href={urlFor({
                      ...state,
                      family: f.id,
                      generation: g.id,
                      view: "catalog",
                    })}
                    onClick={(event) => {
                      if (!plainLeftClick(event)) return;
                      event.preventDefault();
                      navigate({
                        family: f.id,
                        generation: g.id,
                        view: "catalog",
                      });
                    }}
                  >
                    {f.name} · {g.code} <ArrowUpRight size={16} />
                  </a>
                </article>
              ))}
            </div>
            <p className="note">
              {l("С фотографией:", "With a photograph:")}{" "}
              {allGenerations.filter((x) => x.generation.photo).length}{" "}
              {l("из", "of")} {allGenerations.length}{" "}
              {l(
                "поколений / обзорных ветвей. Отсутствующие снимки добавляются после проверки версии и лицензии.",
                "generations / overview branches. Missing images are added only after the version and licence have been checked.",
              )}
            </p>
          </section>
        ) : state.view === "sources" ? (
          <section className="page-enter">
            <div className="page-heading">
              <span className="eyebrow">
                {l("ПРОЗРАЧНОСТЬ ПО УМОЛЧАНИЮ", "TRANSPARENCY BY DEFAULT")}
              </span>
              <h1>
                {l("Факты, которым", "Facts with")}
                <br />
                {l("можно", "a traceable")}{" "}
                <em>{l("найти начало.", "starting point.")}</em>
              </h1>
              <p>
                {l(
                  "Большой индекс помогает найти название. Подробная история появляется только вместе с источниками.",
                  "The broad index helps find a name. A detailed history appears only with sources.",
                )}
              </p>
            </div>
            <div className="coverage-grid">
              <article className="panel">
                <Database />
                <h3>
                  {index ? number(index.modelCount) : "…"}{" "}
                  {l("названия", "names")}
                </h3>
                <p>
                  {l(
                    "NHTSA vPIC · только BMW. Регуляторный каталог, прежде всего рынок США. В перечнях встречаются производные разных классов транспорта.",
                    "NHTSA vPIC · BMW only. A regulatory catalogue focused on the US market; entries can include derivatives from several vehicle classes.",
                  )}
                </p>
              </article>
              <article className="panel">
                <LayersIcon />
                <h3>
                  {families.length}{" "}
                  {l("подробные истории", "detailed histories")}
                </h3>
                <p>
                  {allGenerations.length}{" "}
                  {l(
                    "поколений / обзорных ветвей. Документированные данные из официальных материалов BMW.",
                    "generations / overview branches. Documented details from official BMW material.",
                  )}
                </p>
              </article>
              <article className="panel">
                <ShieldCheck />
                <h3>
                  {l("Без придуманной полноты", "No invented completeness")}
                </h3>
                <p>
                  {l(
                    "Нет факта — нет числа. Рестайлинг не смешивается с ежегодным обновлением, а производство — с продажами.",
                    "No fact means no number. A facelift is not mixed with a model-year update, and production is not mixed with sales.",
                  )}
                </p>
              </article>
            </div>
            <section className="panel">
              <h2>{l("Источники каталога", "Catalogue sources")}</h2>
              <div className="source-list">
                {sources.map((s) => (
                  <a href={s.url} key={s.id} target="_blank" rel="noreferrer">
                    <div>
                      <small>
                        {s.publisher} · {s.date}
                      </small>
                      <strong>{s.title}</strong>
                      <p>{s.scope}</p>
                    </div>
                    <ArrowUpRight size={18} />
                  </a>
                ))}
              </div>
            </section>
          </section>
        ) : (
          <div className="page-enter">
            {!state.filters.savedOnly ? (
              <Exhibition
                language={language}
                collectionHref={urlFor({
                  ...state,
                  view: "models",
                  collection: "",
                  filters: { ...EMPTY_FILTERS },
                })}
                onCollection={() => go("models")}
                onRandom={surprise}
                faceliftSelection={faceliftSelection}
                onFaceliftSelection={setFaceliftSelection}
                modelHref={(family, generation) =>
                  urlFor({ ...state, family, generation })
                }
                onModel={(family, generation) =>
                  navigate({ family, generation })
                }
              />
            ) : (
              <div className="page-heading">
                <span className="eyebrow">
                  {l("ВАШИ НАХОДКИ", "YOUR FINDS")}
                </span>
                <h1>
                  {l("Мой", "My")} <em>{l("гараж.", "garage.")}</em>
                </h1>
                <p>
                  {l(
                    "Истории, к которым хочется вернуться. Сохраняются в этом браузере.",
                    "Stories worth returning to. Saved in this browser.",
                  )}
                </p>
              </div>
            )}
            {state.filters.savedOnly || hasCatalogFilters ? (
              <section id="catalog" className="catalog-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">ВЫБЕРИТЕ ОТПРАВНУЮ ТОЧКУ</span>
                    <h2>
                      {state.filters.savedOnly
                        ? "Сохранённые модели"
                        : "Исследуйте BMW"}
                    </h2>
                  </div>
                  <span className="edition">КАТАЛОГ / 2026</span>
                </div>
                <div className="search-row">
                  <div className="search-box">
                    <Search size={22} />
                    <input
                      ref={searchRef}
                      aria-label="Поиск модели"
                      placeholder="Серия, модель или кузов: E30, 320i, G60…"
                      value={state.filters.query}
                      onChange={(e) => filters({ query: e.target.value })}
                    />
                    {state.filters.query && (
                      <button
                        aria-label="Очистить поиск"
                        onClick={() => filters({ query: "" })}
                      >
                        <X size={17} />
                      </button>
                    )}
                    <kbd>/</kbd>
                  </div>
                  <button
                    className={"filter-toggle " + (showFilters ? "active" : "")}
                    onClick={() => setShowFilters((x) => !x)}
                    aria-expanded={showFilters}
                  >
                    <SlidersHorizontal size={18} /> Фильтры
                    {activeFilters > 0 && <span>{activeFilters}</span>}
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="quick-filters">
                  <span>Начните с</span>
                  {[
                    "3 Series",
                    "5 Series",
                    "Isetta",
                    "M3",
                    "X5",
                    "GS",
                    "R 32",
                  ].map((b) => (
                    <button
                      key={b}
                      className={state.filters.query === b ? "active" : ""}
                      onClick={() =>
                        filters({ query: state.filters.query === b ? "" : b })
                      }
                    >
                      {b}
                    </button>
                  ))}
                  {hasCatalogFilters && (
                    <button
                      className="reset-link"
                      onClick={() =>
                        filters({
                          ...EMPTY_FILTERS,
                          savedOnly: state.filters.savedOnly,
                        })
                      }
                    >
                      Сбросить всё <X size={13} />
                    </button>
                  )}
                </div>
                {showFilters && (
                  <div className="filter-panel">
                    <label>
                      Год поколения
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        placeholder="Например, 2019"
                        value={state.filters.year}
                        onChange={(e) => filters({ year: e.target.value })}
                      />
                    </label>
                    <label>
                      Топливо
                      <select
                        value={state.filters.fuel}
                        onChange={(e) => filters({ fuel: e.target.value })}
                      >
                        <option value="">Любое</option>
                        {[
                          "Бензин",
                          "Дизель",
                          "Mild hybrid",
                          "Plug-in hybrid",
                          "Электро",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Кузов
                      <select
                        value={state.filters.body}
                        onChange={(e) => filters({ body: e.target.value })}
                      >
                        <option value="">Любой</option>
                        {[...new Set(families.flatMap((f) => f.body))]
                          .sort()
                          .map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Страна сборки
                      <select
                        value={state.filters.country}
                        onChange={(e) => filters({ country: e.target.value })}
                      >
                        <option value="">Все страны</option>
                        {[...new Set(families.flatMap((f) => f.countries))]
                          .sort()
                          .map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                      </select>
                    </label>
                    <p>Фильтры учитывают только добавленные характеристики.</p>
                  </div>
                )}
                <div className="results-heading">
                  <h3>
                    Истории в деталях <span>{filtered.length}</span>
                  </h3>
                  <span>
                    <span className="tiny-dot" /> С источниками и поколениями
                  </span>
                </div>
                {filtered.length ? (
                  <div className="family-grid">
                    {[...filtered]
                      .sort((a, b) => catalogRank(a.id) - catalogRank(b.id))
                      .map((f) => (
                        <FamilyCard
                          key={f.id}
                          family={f}
                          href={urlFor({
                            ...state,
                            family: f.id,
                            generation: defaults(f),
                          })}
                          onOpen={() => openFamily(f)}
                          saved={saved.includes(f.id)}
                          onSave={() => saveFamily(f.id)}
                          language={language}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="empty-block panel">
                    <Bookmark size={26} />
                    <h3>
                      {state.filters.savedOnly
                        ? "Здесь будут ваши находки"
                        : "Подробная история пока не найдена"}
                    </h3>
                    <p>
                      {state.filters.savedOnly
                        ? "Добавьте интересную модель в гараж с помощью закладки."
                        : "Попробуйте убрать часть фильтров или найти название в широком индексе ниже."}
                    </p>
                    <Button
                      variant="outline"
                      className="outline-action"
                      onClick={() => go("models")}
                    >
                      Показать все истории
                    </Button>
                  </div>
                )}
                {!state.filters.savedOnly && (
                  <section className="index-section">
                    <div className="results-heading">
                      <h3>
                        Индекс названий BMW{" "}
                        <span>{number(nameRows.length)}</span>
                      </h3>
                      <span>
                        NHTSA vPIC · названия без полных характеристик
                      </span>
                    </div>
                    {indexError ? (
                      <div className="empty-block panel">
                        <h3>Индекс не загрузился</h3>
                        <p>
                          Подробные истории выше доступны. Повторите загрузку
                          индекса.
                        </p>
                        <button
                          className="text-action"
                          onClick={() => setIndexVersion((v) => v + 1)}
                        >
                          Повторить <ArrowRight size={16} />
                        </button>
                      </div>
                    ) : !index ? (
                      <p role="status">Загружаем индекс…</p>
                    ) : nameRows.length ? (
                      <>
                        <div className="index-grid">
                          {nameRows.slice(0, indexPage * 18).map((m) => (
                            <button
                              key={m.id}
                              onClick={(event) => {
                                indexOpener.current = event.currentTarget;
                                setIndexDetail(m);
                              }}
                            >
                              <span>{m.make}</span>
                              <strong>{m.name}</strong>
                              <ArrowUpRight size={15} />
                            </button>
                          ))}
                        </div>
                        {nameRows.length > indexPage * 18 && (
                          <button
                            className="load-more"
                            onClick={() => setIndexPage((n) => n + 1)}
                          >
                            Показать ещё 18 <ArrowRight size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="empty-inline">
                        {activeFilters
                          ? "У названий индекса нет технических полей для этих фильтров."
                          : "Такого названия в текущем индексе нет. Попробуйте оригинальное название BMW."}
                      </p>
                    )}
                    <p className="index-note">
                      Указатель названий NHTSA · обновлён{" "}
                      {index?.retrievedAt.slice(0, 10) ?? "…"} ·{" "}
                      <button onClick={() => go("sources")}>
                        Как устроены данные <ArrowUpRight size={12} />
                      </button>
                    </p>
                  </section>
                )}
              </section>
            ) : (
              <section className="collection-invitation">
                <span className="eyebrow">
                  {l("ВАША СЛЕДУЮЩАЯ НАХОДКА", "YOUR NEXT DISCOVERY")}
                </span>
                <h2>{l("Какой BMW — ваш?", "Which BMW is yours?")}</h2>
                <p>
                  {l(
                    "Пройдите по залам коллекции. Сравните поколения, рассмотрите рестайлинги и соберите свой гараж.",
                    "Walk through the collection. Explore generations, spot facelift details and build your own garage.",
                  )}
                </p>
                <a
                  className="museum-cta"
                  href={urlFor({
                    ...state,
                    view: "models",
                    collection: "",
                    filters: { ...EMPTY_FILTERS },
                  })}
                  onClick={(event) => {
                    if (!plainLeftClick(event)) return;
                    event.preventDefault();
                    go("models");
                  }}
                >
                  {l("Все модели", "All models")}
                  <ArrowRight size={18} />
                </a>
              </section>
            )}
          </div>
        )}
      </main>
      <dialog
        ref={photoDialog}
        className="photo-dialog"
        aria-label={l("Просмотр фотографии", "Photo viewer")}
        onCancel={(event) => {
          event.preventDefault();
          setPhotoIndex(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPhotoIndex(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            setPhotoIndex((index) =>
              index === null
                ? null
                : (index +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    galleryEntries.length) %
                  galleryEntries.length,
            );
          }
        }}
      >
        {photoIndex !== null && (
          <div className="photo-viewer">
            <div className="photo-viewer-heading">
              <strong>
                {galleryEntries[photoIndex].generation.photo!.subject}
              </strong>
              <button
                onClick={() => setPhotoIndex(null)}
                aria-label={l("Закрыть фотографию", "Close photo")}
                autoFocus
              >
                <X />
              </button>
            </div>
            <img
              src={
                import.meta.env.BASE_URL +
                galleryEntries[photoIndex].generation.photo!.url
              }
              alt={galleryEntries[photoIndex].generation.photo!.subject}
            />
            <a
              className="photo-story-link"
              href={urlFor({
                ...state,
                family: galleryEntries[photoIndex].family.id,
                generation: galleryEntries[photoIndex].generation.id,
              })}
              onClick={(event) => {
                if (!plainLeftClick(event)) return;
                event.preventDefault();
                const entry = galleryEntries[photoIndex];
                setPhotoIndex(null);
                navigate({
                  family: entry.family.id,
                  generation: entry.generation.id,
                });
              }}
            >
              {l("Открыть историю модели", "Explore this model")}
              <ArrowUpRight size={18} />
            </a>
            <div className="photo-viewer-controls">
              <button
                onClick={() =>
                  setPhotoIndex(
                    (photoIndex - 1 + galleryEntries.length) %
                      galleryEntries.length,
                  )
                }
                disabled={galleryEntries.length < 2}
                aria-label={l("Предыдущее фото", "Previous photo")}
              >
                <ArrowLeft />
              </button>
              <span aria-live="polite">
                {photoIndex + 1} / {galleryEntries.length}
              </span>
              <button
                onClick={() =>
                  setPhotoIndex((photoIndex + 1) % galleryEntries.length)
                }
                disabled={galleryEntries.length < 2}
                aria-label={l("Следующее фото", "Next photo")}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        )}
      </dialog>
      {indexDetail && (
        <dialog
          ref={dialogRef}
          className="index-dialog"
          aria-labelledby="index-title"
          onCancel={(event) => {
            event.preventDefault();
            setIndexDetail(null);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIndexDetail(null);
          }}
        >
          <section className="index-modal">
            <button
              className="close-modal"
              aria-label="Закрыть карточку индекса"
              onClick={() => setIndexDetail(null)}
              autoFocus
            >
              <X />
            </button>
            <span className="eyebrow">НАЗВАНИЕ В КАТАЛОГЕ NHTSA</span>
            <h2 id="index-title">
              {indexDetail.make}
              <br />
              {indexDetail.name}
            </h2>
            <p>
              Модель есть в поисковом индексе. Подробная история поколений,
              рестайлингов и двигателей пока не добавлена.
            </p>
            <div className="note">
              <Database size={18} />
              Мы не подставляем характеристики похожего автомобиля.
            </div>
            <Button className="primary-action" onClick={showDetailedStories}>
              Посмотреть подробные истории
            </Button>
          </section>
        </dialog>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      <footer className="site-footer">
        <div>
          <span className="footer-brand">
            BMW atlas<span>●</span>
          </span>
          <p>
            {l(
              "Независимая энциклопедия BMW.",
              "An independent BMW encyclopedia.",
            )}
          </p>
        </div>
        <span>© 2026 BMW Atlas</span>
        <button onClick={() => go("sources")}>
          {l("Данные и источники", "Data and sources")}{" "}
          <ArrowUpRight size={14} />
        </button>
      </footer>
    </>
  );
}
function LayersIcon() {
  return <Database />;
}
