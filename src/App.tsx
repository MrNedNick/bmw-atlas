import { AtelierGallery } from "./features/AtelierGallery";
import { t, catalogText } from "./i18n";
import { CollectionCatalog } from "./features/CollectionCatalog";
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
import { Exhibition } from "./features/Exhibition";
import { FamilyDetail, SourceLink } from "./features/FamilyDetail";
const number = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const defaults = (f: ModelFamily) =>
  f.id === "bmw-3-series"
    ? "bmw-g20"
    : f.id === "bmw-2-coupe"
      ? "bmw-2-g42"
      : f.generations.at(-1)!.id;
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
  view: "catalog" | "models" | "sources" | "photos" | "ateliers";
  phase: "" | "facelift";
  collection: string;
  decade: string;
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
    view:
      v === "models" || v === "sources" || v === "photos" || v === "ateliers"
        ? v
        : "catalog",
    decade: /^(19|20)\d0$/.test(q.get("decade") ?? "") ? q.get("decade")! : "",
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
  if (state.decade) q.set("decade", state.decade);
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
              ? t(language, "remove.from.garage.24c23b")
              : t(language, "add.to.garage.83f4a4")) + family.name
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
              {family.generations.at(-1)!.end ?? t(language, "today.6370c3")}
            </span>
            <h3>{family.name}</h3>
          </div>
          <span className="round-arrow">
            <ArrowUpRight size={22} />
          </span>
        </div>
        <p>
          {isEnglish
            ? catalogText(language, `family.${family.id}.tagline`)
            : family.tagline}
        </p>
        <div className="card-metrics">
          <span>
            {t(language, "generations.versions.cc0819")}
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
  const [collectionFiltersExpanded, setCollectionFiltersExpanded] =
    useState(false);
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
  const text = {
    skip: t(language, "skip.to.content.e64281"),
    catalog: t(language, "bmw.atlas.catalog.c8726f"),
    models: t(language, "all.models.a1334b"),
    garage: t(language, "my.garage.dc4a1b"),
    photos: t(language, "photos.d4ae0b"),
    about: t(language, "about.the.data.5c1bff"),
    light: t(language, "light.theme.699557"),
    dark: t(language, "dark.theme.054139"),
    language: t(language, ".9e327a"),
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
        ? t(language, "removed.from.garage.4bc665")
        : t(language, "in.your.garage.8488bc")) +
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
      decade: "",
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
          <nav aria-label={t(language, "main.navigation.e7a083")}>
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
            <a
              className={state.view === "ateliers" ? "active" : ""}
              href="?view=ateliers"
              onClick={(event) => {
                if (
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                go("ateliers");
              }}
            >
              {t(language, "heritage.nav")}
            </a>
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
                    {t(language, "keep.exploring.38917d")}
                  </span>
                  <h2 id="next-exhibits-title">
                    {t(language, "nearby.in.the.collection.01c569")}
                  </h2>
                </div>
                <button className="text-action" onClick={backToModels}>
                  {t(language, "back.to.the.collection.8c3cc2")}
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
        ) : state.view === "ateliers" ? (
          <AtelierGallery language={language} />
        ) : state.view === "models" ? (
          <section className="page-enter all-models-page">
            <CollectionCatalog
              expanded={collectionFiltersExpanded}
              onExpandedChange={setCollectionFiltersExpanded}
              inputRef={searchRef}
              families={orderedFamilies}
              selection={state}
              saved={saved}
              language={language}
              onChange={(patch) => {
                navigate(patch, true);
                setIndexPage(1);
              }}
              onSave={saveFamily}
              onOpen={(family, generation) =>
                navigate({ family: family.id, generation: generation.id })
              }
              hrefFor={(family, generation) =>
                urlFor({
                  ...state,
                  family: family.id,
                  generation: generation.id,
                })
              }
            />
            <details className="collection-index">
              <summary>
                {t(
                  language,
                  "looking.for.a.specific.variant.open.the.name.ind.85e2b8",
                )}
              </summary>
              <section
                className="index-section models-index"
                aria-labelledby="index-title-all"
              >
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      {t(language, "name.index.26de5a")}
                    </span>
                    <h2 id="index-title-all">
                      {t(language, "bmw.name.index.b32efc")}
                    </h2>
                  </div>
                  <span className="edition">
                    {t(language, "variant.names.nhtsa.vpic.e9daa8")}
                  </span>
                </div>
                {indexError ? (
                  <div className="empty-block panel">
                    <h3>{t(language, "the.index.did.not.load.aedff6")}</h3>
                    <Button
                      variant="outline"
                      className="outline-action"
                      onClick={() => setIndexVersion((v) => v + 1)}
                    >
                      {t(language, "retry.loading.f3a882")}
                    </Button>
                  </div>
                ) : !index ? (
                  <p role="status">
                    {t(language, "loading.the.full.index.77f26d")}
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
                        {t(language, "show.36.more.3f8d2f")}{" "}
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </>
                ) : (
                  <p className="empty-inline">
                    {t(
                      language,
                      "this.name.is.not.in.the.full.bmw.index.yet.c5b565",
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
                {t(language, "memorable.forms.c86078")}
              </span>
              <h1>
                BMW {t(language, "in.c0d3b6")}{" "}
                <em>{t(language, "focus.2deb8a")}</em>
              </h1>
              <p>
                {t(
                  language,
                  "explore.silhouettes.and.spot.the.changes.select..200315",
                )}
              </p>
            </div>
            <div className="gallery-tools">
              <div className="search-box collection-search">
                <Search size={22} />
                <input
                  ref={searchRef}
                  aria-label={t(language, "find.a.photograph.e90bce")}
                  placeholder={t(
                    language,
                    "model.or.body.code.m3.e30.x7.0035ab",
                  )}
                  value={state.filters.query}
                  onChange={(e) => filters({ query: e.target.value })}
                />
                {state.filters.query && (
                  <button
                    aria-label={t(language, "clear.search.c7e7dd")}
                    onClick={() => filters({ query: "" })}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <nav
                className="collection-tabs"
                aria-label={t(language, "photo.gallery.rooms.b5fad2")}
              >
                {[
                  { id: "", label: t(language, "all.photographs.43f9b2") },
                  ...catalogGroups.map((group) => ({
                    id: group.id,
                    label:
                      group.id === "series"
                        ? t(language, "series.02480d")
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
                  {t(language, "facelifts.only.bceae2")}
                </button>
                <span aria-live="polite">
                  {t(language, "photographs.6f9461")} {galleryEntries.length}
                </span>
              </div>
            </div>
            {!galleryEntries.length && (
              <div className="collection-empty">
                <h3>{t(language, "no.photographs.match.yet.ce1313")}</h3>
                <p>
                  {t(language, "try.another.model.or.clear.the.filters.c4a280")}
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
                  {t(language, "all.photographs.43f9b2")}
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
              {t(language, "with.a.photograph.327461")}{" "}
              {allGenerations.filter((x) => x.generation.photo).length}{" "}
              {t(language, "of.777fa2")} {allGenerations.length}{" "}
              {t(
                language,
                "generations.overview.branches.missing.images.are.86e6ce",
              )}
            </p>
          </section>
        ) : state.view === "sources" ? (
          <section className="page-enter">
            <div className="page-heading">
              <span className="eyebrow">
                {t(language, "transparency.by.default.29c6e6")}
              </span>
              <h1>
                {t(language, "facts.with.bbfcb2")}
                <br />
                {t(language, "a.traceable.d9f8a3")}{" "}
                <em>{t(language, "starting.point.b11228")}</em>
              </h1>
              <p>
                {t(
                  language,
                  "the.broad.index.helps.find.a.name.a.detailed.his.eda53b",
                )}
              </p>
            </div>
            <div className="coverage-grid">
              <article className="panel">
                <Database />
                <h3>
                  {index ? number(index.modelCount) : "…"}{" "}
                  {t(language, "names.c4802c")}
                </h3>
                <p>
                  {t(
                    language,
                    "nhtsa.vpic.bmw.only.a.regulatory.catalogue.focus.e44fcf",
                  )}
                </p>
              </article>
              <article className="panel">
                <LayersIcon />
                <h3>
                  {families.length} {t(language, "detailed.histories.a84df2")}
                </h3>
                <p>
                  {allGenerations.length}{" "}
                  {t(
                    language,
                    "generations.overview.branches.documented.details.c9c23d",
                  )}
                </p>
              </article>
              <article className="panel">
                <ShieldCheck />
                <h3>{t(language, "no.invented.completeness.06be8e")}</h3>
                <p>
                  {t(
                    language,
                    "no.fact.means.no.number.a.facelift.is.not.mixed..b6b495",
                  )}
                </p>
              </article>
            </div>
            <section className="panel">
              <h2>{t(language, "catalogue.sources.8dafd2")}</h2>
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
                  {t(language, "your.finds.931e1c")}
                </span>
                <h1>
                  {t(language, "my.c8bf97")}{" "}
                  <em>{t(language, "garage.2bdc8c")}</em>
                </h1>
                <p>
                  {t(
                    language,
                    "stories.worth.returning.to.saved.in.this.browser.0bef96",
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
                  {t(language, "your.next.discovery.be1836")}
                </span>
                <h2>{t(language, "which.bmw.is.yours.69f5b8")}</h2>
                <p>
                  {t(
                    language,
                    "walk.through.the.collection.explore.generations..da6c86",
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
                  {t(language, "all.models.a1334b")}
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
        aria-label={t(language, "photo.viewer.b585d5")}
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
                aria-label={t(language, "close.photo.0832d4")}
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
              {t(language, "explore.this.model.59653f")}
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
                aria-label={t(language, "previous.photo.0de76c")}
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
                aria-label={t(language, "next.photo.4f561f")}
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
          <p>{t(language, "an.independent.bmw.encyclopedia.e06c1f")}</p>
        </div>
        <span>© 2026 BMW Atlas</span>
        <button onClick={() => go("sources")}>
          {t(language, "data.and.sources.f8a9a4")} <ArrowUpRight size={14} />
        </button>
      </footer>
    </>
  );
}
function LayersIcon() {
  return <Database />;
}
