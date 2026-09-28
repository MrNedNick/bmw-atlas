import { t } from "../../i18n";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { sourceById } from "../../data/sources";
import type { Revision } from "../../domain/revisions";
import { revisionKindLabel } from "../../domain/revisions";
import type { Language } from "../../lib/preferences";

export function RevisionTimeline({
  revisions,
  language = "ru",
}: {
  revisions: readonly Revision[];
  language?: Language;
}) {
  const isEnglish = language === "en";
  return (
    <div className="revision-list">
      <h4>
        <Layers3 size={17} /> {t(language, "known.updates.de7e61")}
      </h4>
      {revisions.length ? (
        revisions.map((revision, index) => {
          const source = sourceById[revision.source];
          return (
            <div
              className="revision"
              key={`${revision.year}-${revision.kind}-${index}`}
            >
              <strong>{revision.year}</strong>
              <div>
                <span
                  className={`tag ${revision.kind === "facelift" ? "green" : ""}`}
                >
                  {isEnglish
                    ? revision.kind === "facelift"
                      ? "Facelift"
                      : "Model-year update"
                    : revisionKindLabel[revision.kind]}
                </span>
                <p>{revision.title}</p>
                <small>
                  {revision.market} · {revision.bodies.join(" · ")}
                </small>
                {source && (
                  <a
                    className="source-link"
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.publisher}
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="empty-inline">
          {t(
            language,
            "confirmed.updates.have.not.been.added.yet.this.d.e6e21a",
          )}
        </p>
      )}
    </div>
  );
}
