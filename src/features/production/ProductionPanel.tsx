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
import type { Language } from "../../lib/preferences";

const assemblyLabels: Record<Language, Record<AssemblyType, string>> = {
  ru: {
    full: "Полное производство",
    CKD: "CKD · сборка из комплектов",
    SKD: "SKD · крупноузловая сборка",
    unknown: "Тип сборки не уточнён",
  },
  en: {
    full: "Full production",
    CKD: "CKD · kit assembly",
    SKD: "SKD · semi-knockdown assembly",
    unknown: "Assembly type not specified",
  },
};

export function ProductionPanel({
  generationId,
  familyVolume,
  generationVolume,
  sourceLink,
  language = "ru",
}: {
  generationId: string;
  familyVolume: Volume | null;
  generationVolume: Volume | null;
  sourceLink: (id: string) => ReactNode;
  language?: Language;
}) {
  const isEnglish = language === "en";
  const runs = runsForGeneration(generationId, productionRuns);
  const factoryById = Object.fromEntries(
    factories.map((item) => [item.id, item]),
  );

  return (
    <div className="production-layout">
      <section className="panel">
        <span className="eyebrow">{isEnglish ? "VOLUME" : "ТИРАЖ"}</span>
        <h3>{isEnglish ? "Scale of the story" : "Масштаб истории"}</h3>
        {[
          {
            label: isEnglish ? "Entire family" : "Семейство целиком",
            value: familyVolume,
          },
          {
            label: isEnglish ? "Selected generation" : "Выбранное поколение",
            value: generationVolume,
          },
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
                  {isEnglish ? "As of" : "По состоянию на"} {value.asOf} ·{" "}
                  {sourceLink(value.source)}
                </small>
              </>
            )}
          </div>
        ))}
        <p className="note">
          <Info size={16} />{" "}
          {isEnglish
            ? "Sales, production and cumulative volume are different metrics. They are not combined."
            : "Продажи, производство и накопленный тираж — разные показатели. Мы их не складываем."}
        </p>
      </section>

      <section className="panel production-panel">
        <span className="eyebrow">
          {isEnglish ? "GENERATION GEOGRAPHY" : "ГЕОГРАФИЯ ПОКОЛЕНИЯ"}
        </span>
        <h3>
          <Globe2 size={22} />{" "}
          {isEnglish ? "Plants and periods" : "Заводы и периоды"}
        </h3>
        {runs.length ? (
          <>
            <p>
              {runs.length}{" "}
              {isEnglish
                ? "confirmed production records. Period and scope are stated for each one."
                : "подтверждённых производственных записей. Период и область указаны отдельно для каждой."}
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
                        <dt>{isEnglish ? "Region" : "Регион"}</dt>
                        <dd>{run.region}</dd>
                      </div>
                      <div>
                        <dt>
                          {run.bodies.status === "known" &&
                          run.bodies.appliesTo === "generation"
                            ? isEnglish
                              ? "Generation body styles"
                              : "Кузова поколения"
                            : isEnglish
                              ? "Plant body styles"
                              : "Кузова завода"}
                        </dt>
                        <dd>
                          {run.bodies.status === "known"
                            ? run.bodies.values.join(" · ")
                            : `${isEnglish ? "Not specified" : "Не уточнены"}: ${run.bodies.reason}`}
                        </dd>
                      </div>
                      <div>
                        <dt>{isEnglish ? "Assembly" : "Сборка"}</dt>
                        <dd>{assemblyLabels[language][run.assemblyType]}</dd>
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
            <h3>
              {isEnglish
                ? "Production geography is still under research"
                : "География ещё исследуется"}
            </h3>
            <p>
              {isEnglish
                ? "There is no record yet that confirms plant, period and production scope together for this generation. BMW's country of origin is not substituted here."
                : "Для этого поколения пока нет записи, где одновременно подтверждены завод, период и область выпуска. Страна происхождения BMW сюда не подставляется."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
