import { t } from "../../i18n";
import { ShieldCheck } from "lucide-react";
import { sourceById } from "../../data/sources";
import { safetyRatingView, type SafetyRating } from "../../domain/ratings";
import type { Language } from "../../lib/preferences";

export function RatingsPanel({
  ratings,
  language = "ru",
}: {
  ratings: readonly SafetyRating[];
  language?: Language;
}) {
  const isEnglish = language === "en";
  const view = safetyRatingView(ratings);
  return (
    <section className="panel">
      <span className="eyebrow">{t(language, "safety.d0c48e")}</span>
      <h3>{t(language, "rating.with.context.01555d")}</h3>
      {view.status === "unknown" ? (
        <p className="empty-inline">{view.reason}</p>
      ) : (
        <div className="rating-scenarios">
          {view.ratings.map((rating) => {
            if (rating.status === "unknown")
              return (
                <article className="rating-scenario" key={rating.id}>
                  <strong>
                    {rating.scheme} · {t(language, "no.data.4617e1")}
                  </strong>
                  <p className="muted">{rating.reason}</p>
                </article>
              );
            const source = sourceById[rating.source];
            return (
              <article className="rating-scenario" key={rating.id}>
                <strong>
                  {rating.scheme} · {t(language, "protocol.93216a")}{" "}
                  {rating.protocolYear}
                </strong>
                <p className="muted">
                  {rating.testedVariant} · {rating.safetyPack.label}
                </p>
                {rating.overall && (
                  <p className="rating-overall">
                    {rating.overall.value} / 5{" "}
                    <small>{t(language, "stars.1bd5d5")}</small>
                  </p>
                )}
                <div className="ratings-grid">
                  {rating.components.map((component) => {
                    const max = component.scale === "percent" ? 100 : 5;
                    const suffix = component.scale === "percent" ? "%" : "/5";
                    return (
                      <div key={component.label}>
                        <strong>
                          {component.value}
                          <span>{suffix}</span>
                        </strong>
                        <div className="rating-bar">
                          <i
                            style={{
                              width: `${(component.value / max) * 100}%`,
                            }}
                          />
                        </div>
                        <small>{component.label}</small>
                      </div>
                    );
                  })}
                </div>
                {source && (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.publisher}
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="note">
        <ShieldCheck size={17} />
        {t(language, "results.from.different.protocols.and.equipment.l.c6966d")}
      </p>
    </section>
  );
}
