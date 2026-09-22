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
      <span className="eyebrow">{isEnglish ? "SAFETY" : "БЕЗОПАСНОСТЬ"}</span>
      <h3>{isEnglish ? "Rating with context" : "Оценка с контекстом"}</h3>
      {view.status === "unknown" ? (
        <p className="empty-inline">{view.reason}</p>
      ) : (
        <div className="rating-scenarios">
          {view.ratings.map((rating) => {
            if (rating.status === "unknown")
              return (
                <article className="rating-scenario" key={rating.id}>
                  <strong>
                    {rating.scheme} · {isEnglish ? "no data" : "нет данных"}
                  </strong>
                  <p className="muted">{rating.reason}</p>
                </article>
              );
            const source = sourceById[rating.source];
            return (
              <article className="rating-scenario" key={rating.id}>
                <strong>
                  {rating.scheme} · {isEnglish ? "protocol" : "протокол"}{" "}
                  {rating.protocolYear}
                </strong>
                <p className="muted">
                  {rating.testedVariant} · {rating.safetyPack.label}
                </p>
                {rating.overall && (
                  <p className="rating-overall">
                    {rating.overall.value} / 5{" "}
                    <small>{isEnglish ? "stars" : "звёзд"}</small>
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
        {isEnglish
          ? "Results from different protocols and equipment levels are shown separately and are not averaged."
          : "Результаты разных протоколов и комплектаций показываются отдельно и не усредняются."}
      </p>
    </section>
  );
}
