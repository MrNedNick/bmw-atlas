import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Bookmark,
  GitCompareArrows,
  Compass,
  Sun,
  Moon,
  ChevronDown,
  X,
  Check,
  ShieldCheck,
  Database,
  Globe2,
  ArrowLeft,
} from "lucide-react";
import { families, allGenerations } from "./data/models";
import { sources } from "./data/sources";
import {
  EMPTY_FILTERS,
  familyMatches,
  matchesText,
  formatYears,
  formatVolume,
  parseSelection,
  type Filters,
  type IndexSnapshot,
  type ModelFamily,
  type IndexModel,
} from "./domain/catalog";
import { Button } from "./components/button/button";
import { useSaved, useTheme } from "./lib/preferences";
import { VehiclePhoto } from "./features/VehiclePhoto";
import { FamilyDetail, SourceLink } from "./features/FamilyDetail";
const number = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const defaults = (f: ModelFamily) =>
  f.id === "bmw-3-series" ? "bmw-g20" : f.generations.at(-1)!.id;
interface PageState {
  view: "catalog" | "compare" | "sources" | "photos";
  family: string;
  generation: string;
  filters: Filters;
  compare: string[];
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
    view: v === "compare" || v === "sources" || v === "photos" ? v : "catalog",
    family: families.some((f) => f.id === family) ? family : "",
    generation: q.get("generation") ?? "",
    filters: filter,
    compare: parseSelection(
      q.get("compare"),
      allGenerations.map((x) => x.generation.id),
    ),
  };
}
function urlFor(state: PageState) {
  const q = new URLSearchParams();
  if (state.view !== "catalog") q.set("view", state.view);
  if (state.family) q.set("model", state.family);
  if (state.generation) q.set("generation", state.generation);
  for (const [key, value] of Object.entries(state.filters)) {
    if (key === "savedOnly") {
      if (value) q.set("saved", "1");
    } else if (value) q.set(key, String(value));
  }
  if (state.compare.length) q.set("compare", state.compare.join(","));
  return location.pathname + (q.size ? "?" + q : "");
}
function FamilyCard({
  family,
  onOpen,
  saved,
  onSave,
}: {
  family: ModelFamily;
  onOpen: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="family-card blue-card">
      <div className="card-top">
        <span>
          {family.vehicleKind === "Мотоцикл" ? "BMW MOTORRAD" : family.brand}
        </span>
        <button
          className={"bookmark " + (saved ? "is-saved" : "")}
          aria-label={(saved ? "Убрать из гаража " : "В гараж ") + family.name}
          aria-pressed={saved}
          onClick={onSave}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <button className="card-open" onClick={onOpen}>
        <div className="card-visual">
          <VehiclePhoto
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
              {family.generations.at(-1)!.end ?? "СЕГОДНЯ"}
            </span>
            <h3>{family.name}</h3>
          </div>
          <span className="round-arrow">
            <ArrowUpRight size={22} />
          </span>
        </div>
        <p>{family.tagline}</p>
        <div className="card-metrics">
          <span>
            <strong>{family.generations.length}</strong> поколений / ветвей
          </span>
          <span>
            <strong>
              {family.generations.reduce((n, g) => n + g.powertrains.length, 0)}
            </strong>{" "}
            силовых вариантов в базе
          </span>
        </div>
      </button>
    </article>
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
    { theme, toggleTheme } = useTheme();
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
    const pop = () => {
      setState(readUrl());
      setIndexDetail(null);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(patch: Partial<PageState>, replace = false) {
    const next = { ...state, ...patch };
    history[replace ? "replaceState" : "pushState"]({}, "", urlFor(next));
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
  function openFamily(f: ModelFamily) {
    navigate({ view: "catalog", family: f.id, generation: defaults(f) });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function compare(id: string) {
    const next = state.compare.includes(id)
      ? state.compare.filter((x) => x !== id)
      : [...state.compare, id];
    if (next.length > 4) {
      setNotice("В сравнении можно оставить до четырёх поколений.");
      return;
    }
    navigate({ compare: next });
  }
  function go(view: PageState["view"], garage = false) {
    navigate({
      view,
      family: "",
      generation: "",
      filters: { ...EMPTY_FILTERS, savedOnly: garage },
    });
    window.scrollTo({ top: 0, behavior: "instant" });
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
  const family = families.find((f) => f.id === state.family);
  const generation =
    family?.generations.find((g) => g.id === state.generation) ??
    (family
      ? family.generations.find((g) => g.id === defaults(family))
      : undefined);
  const activeFilters = Object.entries(state.filters).filter(
    ([k, v]) => k !== "query" && !!v,
  ).length;
  const compared = allGenerations.filter((x) =>
    state.compare.includes(x.generation.id),
  );
  return (
    <>
      <a className="skip" href="#main">
        Перейти к содержимому
      </a>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => go("catalog")}
            aria-label="BMW Atlas — каталог"
          >
            <span className="brand-mark">
              <Compass size={23} />
            </span>
            <span>
              BMW<span className="brand-light">atlas</span>
              <sup>●</sup>
            </span>
          </button>
          <nav aria-label="Основная навигация">
            <button
              className={
                state.view === "catalog" && !state.filters.savedOnly
                  ? "active"
                  : ""
              }
              onClick={() => go("catalog")}
            >
              Каталог
            </button>
            <button
              className={state.view === "compare" ? "active" : ""}
              onClick={() => go("compare")}
            >
              Сравнение
              {state.compare.length > 0 && (
                <span className="nav-count">{state.compare.length}</span>
              )}
            </button>
            <button
              className={state.filters.savedOnly ? "active" : ""}
              onClick={() => go("catalog", true)}
            >
              Мой гараж
              {saved.length > 0 && (
                <span className="nav-count">{saved.length}</span>
              )}
            </button>
          </nav>
          <div className="header-right">
            <button className="photo-nav" onClick={() => go("photos")}>
              Фото
            </button>
            <button className="about-link" onClick={() => go("sources")}>
              О данных <ArrowUpRight size={14} />
            </button>
            <button
              className="theme-button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="main-container">
        {family && generation ? (
          <FamilyDetail
            family={family}
            generation={generation}
            onGeneration={(id) => navigate({ generation: id })}
            onBack={() => navigate({ family: "", generation: "" })}
            saved={saved.includes(family.id)}
            onSave={() => toggle(family.id)}
            compare={state.compare}
            onCompare={compare}
          />
        ) : state.view === "compare" ? (
          <section className="page-enter">
            <div className="page-heading">
              <span className="eyebrow">РЯДОМ ВИДНО БОЛЬШЕ</span>
              <h1>
                Сравнение <em>поколений.</em>
              </h1>
              <p>До четырёх вариантов. Прочерк — неизвестное, а не ноль.</p>
            </div>
            {compared.length ? (
              <>
                <div className="compare-scroll">
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th>Характеристика</th>
                        {compared.map(({ family: f, generation: g }) => (
                          <th key={g.id}>
                            <button
                              className="remove-compare"
                              aria-label={"Убрать " + f.name + " " + g.code}
                              onClick={() => compare(g.id)}
                            >
                              <X size={16} />
                            </button>
                            <span className="eyebrow">{f.brand}</span>
                            <h3>{f.name}</h3>
                            <strong>{g.code}</strong>
                            <button
                              className="text-action"
                              onClick={() =>
                                navigate({
                                  family: f.id,
                                  generation: g.id,
                                  view: "catalog",
                                })
                              }
                            >
                              Открыть <ArrowUpRight size={14} />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "Период производства",
                          ({ generation: g }: (typeof compared)[number]) =>
                            formatYears(g),
                        ],
                        [
                          "Известные рестайлинги",
                          ({ generation: g }: (typeof compared)[number]) =>
                            g.revisions
                              .filter(
                                (revision) => revision.kind === "facelift",
                              )
                              .map((revision) => revision.year)
                              .join(", ") || "Нет данных",
                        ],
                        [
                          "Силовые варианты в базе",
                          ({ generation: g }: (typeof compared)[number]) =>
                            g.powertrains.length
                              ? String(g.powertrains.length)
                              : "Не добавлены",
                        ],
                        [
                          "Топливо в источниках",
                          ({ generation: g }: (typeof compared)[number]) =>
                            [...new Set(g.powertrains.map((p) => p.fuel))].join(
                              ", ",
                            ) || "Нет данных",
                        ],
                        [
                          "Тираж поколения",
                          ({ generation: g }: (typeof compared)[number]) =>
                            g.volume
                              ? `${formatVolume(g.volume)} · ${g.volume.metric} · ${g.volume.asOf}`
                              : "Нет данных",
                        ],
                        [
                          "Подтверждённая сборка",
                          ({ generation: g }: (typeof compared)[number]) =>
                            g.assembly.join(", ") || "Не уточнена",
                        ],
                        [
                          "Оценка безопасности",
                          ({ generation: g }: (typeof compared)[number]) =>
                            g.ratings.length
                              ? g.ratings
                                  .map((rating) =>
                                    rating.status === "rated"
                                      ? `${rating.scheme}, ${rating.protocolYear}`
                                      : `${rating.scheme}: нет данных`,
                                  )
                                  .join("; ")
                              : "Не добавлена",
                        ],
                      ].map(([label, render]) => (
                        <tr key={label as string}>
                          <th>{label as string}</th>
                          {compared.map((item) => (
                            <td key={item.generation.id}>
                              {(render as (x: typeof item) => string)(item)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="note">
                  <ShieldCheck size={16} />
                  Сравниваются только сведения в базе. Полнота может
                  различаться; производственные периоды имеют собственную
                  область. Это не рейтинг надёжности.
                </p>
                <Button
                  className="primary-action"
                  onClick={() => go("catalog")}
                >
                  Добавить ещё поколение <ArrowRight size={16} />
                </Button>
              </>
            ) : (
              <div className="empty-block panel">
                <GitCompareArrows size={32} />
                <h2>Что будем сравнивать?</h2>
                <p>
                  Откройте историю модели, выберите поколение и нажмите
                  «Сравнить поколение».
                </p>
                <Button
                  className="primary-action"
                  onClick={() => go("catalog")}
                >
                  Исследовать каталог <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </section>
        ) : state.view === "photos" ? (
          <section className="page-enter">
            <div className="page-heading">
              <span className="eyebrow">ФОРМЫ, КОТОРЫЕ ЗАПОМИНАЮТСЯ</span>
              <h1>
                BMW в <em>кадре.</em>
              </h1>
              <p>
                Фотографии и редакционные визуализации. Точные подписи кузовов и
                открытые источники каждого изображения.
              </p>
            </div>
            <div className="photo-gallery">
              {allGenerations
                .filter((x) => x.generation.photo)
                .map(({ family: f, generation: g }) => (
                  <article className="panel" key={g.id}>
                    <VehiclePhoto photo={g.photo} />
                    <button
                      className="text-action"
                      onClick={() =>
                        navigate({
                          family: f.id,
                          generation: g.id,
                          view: "catalog",
                        })
                      }
                    >
                      {f.name} · {g.code} <ArrowUpRight size={16} />
                    </button>
                  </article>
                ))}
            </div>
            <p className="note">
              С фотографией:{" "}
              {allGenerations.filter((x) => x.generation.photo).length} из{" "}
              {allGenerations.length} поколений / обзорных ветвей. Отсутствующие
              снимки добавляются после проверки версии и лицензии.
            </p>
          </section>
        ) : state.view === "sources" ? (
          <section className="page-enter">
            <div className="page-heading">
              <span className="eyebrow">ПРОЗРАЧНОСТЬ ПО УМОЛЧАНИЮ</span>
              <h1>
                Факты, которым
                <br />
                можно <em>найти начало.</em>
              </h1>
              <p>
                Большой индекс помогает найти название. Подробная история
                появляется только вместе с источниками.
              </p>
            </div>
            <div className="coverage-grid">
              <article className="panel">
                <Database />
                <h3>{index ? number(index.modelCount) : "…"} названия</h3>
                <p>
                  NHTSA vPIC · только BMW. Регуляторный каталог, прежде всего
                  рынок США. В перечнях встречаются производные разных классов
                  транспорта.
                </p>
              </article>
              <article className="panel">
                <LayersIcon />
                <h3>{families.length} подробные истории</h3>
                <p>
                  {allGenerations.length} поколений / обзорных ветвей.
                  Документированные данные из официальных материалов BMW.
                </p>
              </article>
              <article className="panel">
                <ShieldCheck />
                <h3>Без придуманной полноты</h3>
                <p>
                  Нет факта — нет числа. Рестайлинг не смешивается с ежегодным
                  обновлением, а производство — с продажами.
                </p>
              </article>
            </div>
            <section className="panel">
              <h2>Источники каталога</h2>
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
              <section className="home-hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span className="live-dot" /> НЕЗАВИСИМАЯ ЭНЦИКЛОПЕДИЯ BMW
                  </div>
                  <h1>
                    BMW.
                    <br />
                    История в <em>деталях.</em>
                  </h1>
                  <p>
                    Поколения, рестайлинги, двигатели и страны производства. От
                    классики до современных BMW. Исследуйте подтверждённую часть
                    истории марки.
                  </p>
                  <a className="hero-cta" href="#catalog">
                    Найти свою модель <ArrowRight size={18} />
                  </a>
                  <div className="hero-proof">
                    <ShieldCheck size={16} />
                    <span>Реальные источники. Честные пробелы.</span>
                  </div>
                </div>
                <div className="hero-image">
                  <img
                    src={
                      import.meta.env.BASE_URL +
                      "images/editorial-bmw-x5-g65.webp"
                    }
                    alt="BMW X5 40 xDrive · G65, 2026"
                  />
                  <div className="hero-image-overlay" />
                  <span className="photo-label">В ФОКУСЕ / 01</span>
                  <div className="hero-photo-title">
                    <span>BMW / X5 · V ПОКОЛЕНИЕ</span>
                    <strong>
                      G65 <em>40 xDrive</em>
                    </strong>
                    <button
                      onClick={() => {
                        navigate({
                          family: "bmw-x5",
                          generation: "bmw-x5-g65",
                        });
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      aria-label="Изучить BMW X5 G65"
                    >
                      <ArrowUpRight size={24} />
                    </button>
                  </div>
                  <a
                    className="photo-credit"
                    href={
                      families
                        .find((f) => f.id === "bmw-x5")!
                        .generations.find((g) => g.id === "bmw-x5-g65")!.photo!
                        .page
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    BMW X5 G65 · BMW Group PressClub · редакционная визуализация
                  </a>
                </div>
              </section>
            ) : (
              <div className="page-heading">
                <span className="eyebrow">ВАШИ НАХОДКИ</span>
                <h1>
                  Мой <em>гараж.</em>
                </h1>
                <p>
                  Истории, к которым хочется вернуться. Сохраняются в этом
                  браузере.
                </p>
              </div>
            )}
            <div className="stats-strip">
              <div>
                <strong>{index ? number(index.modelCount) : "…"}</strong>
                <span>названий BMW в индексе</span>
              </div>
              <div>
                <strong>{families.length.toString().padStart(2, "0")}</strong>
                <span>подробные истории</span>
              </div>
              <div>
                <strong>{allGenerations.length}</strong>
                <span>поколений / обзорных ветвей</span>
              </div>
              <div className="stats-description">
                <Globe2 size={19} />
                <span>
                  История одной марки.
                  <br />
                  Проверенные детали.
                </span>
              </div>
            </div>
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
                {activeFilters > 0 && (
                  <button
                    className="reset-link"
                    onClick={() => navigate({ filters: EMPTY_FILTERS }, true)}
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
                    Топливо в базе
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
                    Кузов семейства
                    <select
                      value={state.filters.body}
                      onChange={(e) => filters({ body: e.target.value })}
                    >
                      <option value="">Любой</option>
                      {[
                        "Седан",
                        "Хэтчбек",
                        "Лифтбек",
                        "Универсал",
                        "Купе",
                        "Кабриолет",
                        "Микролитражка",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Сборка в источниках
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
                  <p>
                    Технические фильтры работают по подробным историям.
                    География относится к области источника; отсутствие записи
                    не означает отсутствие такой версии.
                  </p>
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
                  {filtered.map((f) => (
                    <FamilyCard
                      key={f.id}
                      family={f}
                      onOpen={() => openFamily(f)}
                      saved={saved.includes(f.id)}
                      onSave={() => toggle(f.id)}
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
                    onClick={() => navigate({ filters: EMPTY_FILTERS }, true)}
                  >
                    Показать все истории
                  </Button>
                </div>
              )}
              {!state.filters.savedOnly && (
                <section className="index-section">
                  <div className="results-heading">
                    <h3>
                      Индекс названий BMW <span>{number(nameRows.length)}</span>
                    </h3>
                    <span>NHTSA vPIC · названия без полных характеристик</span>
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
                    Индекс расширяет поиск, но не обещает характеристик каждой
                    модели. Снимок {index?.retrievedAt.slice(0, 10) ?? "…"} ·{" "}
                    <button onClick={() => go("sources")}>
                      Как устроены данные <ArrowUpRight size={12} />
                    </button>
                  </p>
                </section>
              )}
            </section>
            <section className="coverage-paths">
              <span className="eyebrow">ОТ ПЕРВЫХ BMW ДО СЕГОДНЯ</span>
              <h3>Энциклопедия растёт по семействам</h3>
              <p>
                Подробные статьи доступны выше. Следующие разделы — план
                наполнения, а не уже готовые характеристики всех BMW.
              </p>
              <ul>
                <li>Исторические автомобили, микролитражки и Neue Klasse</li>
                <li>Серии 1–8, кузова Touring, Gran Coupé и Gran Turismo</li>
                <li>BMW X и родстеры Z</li>
                <li>BMW M, электромобили i и гибридные ветви</li>
                <li>Гоночные автомобили, концепты и редкие версии</li>
                <li>BMW Motorrad — отдельный раздел техники</li>
              </ul>
              <a
                href="https://www.bmwgroup-classic.com/en/models/bmw-classics.html"
                target="_blank"
                rel="noreferrer"
              >
                Исторический архив BMW ↗
              </a>
              <a
                href="https://www.bmwusa.com/all-bmws.html"
                target="_blank"
                rel="noreferrer"
              >
                Модельный ряд BMW · США ↗
              </a>
            </section>
            <section className="closing-panel">
              <Compass size={32} />
              <div>
                <span className="eyebrow">ИНТЕРЕСНОЕ НАЧИНАЕТСЯ С ДЕТАЛЕЙ</span>
                <h3>Одно название. Много разных автомобилей.</h3>
                <p>
                  Сравните поколения, загляните в источники и сохраните то, что
                  интересно именно вам.
                </p>
              </div>
              <button
                className="round-arrow"
                onClick={() => openFamily(families[0])}
                aria-label="Исследовать BMW 3 Series"
              >
                <ArrowUpRight size={24} />
              </button>
            </section>
          </div>
        )}
      </main>
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
            <a
              className="text-action"
              href="https://vpic.nhtsa.dot.gov/api/"
              target="_blank"
              rel="noreferrer"
            >
              Источник: NHTSA vPIC <ArrowUpRight size={15} />
            </a>
            <Button
              className="primary-action"
              onClick={() => {
                setIndexDetail(null);
                filters({ query: "" });
              }}
            >
              Посмотреть подробные истории
            </Button>
          </section>
        </dialog>
      )}
      {state.compare.length > 0 && state.view !== "compare" && (
        <div className="compare-dock">
          <GitCompareArrows size={19} />
          <span>
            {state.compare.length} из 4 <small>в сравнении</small>
          </span>
          <button onClick={() => go("compare")}>
            Сравнить <ArrowRight size={15} />
          </button>
          <button
            className="dock-close"
            aria-label="Очистить сравнение"
            onClick={() => navigate({ compare: [] })}
          >
            <X size={16} />
          </button>
        </div>
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
          <p>BMW. Поколения. Детали. Независимая энциклопедия BMW.</p>
        </div>
        <span>
          Сделано для любопытства.
          <br />© 2026 BMW Atlas
        </span>
        <button onClick={() => go("sources")}>
          Данные и источники <ArrowUpRight size={14} />
        </button>
      </footer>
    </>
  );
}
function LayersIcon() {
  return <Database />;
}
