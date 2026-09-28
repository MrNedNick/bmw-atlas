import { t } from "../../i18n";
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
        <span className="eyebrow">{t(language, "volume.e337b1")}</span>
        <h3>{t(language, "scale.of.the.story.7f678a")}</h3>
        {[
          {
            label: t(language, "entire.family.f989ca"),
            value: familyVolume,
          },
          {
            label: t(language, "selected.generation.bb85aa"),
            value: generationVolume,
          },
        ].map(({ label, value }) => (
          <div className="volume-card" key={label}>
            <span>{label}</span>
            <strong>{formatVolume(value, language)}</strong>
            {value && (
              <>
                <p>
                  {value.metric} · {value.scope}
                </p>
                <small>
                  {t(language, "as.of.7b1b03")} {value.asOf} ·{" "}
                  {sourceLink(value.source)}
                </small>
              </>
            )}
          </div>
        ))}
        <p className="note">
          <Info size={16} />{" "}
          {t(
            language,
            "sales.production.and.cumulative.volume.are.diffe.ac30d0",
          )}
        </p>
      </section>

      <section className="panel production-panel">
        <span className="eyebrow">
          {t(language, "generation.geography.0a0ebf")}
        </span>
        <h3>
          <Globe2 size={22} /> {t(language, "plants.and.periods.c468ee")}
        </h3>
        {runs.length ? (
          <>
            <p>
              {runs.length}{" "}
              {t(
                language,
                "confirmed.production.records.period.and.scope.ar.5a4bd9",
              )}
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
                        <dt>{t(language, "region.a70918")}</dt>
                        <dd>{run.region}</dd>
                      </div>
                      <div>
                        <dt>
                          {run.bodies.status === "known" &&
                          run.bodies.appliesTo === "generation"
                            ? t(language, "generation.body.styles.797940")
                            : t(language, "plant.body.styles.6f55c3")}
                        </dt>
                        <dd>
                          {run.bodies.status === "known"
                            ? run.bodies.values.join(" · ")
                            : `${t(language, "not.specified.e997d1")}: ${run.bodies.reason}`}
                        </dd>
                      </div>
                      <div>
                        <dt>{t(language, "assembly.2e7f9e")}</dt>
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
              {t(
                language,
                "production.geography.is.still.under.research.5982bc",
              )}
            </h3>
            <p>
              {t(
                language,
                "there.is.no.record.yet.that.confirms.plant.perio.e6d0dc",
              )}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
