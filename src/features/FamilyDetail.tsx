import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Info,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import type { ModelFamily, Generation } from "../domain/catalog";
import { formatVolume, formatYears } from "../domain/catalog";
import { sourceById } from "../data/sources";
import { Button } from "../components/button/button";
import { VehiclePhoto } from "./media/VehiclePhoto";
import { RatingsPanel } from "./ratings/RatingsPanel";
import { RevisionTimeline } from "./timeline/RevisionTimeline";
import { faceliftCount } from "../domain/revisions";
import { productionRuns } from "../domain/production/catalog";
import { runsForGeneration } from "../domain/production";
import { ProductionPanel } from "./production/ProductionPanel";
import type { Language } from "../lib/preferences";
export function SourceLink({ id }: { id: string }) {
  const s = sourceById[id];
  return s ? (
    <a className="source-link" href={s.url} target="_blank" rel="noreferrer">
      {s.publisher}
      <ArrowUpRight size={12} />
    </a>
  ) : null;
}
export function FamilyDetail({
  family,
  generation,
  onGeneration,
  hrefForGeneration,
  onBack,
  saved,
  onSave,
  language = "ru",
}: {
  family: ModelFamily;
  generation: Generation;
  onGeneration: (id: string) => void;
  hrefForGeneration: (id: string) => string;
  onBack: () => void;
  saved: boolean;
  onSave: () => void;
  language?: Language;
}) {
  const isEnglish = language === "en";
  const copy = isEnglish
    ? {
        back: "All models",
        history: "MODEL HISTORY",
        inGarage: "In my garage",
        addGarage: "Add to garage",
        sourcesOnScreen: "sources on this screen",
        generations: "GENERATIONS",
        generationSelection: "Generation selection",
        selectGeneration: "Choose generation",
        selectedGeneration: "SELECTED GENERATION",
        modelSections: "Model sections",
        overview: "Overview",
        engines: "Engines",
        production: "Production",
        ratings: "Ratings",
        sources: "Sources",
        knownUpdate: "updated",
        changed: "WHAT CHANGED",
        generationCharacter: "generation character",
        rememberedFor: "Why this generation matters",
        facts: "DATABASE DETAILS",
        powertrains: "Powertrain variants",
        notAdded: "Not added yet",
        knownUpdates: "Sourced updates",
        noData: "No data",
        generationProduction: "Generation production",
        assembly: "Assembly",
        factoryRecords: "factory records",
        notClarified: "Not yet clarified",
        coverageNote:
          "This is the verified part of the story, not a promise of complete coverage for every market.",
        viewSources: "View sources",
        familyFacts: "Family facts",
        timeline: "Family timeline",
        present: "present",
        branches: "generations / branches",
        bodyStyles: "Family body styles",
        selected: "Selected generation",
        powertrainVariants: "powertrain variants",
        powertrainsInProgress: "powertrain coverage in progress",
        sourcedUpdates: "sourced updates",
        noSourcedUpdate: "no sourced update",
        underHood: "What powered it",
        engineIntro:
          "variants in the database. Year and market are stated for each entry.",
        engineFuel: "Engine fuel",
        allFuel: "All fuel types",
        version: "Version",
        power: "Power",
        torque: "Torque",
        transmissionDrive: "Transmission / drive",
        marketSnapshot: "Market and snapshot",
        driveNotSpecified: "Drive not specified",
        researchMore: "There is more to research here",
        enginesMissing:
          "Confirmed powertrain variants have not been added for this generation yet.",
        engineNote:
          "A marketing name is not an engine code. A dash means there is no confirmation. Records do not automatically apply to other years or markets.",
        verify: "VERIFY IT YOURSELF",
        sourceLead: "Every fact has a starting point",
        photo: "Photo",
        photoNote:
          "This photo shows this exact generation; it does not illustrate the others.",
      }
    : {
        back: "Все модели",
        history: "ИСТОРИЯ МОДЕЛИ",
        inGarage: "В моём гараже",
        addGarage: "В мой гараж",
        sourcesOnScreen: "источников на этом экране",
        generations: "ПОКОЛЕНИЯ",
        generationSelection: "Выбор поколения",
        selectGeneration: "Выберите поколение",
        selectedGeneration: "ВЫБРАННОЕ ПОКОЛЕНИЕ",
        modelSections: "Разделы модели",
        overview: "Обзор",
        engines: "Двигатели",
        production: "Производство",
        ratings: "Оценки",
        sources: "Источники",
        knownUpdate: "есть обновление",
        changed: "ЧТО ИЗМЕНИЛОСЬ",
        generationCharacter: "характер поколения",
        rememberedFor: "Чем запомнилось поколение",
        facts: "ДЕТАЛИ В БАЗЕ",
        powertrains: "Силовых вариантов",
        notAdded: "Не добавлены",
        knownUpdates: "Обновлений с источником",
        noData: "Нет данных",
        generationProduction: "Производство поколения",
        assembly: "Сборка",
        factoryRecords: "записей по заводам",
        notClarified: "Пока не уточнена",
        coverageNote:
          "Это подтверждённая часть истории, а не обещание полного покрытия всех рынков.",
        viewSources: "Посмотреть источники",
        familyFacts: "Факты о семействе",
        timeline: "Хронология семейства",
        present: "н. в.",
        branches: "поколений / ветвей",
        bodyStyles: "Кузова семейства",
        selected: "Выбранное поколение",
        powertrainVariants: "силовые варианты",
        powertrainsInProgress: "силовые варианты уточняются",
        sourcedUpdates: "обновления с источником",
        noSourcedUpdate: "без подтверждённого обновления",
        underHood: "Что было под капотом",
        engineIntro: "вариантов в базе. Год и рынок указаны в каждой записи.",
        engineFuel: "Топливо двигателя",
        allFuel: "Все типы топлива",
        version: "Версия",
        power: "Мощность",
        torque: "Момент",
        transmissionDrive: "Коробка / привод",
        marketSnapshot: "Рынок и срез",
        driveNotSpecified: "Привод не уточнён",
        researchMore: "Здесь ещё есть что исследовать",
        enginesMissing:
          "Подтверждённые силовые варианты для этого поколения пока не добавлены.",
        engineNote:
          "Маркетинговое имя не равно коду двигателя. Прочерк означает отсутствие подтверждения. Записи не распространяются автоматически на другие годы и рынки.",
        verify: "ПРОВЕРИТЬ САМОМУ",
        sourceLead: "У каждого факта есть начало",
        photo: "Фото",
        photoNote: "Фото именно этого поколения; не иллюстрирует остальные.",
      };
  const [tab, setTab] = useState("overview");
  const [fuel, setFuel] = useState("");
  useEffect(() => setFuel(""), [generation.id]);
  const tabs = [
    ["overview", copy.overview],
    ["engines", copy.engines],
    ["production", copy.production],
    ["ratings", copy.ratings],
    ["sources", copy.sources],
  ] as const;
  const engines = generation.powertrains.filter(
    (p) => !fuel || p.fuel === fuel,
  );
  const firstYear = Math.min(...family.generations.map((item) => item.start));
  const hasCurrentGeneration = family.generations.some(
    (item) => item.end === null,
  );
  const lastYear = Math.max(
    ...family.generations.map((item) => item.end ?? item.start),
  );
  const selectedCoverage = [
    generation.powertrains.length
      ? `${copy.powertrainVariants}: ${generation.powertrains.length}`
      : copy.powertrainsInProgress,
    generation.revisions.length
      ? `${copy.sourcedUpdates}: ${generation.revisions.length}`
      : copy.noSourcedUpdate,
  ].join(" · ");
  const cited = [
    ...new Set(
      [
        family.source,
        generation.source,
        family.volume?.source,
        generation.volume?.source,
        ...generation.revisions.map((r) => r.source),
        ...generation.powertrains.map((p) => p.source),
        ...generation.ratings.flatMap((rating) =>
          rating.status === "rated" ? [rating.source] : [],
        ),
        ...runsForGeneration(generation.id, productionRuns).map(
          (run) => run.source,
        ),
      ].filter((v): v is string => !!v),
    ),
  ];
  return (
    <div className="detail page-enter">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> {copy.back}
      </button>
      <section className="detail-hero">
        <div>
          <div className="eyebrow">
            {copy.history} <span className="dot" />{" "}
            {family.vehicleKind === "Мотоцикл"
              ? "BMW MOTORRAD"
              : family.brand.toUpperCase()}
          </div>
          <h1>
            {family.brand}
            <br />
            <em>{family.name}</em>
          </h1>
          <p className="detail-lead">{family.tagline}</p>
          <div className="hero-actions">
            <Button
              className="primary-action"
              startIcon={saved ? <Check size={16} /> : <Bookmark size={16} />}
              onClick={onSave}
            >
              {saved ? copy.inGarage : copy.addGarage}
            </Button>
          </div>
        </div>
        <div className="detail-media-column">
          <div className="detail-visual blue">
            <VehiclePhoto photo={generation.photo} language={language} />
          </div>
          <section
            className="generation-picker"
            aria-label={copy.generationSelection}
          >
            <div className="generation-picker-heading">
              <span className="eyebrow">{copy.generations}</span>
              <span>
                {family.generations.findIndex(
                  (item) => item.id === generation.id,
                ) + 1}{" "}
                {isEnglish ? "of" : "из"} {family.generations.length} ·{" "}
                {generation.code}
              </span>
            </div>
            <select
              className="generation-select-mobile"
              aria-label={copy.selectGeneration}
              value={generation.id}
              onChange={(event) => onGeneration(event.target.value)}
            >
              {family.generations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {formatYears(item)}
                </option>
              ))}
            </select>
            <div className="timeline" aria-label={copy.generations}>
              {family.generations.map((item) => (
                <a
                  key={item.id}
                  href={hrefForGeneration(item.id)}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                    if (
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    event.preventDefault();
                    onGeneration(item.id);
                  }}
                  aria-current={item.id === generation.id ? "page" : undefined}
                  className={
                    "generation " +
                    (item.id === generation.id ? "selected" : "")
                  }
                >
                  <span className="generation-node" />
                  <small>{item.label}</small>
                  <strong>{item.code}</strong>
                  <span>{formatYears(item)}</span>
                  {faceliftCount(item.revisions) > 0 && (
                    <i>{copy.knownUpdate}</i>
                  )}
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>
      <div className="generation-title">
        <div>
          <span className="eyebrow">{copy.selectedGeneration}</span>
          <h2>
            {family.name} <span>{generation.code}</span>
          </h2>
          <p>
            {formatYears(generation)} <span className="separator">/</span>{" "}
            {generation.dateScope}
          </p>
        </div>
      </div>
      <div
        className="detail-tabs"
        role="navigation"
        aria-label={copy.modelSections}
      >
        {tabs.map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
          >
            {label}
            {id === "engines" && (
              <span>{generation.powertrains.length || "—"}</span>
            )}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <>
          <div className="overview-grid">
            <article className="panel story-panel">
              <h3>
                {isEnglish
                  ? "What makes it distinctive"
                  : "Особенности поколения"}
              </h3>
              <p>{generation.description}</p>
              {(generation.highlights?.length ?? 0) > 0 && (
                <div className="generation-highlights">
                  <h4>{copy.rememberedFor}</h4>
                  <ul>
                    {generation.highlights?.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
              {generation.revisions.length > 0 && (
                <RevisionTimeline
                  revisions={generation.revisions}
                  language={language}
                />
              )}
            </article>
            <aside className="panel facts-panel">
              <span className="eyebrow">
                {isEnglish ? "AT A GLANCE" : "КОРОТКО О МОДЕЛИ"}
              </span>
              <dl>
                <div>
                  <dt>{isEnglish ? "Years" : "Годы выпуска"}</dt>
                  <dd>{formatYears(generation)}</dd>
                </div>
                {generation.volume && (
                  <div>
                    <dt>{copy.generationProduction}</dt>
                    <dd>{formatVolume(generation.volume)}</dd>
                  </div>
                )}
                {generation.assembly.length > 0 && (
                  <div>
                    <dt>{copy.assembly}</dt>
                    <dd>{generation.assembly.join(" · ")}</dd>
                  </div>
                )}
                {generation.revisions.length > 0 && (
                  <div>
                    <dt>{isEnglish ? "Update years" : "Годы обновлений"}</dt>
                    <dd>
                      {[
                        ...new Set(generation.revisions.map((r) => r.year)),
                      ].join(" · ")}
                    </dd>
                  </div>
                )}
              </dl>
              <button className="text-action" onClick={() => setTab("sources")}>
                {copy.viewSources} <ArrowUpRight size={16} />
              </button>
            </aside>
          </div>
          <section className="family-facts" aria-label={copy.familyFacts}>
            <div>
              <span>{copy.timeline}</span>
              <strong>
                {firstYear}–{hasCurrentGeneration ? copy.present : lastYear}
              </strong>
              <small>
                {family.generations.length} {copy.branches}
              </small>
            </div>
            <div>
              <span>{copy.bodyStyles}</span>
              <strong>{family.body.join(" · ")}</strong>
              <small>{family.vehicleKind}</small>
            </div>
            <div>
              <span>{copy.selected}</span>
              <strong>
                {generation.code} · {formatYears(generation)}
              </strong>
              <small>{selectedCoverage}</small>
            </div>
            {family.volume && (
              <div>
                <span>
                  {family.volume.metric} · {family.volume.asOf}
                </span>
                <strong>{formatVolume(family.volume)}</strong>
                <small>{family.volume.scope}</small>
              </div>
            )}
          </section>
        </>
      )}
      {tab === "engines" && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>{copy.underHood}</h3>
              <p className="muted">
                {generation.powertrains.length} {copy.engineIntro}
              </p>
            </div>
            <select
              aria-label={copy.engineFuel}
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            >
              <option value="">{copy.allFuel}</option>
              {[...new Set(generation.powertrains.map((p) => p.fuel))].map(
                (f) => (
                  <option key={f}>{f}</option>
                ),
              )}
            </select>
          </div>
          {engines.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{copy.version}</th>
                    <th>{copy.power}</th>
                    <th>{copy.torque}</th>
                    <th>{copy.transmissionDrive}</th>
                    <th>{copy.marketSnapshot}</th>
                  </tr>
                </thead>
                <tbody>
                  {engines.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <small>{p.fuel}</small>
                      </td>
                      <td>
                        {p.power} <span>{p.powerUnit}</span>
                      </td>
                      <td>{p.torque === null ? "—" : `${p.torque} Н·м`}</td>
                      <td>
                        {p.gearbox ?? "—"}
                        <small>{p.drive ?? copy.driveNotSpecified}</small>
                      </td>
                      <td>
                        {p.market}
                        <small>
                          {p.asOf} · <SourceLink id={p.source} />
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-block">
              <h3>{copy.researchMore}</h3>
              <p>{copy.enginesMissing}</p>
            </div>
          )}
          <p className="note">
            <Info size={15} />
            {copy.engineNote}
          </p>
        </section>
      )}
      {tab === "production" && (
        <ProductionPanel
          generationId={generation.id}
          familyVolume={family.volume}
          generationVolume={generation.volume}
          sourceLink={(id) => <SourceLink id={id} />}
          language={language}
        />
      )}
      {tab === "ratings" && (
        <RatingsPanel ratings={generation.ratings} language={language} />
      )}
      {tab === "sources" && (
        <section className="panel">
          <span className="eyebrow">{copy.verify}</span>
          <h3>{copy.sourceLead}</h3>
          <div className="source-list">
            {cited.map((id) => {
              const s = sourceById[id];
              return (
                <a key={id} href={s.url} target="_blank" rel="noreferrer">
                  <div>
                    <small>
                      {s.publisher} · {s.date}
                    </small>
                    <strong>{s.title}</strong>
                    <p>{s.scope}</p>
                  </div>
                  <ExternalLink size={18} />
                </a>
              );
            })}
          </div>
          {generation.photo && (
            <details className="photo-details">
              <summary>
                {copy.photo}: {generation.photo.subject}
                <ChevronRight size={16} />
              </summary>
              <img
                loading="lazy"
                src={import.meta.env.BASE_URL + generation.photo.url}
                alt={generation.photo.subject}
              />
              <p>
                <a
                  href={generation.photo.page}
                  target="_blank"
                  rel="noreferrer"
                >
                  {generation.photo.author}
                </a>{" "}
                ·{" "}
                <a
                  href={generation.photo.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {generation.photo.license}
                </a>
                . {copy.photoNote}
              </p>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
