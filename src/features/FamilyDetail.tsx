import { t, catalogText, label } from "../i18n";
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
import { heroPower, spotlights } from "../data/spotlights";
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
  const spotlight = spotlights[generation.id];
  const power = heroPower(generation);
  const copy = {
    back: t(language, "all.models.a1334b"),
    history: t(language, "model.history.53b783"),
    inGarage: t(language, "in.my.garage.ed36cb"),
    addGarage: t(language, "add.to.garage.ccc6e8"),
    sourcesOnScreen: t(language, "sources.on.this.screen.73bb0f"),
    generations: t(language, "generations.79283b"),
    generationSelection: t(language, "generation.selection.76670c"),
    selectGeneration: t(language, "choose.generation.4f6322"),
    selectedGeneration: t(language, "selected.generation.bc3152"),
    modelSections: t(language, "model.sections.9b4a2d"),
    overview: t(language, "story.updates.43dfbb"),
    engines: t(language, "engines.34bf31"),
    production: t(language, "production.9e194f"),
    ratings: t(language, "ratings.6653fc"),
    sources: t(language, "sources.bbc701"),
    knownUpdate: t(language, "updated.48352f"),
    changed: t(language, "what.changed.2179d4"),
    generationCharacter: t(language, "generation.character.b6ec07"),
    rememberedFor: t(language, "why.this.generation.matters.50b101"),
    facts: t(language, "database.details.3b58d5"),
    powertrains: t(language, "powertrain.variants.5eb717"),
    notAdded: t(language, "not.added.yet.7b9368"),
    knownUpdates: t(language, "sourced.updates.2ec8a7"),
    noData: t(language, "no.data.5fce4b"),
    generationProduction: t(language, "generation.production.c50312"),
    assembly: t(language, "assembly.2e7f9e"),
    factoryRecords: t(language, "factory.records.b5b884"),
    notClarified: t(language, "not.yet.clarified.92b7ff"),
    coverageNote: t(
      language,
      "this.is.the.verified.part.of.the.story.not.a.pro.7fbc41",
    ),
    viewSources: t(language, "view.sources.dc21e1"),
    familyFacts: t(language, "family.facts.6a60be"),
    timeline: t(language, "family.timeline.b2ac87"),
    present: t(language, "present.8ff9d8"),
    branches: t(language, "generations.branches.a8cd33"),
    bodyStyles: t(language, "family.body.styles.118ccf"),
    selected: t(language, "selected.generation.bb85aa"),
    powertrainVariants: t(language, "powertrain.variants.a89c51"),
    powertrainsInProgress: t(
      language,
      "powertrain.coverage.in.progress.f797c3",
    ),
    sourcedUpdates: t(language, "sourced.updates.1f00ef"),
    noSourcedUpdate: t(language, "no.sourced.update.1fb702"),
    underHood: t(language, "what.powered.it.d728e7"),
    engineIntro: t(
      language,
      "variants.in.the.database.year.and.market.are.sta.e801f0",
    ),
    engineFuel: t(language, "engine.fuel.392a83"),
    allFuel: t(language, "all.fuel.types.6860b3"),
    version: t(language, "version.994a31"),
    power: t(language, "power.dd6960"),
    torque: t(language, "torque.bec882"),
    transmissionDrive: t(language, "transmission.drive.10ad07"),
    marketSnapshot: t(language, "market.and.snapshot.80da38"),
    driveNotSpecified: t(language, "drive.not.specified.5fdf48"),
    researchMore: t(language, "there.is.more.to.research.here.f8554f"),
    enginesMissing: t(
      language,
      "confirmed.powertrain.variants.have.not.been.adde.c4100e",
    ),
    engineNote: t(
      language,
      "a.marketing.name.is.not.an.engine.code.a.dash.me.27b852",
    ),
    verify: t(language, "verify.it.yourself.266b02"),
    sourceLead: t(language, "every.fact.has.a.starting.point.cc59cc"),
    photo: t(language, "photo.ce864a"),
    photoNote: t(
      language,
      "this.photo.shows.this.exact.generation.it.does.n.203769",
    ),
  };
  const [tab, setTab] = useState("overview");
  const [fuel, setFuel] = useState("");
  useEffect(() => {
    setFuel("");
    setTab("overview");
  }, [generation.id]);
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
        spotlight?.source,
        spotlight?.price?.source,
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
        <div className="detail-introduction">
          <div className="eyebrow">
            {copy.history} <span className="dot" />{" "}
            {family.vehicleKind === "Мотоцикл"
              ? "BMW MOTORRAD"
              : family.brand.toUpperCase()}
          </div>
          <h1>
            {family.brand} <em>{family.name}</em>
          </h1>
          <p className="detail-edition">
            {generation.code} <span>·</span> {formatYears(generation, language)}
          </p>
          <p className="detail-lead">
            {spotlight
              ? t(language, spotlight.intro)
              : catalogText(
                  language,
                  `generation.${generation.id}.description`,
                )}
          </p>
          <dl className="hero-specifications">
            {power && (
              <div>
                <dt>{t(language, "power.dd6960")}</dt>
                <dd>
                  {isEnglish
                    ? power.value
                    : power.value.replace(" PS", " л. с.")}
                </dd>
                <small>{power.variant}</small>
              </div>
            )}
            {spotlight && (
              <div>
                <dt>0–100 {t(language, "km.h.7853a0")}</dt>
                <dd>
                  {spotlight.zeroTo100.toLocaleString(language)}{" "}
                  {t(language, "s.b3acf9")}
                </dd>
                <small>{spotlight.variant}</small>
              </div>
            )}
            {spotlight?.price && (
              <div className="hero-price">
                <dt>
                  {t(language, "launch.price.454eeb")} · {spotlight.price.year}
                </dt>
                <dd>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: spotlight.price.currency,
                    maximumFractionDigits: 0,
                  }).format(spotlight.price.amount)}
                </dd>
                <small>{t(language, spotlight.price.note)}</small>
              </div>
            )}
            {generation.volume && (
              <div>
                <dt>{t(language, "recorded.volume.2a2d34")}</dt>
                <dd>{formatVolume(generation.volume, language)}</dd>
                <small>{generation.volume.scope}</small>
              </div>
            )}
            {!spotlight && generation.assembly.length > 0 && (
              <div>
                <dt>{copy.assembly}</dt>
                <dd className="hero-spec-text">
                  {generation.assembly
                    .map((value) => label(language, value))
                    .join(" · ")}
                </dd>
              </div>
            )}
          </dl>
          {spotlight && (
            <p className="hero-observation">
              <span>{t(language, "look.closer.2c52a6")}</span>
              {t(language, spotlight.detail)}
            </p>
          )}
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
          {family.generations.length > 1 && (
            <section
              className="generation-picker"
              aria-label={copy.generationSelection}
            >
              <div className="generation-picker-heading">
                <span className="eyebrow">
                  {t(language, "choose.a.version.b64d2c")}
                </span>
                <span>
                  {family.generations.findIndex(
                    (item) => item.id === generation.id,
                  ) + 1}{" "}
                  {t(language, "of.777fa2")} {family.generations.length} ·{" "}
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
                    {item.code} · {formatYears(item, language)}
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
                    aria-current={
                      item.id === generation.id ? "page" : undefined
                    }
                    className={
                      "generation " +
                      (item.id === generation.id ? "selected" : "")
                    }
                  >
                    <span className="generation-node" />
                    <small>
                      {item.code.includes("LCI")
                        ? t(language, "facelift.92f717")
                        : item.label}
                    </small>
                    <strong>{item.code}</strong>
                    <span>{formatYears(item, language)}</span>
                    {faceliftCount(item.revisions) > 0 && (
                      <i>{copy.knownUpdate}</i>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
      <div className="generation-title">
        <div>
          <span className="eyebrow">
            {t(language, "explore.the.exhibit.95f347")}
          </span>
          <h2>{t(language, "the.story.and.the.details.4e9268")}</h2>
          <p>
            {family.name} · {generation.code} ·{" "}
            {formatYears(generation, language)}
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
              <h3>{t(language, "what.makes.it.distinctive.bcebdc")}</h3>
              <p>
                {catalogText(
                  language,
                  spotlight
                    ? `generation.${generation.id}.description`
                    : `family.${family.id}.summary`,
                )}
              </p>
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
                {t(language, "at.a.glance.6cf437")}
              </span>
              <dl>
                <div>
                  <dt>{t(language, "years.0b9249")}</dt>
                  <dd>{formatYears(generation, language)}</dd>
                </div>
                {generation.volume && (
                  <div>
                    <dt>{copy.generationProduction}</dt>
                    <dd>{formatVolume(generation.volume, language)}</dd>
                  </div>
                )}
                {generation.assembly.length > 0 && (
                  <div>
                    <dt>{copy.assembly}</dt>
                    <dd>
                      {generation.assembly
                        .map((value) => label(language, value))
                        .join(" · ")}
                    </dd>
                  </div>
                )}
                {generation.revisions.length > 0 && (
                  <div>
                    <dt>{t(language, "update.years.2e623e")}</dt>
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
              <strong>
                {family.body.map((value) => label(language, value)).join(" · ")}
              </strong>
              <small>{label(language, family.vehicleKind)}</small>
            </div>
            <div>
              <span>{copy.selected}</span>
              <strong>
                {generation.code} · {formatYears(generation, language)}
              </strong>
              <small>{selectedCoverage}</small>
            </div>
            {family.volume && (
              <div>
                <span>
                  {label(language, family.volume.metric)} · {family.volume.asOf}
                </span>
                <strong>{formatVolume(family.volume, language)}</strong>
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
                  <option key={f} value={f}>
                    {label(language, f)}
                  </option>
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
                        <small>{label(language, p.fuel)}</small>
                      </td>
                      <td>
                        {p.power} <span>{label(language, p.powerUnit)}</span>
                      </td>
                      <td>
                        {p.torque === null
                          ? "—"
                          : `${p.torque} ${label(language, "Н·м")}`}
                      </td>
                      <td>
                        {p.gearbox ? label(language, p.gearbox) : "—"}
                        <small>
                          {p.drive
                            ? label(language, p.drive)
                            : copy.driveNotSpecified}
                        </small>
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
