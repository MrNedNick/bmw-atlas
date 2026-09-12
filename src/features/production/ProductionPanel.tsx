import { Factory as FactoryIcon, Globe2, Info } from "lucide-react";
import type { ReactNode } from "react";
import type { Volume } from "../../domain/catalog";
import { formatVolume } from "../../domain/catalog";
import { factories, productionRuns } from "../../domain/production/catalog";
import {
  formatProductionPeriod,
  runsForGeneration,
  type AssemblyType,
} from "../../domain/production";

const assemblyLabels: Record<AssemblyType, string> = {
  full: "Полное производство",
  CKD: "CKD · сборка из комплектов",
  SKD: "SKD · крупноузловая сборка",
  unknown: "Тип сборки не уточнён",
};

export function ProductionPanel({
  generationId,
  familyVolume,
  generationVolume,
  sourceLink,
}: {
  generationId: string;
  familyVolume: Volume | null;
  generationVolume: Volume | null;
  sourceLink: (id: string) => ReactNode;
}) {
  const runs = runsForGeneration(generationId, productionRuns);
  const factoryById = Object.fromEntries(
    factories.map((item) => [item.id, item]),
  );

  return (
    <div className="production-layout">
      <section className="panel">
        <span className="eyebrow">ТИРАЖ</span>
        <h3>Масштаб истории</h3>
        {[
          { label: "Семейство целиком", value: familyVolume },
          { label: "Выбранное поколение", value: generationVolume },
        ].map(({ label, value }) => (
          <div className="volume-card" key={label}>
            <span>{label}</span>
            <strong>{formatVolume(value)}</strong>
            {value && (
              <>
                <p>
                  {value.metric} · {value.scope}
                </p>
                <small>
                  По состоянию на {value.asOf} · {sourceLink(value.source)}
                </small>
              </>
            )}
          </div>
        ))}
        <p className="note">
          <Info size={16} /> Продажи, производство и накопленный тираж — разные
          показатели. Мы их не складываем.
        </p>
      </section>

      <section className="panel production-panel">
        <span className="eyebrow">ГЕОГРАФИЯ ПОКОЛЕНИЯ</span>
        <h3>
          <Globe2 size={22} /> Заводы и периоды
        </h3>
        {runs.length ? (
          <>
            <p>
              {runs.length} подтверждённых производственных записей. Период и
              область указаны отдельно для каждой.
            </p>
            <div className="production-runs">
              {runs.map((run) => {
                const factory = factoryById[run.factoryId];
                return (
                  <article className="production-run" key={run.id}>
                    <div className="production-run-heading">
                      <FactoryIcon size={17} />
                      <div>
                        <strong>{factory.name}</strong>
                        <span>
                          {factory.city} · {factory.country}
                        </span>
                      </div>
                      <time>{formatProductionPeriod(run)}</time>
                    </div>
                    <dl>
                      <div>
                        <dt>Регион</dt>
                        <dd>{run.region}</dd>
                      </div>
                      <div>
                        <dt>
                          {run.bodies.status === "known" &&
                          run.bodies.appliesTo === "generation"
                            ? "Кузова поколения"
                            : "Кузова завода"}
                        </dt>
                        <dd>
                          {run.bodies.status === "known"
                            ? run.bodies.values.join(" · ")
                            : `Не уточнены: ${run.bodies.reason}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Сборка</dt>
                        <dd>{assemblyLabels[run.assemblyType]}</dd>
                      </div>
                    </dl>
                    {run.note && <p>{run.note}</p>}
                    {sourceLink(run.source)}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-block">
            <h3>География ещё исследуется</h3>
            <p>
              Для этого поколения пока нет записи, где одновременно подтверждены
              завод, период и область выпуска. Страна происхождения BMW сюда не
              подставляется.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
