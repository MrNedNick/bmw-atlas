import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  GitCompareArrows,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
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
  onBack,
  saved,
  onSave,
  compare,
  onCompare,
}: {
  family: ModelFamily;
  generation: Generation;
  onGeneration: (id: string) => void;
  onBack: () => void;
  saved: boolean;
  onSave: () => void;
  compare: string[];
  onCompare: (id: string) => void;
}) {
  const [tab, setTab] = useState("Обзор");
  const [fuel, setFuel] = useState("");
  useEffect(() => setFuel(""), [generation.id]);
  const tabs = ["Обзор", "Двигатели", "Производство", "Оценки", "Источники"];
  const engines = generation.powertrains.filter(
    (p) => !fuel || p.fuel === fuel,
  );
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
        <ArrowLeft size={16} /> Все модели
      </button>
      <section className="detail-hero">
        <div>
          <div className="eyebrow">
            ИСТОРИЯ МОДЕЛИ <span className="dot" />{" "}
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
              {saved ? "В моём гараже" : "В мой гараж"}
            </Button>
            <span className="verified">
              <ShieldCheck size={15} />
              {cited.length} источников на этом экране
            </span>
          </div>
        </div>
        <div className="detail-visual blue">
          <VehiclePhoto photo={generation.photo} />
        </div>
      </section>
      <div className="family-summary">
        <div>
          <span>В истории каталога</span>
          <strong>{family.generations.length} поколений / ветвей</strong>
        </div>
        <div>
          <span>
            {family.volume?.metric ?? "Тираж"} ·{" "}
            {family.volume?.asOf ?? "нет данных"}
          </span>
          <strong>{formatVolume(family.volume)}</strong>
        </div>
        <div>
          <span>Кузова семейства</span>
          <strong>{family.body.join(" · ")}</strong>
        </div>
      </div>
      <section className="generation-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ЭВОЛЮЦИЯ</span>
            <h2>Каждое поколение — новая глава</h2>
          </div>
          <span className="muted">Выберите, что изучить</span>
        </div>
        <div className="timeline" aria-label="Поколения">
          {family.generations.map((g) => (
            <button
              key={g.id}
              onClick={() => onGeneration(g.id)}
              aria-pressed={g.id === generation.id}
              className={
                "generation " + (g.id === generation.id ? "selected" : "")
              }
            >
              <span className="generation-node" />
              <small>{g.label}</small>
              <strong>{g.code}</strong>
              <span>{formatYears(g)}</span>
              {faceliftCount(g.revisions) > 0 && <i>есть обновление</i>}
            </button>
          ))}
        </div>
      </section>
      <div className="generation-title">
        <div>
          <span className="eyebrow">ВЫБРАННОЕ ПОКОЛЕНИЕ</span>
          <h2>
            {family.name} <span>{generation.code}</span>
          </h2>
          <p>
            {formatYears(generation)} <span className="separator">/</span>{" "}
            {generation.dateScope}
          </p>
        </div>
        <Button
          variant="outline"
          className="outline-action"
          startIcon={
            compare.includes(generation.id) ? (
              <Check size={16} />
            ) : (
              <GitCompareArrows size={16} />
            )
          }
          onClick={() => onCompare(generation.id)}
        >
          {compare.includes(generation.id)
            ? "В сравнении"
            : "Сравнить поколение"}
        </Button>
      </div>
      <div
        className="detail-tabs"
        role="navigation"
        aria-label="Разделы модели"
      >
        {tabs.map((t) => (
          <button
            key={t}
            aria-current={tab === t ? "page" : undefined}
            onClick={() => setTab(t)}
            className={tab === t ? "active" : ""}
          >
            {t}
            {t === "Двигатели" && (
              <span>{generation.powertrains.length || "—"}</span>
            )}
          </button>
        ))}
      </div>
      {tab === "Обзор" && (
        <div className="overview-grid">
          <article className="panel story-panel">
            <span className="eyebrow">ЧТО ИЗМЕНИЛОСЬ</span>
            <h3>{generation.code}: характер поколения</h3>
            <p>{generation.description}</p>
            {(generation.highlights?.length ?? 0) > 0 && (
              <div className="generation-highlights">
                <h4>Чем запомнилось поколение</h4>
                <ul>
                  {generation.highlights?.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            <SourceLink id={generation.source} />
            <RevisionTimeline revisions={generation.revisions} />
          </article>
          <aside className="panel facts-panel">
            <span className="eyebrow">ДЕТАЛИ В БАЗЕ</span>
            <dl>
              <div>
                <dt>Силовых вариантов</dt>
                <dd>{generation.powertrains.length || "Не добавлены"}</dd>
              </div>
              <div>
                <dt>Рестайлингов с источником</dt>
                <dd>{faceliftCount(generation.revisions) || "Нет данных"}</dd>
              </div>
              <div>
                <dt>Производство поколения</dt>
                <dd>{formatVolume(generation.volume)}</dd>
              </div>
              <div>
                <dt>Сборка</dt>
                <dd>
                  {runsForGeneration(generation.id, productionRuns).length
                    ? `${runsForGeneration(generation.id, productionRuns).length} записей по заводам`
                    : "Пока не уточнена"}
                </dd>
              </div>
            </dl>
            <p className="note">
              <Info size={16} />
              Это подтверждённая часть истории, а не обещание полного покрытия
              всех рынков.
            </p>
            <button className="text-action" onClick={() => setTab("Источники")}>
              Посмотреть источники <ArrowUpRight size={16} />
            </button>
          </aside>
        </div>
      )}
      {tab === "Двигатели" && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <h3>Что было под капотом</h3>
              <p className="muted">
                {generation.powertrains.length} вариантов в базе. Год и рынок
                указаны в каждой записи.
              </p>
            </div>
            <select
              aria-label="Топливо двигателя"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
            >
              <option value="">Все типы топлива</option>
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
                    <th>Версия</th>
                    <th>Мощность</th>
                    <th>Момент</th>
                    <th>Коробка / привод</th>
                    <th>Рынок и срез</th>
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
                        <small>{p.drive ?? "Привод не уточнён"}</small>
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
              <h3>Здесь ещё есть что исследовать</h3>
              <p>
                Подтверждённые силовые варианты для этого поколения пока не
                добавлены. Попробуйте BMW G20, G30 или G60.
              </p>
            </div>
          )}
          <p className="note">
            <Info size={15} />
            Маркетинговое имя не равно коду двигателя. Прочерк означает
            отсутствие подтверждения. Записи не распространяются автоматически
            на другие годы и рынки.
          </p>
        </section>
      )}
      {tab === "Производство" && (
        <ProductionPanel
          generationId={generation.id}
          familyVolume={family.volume}
          generationVolume={generation.volume}
          sourceLink={(id) => <SourceLink id={id} />}
        />
      )}
      {tab === "Оценки" && <RatingsPanel ratings={generation.ratings} />}
      {tab === "Источники" && (
        <section className="panel">
          <span className="eyebrow">ПРОВЕРИТЬ САМОМУ</span>
          <h3>У каждого факта есть начало</h3>
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
                Фото: {generation.photo.subject}
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
                . Фото именно этого поколения; не иллюстрирует остальные.
              </p>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
