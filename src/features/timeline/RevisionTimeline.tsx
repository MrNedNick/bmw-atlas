import { ArrowUpRight, Layers3 } from "lucide-react";
import { sourceById } from "../../data/sources";
import type { Revision } from "../../domain/revisions";
import { revisionKindLabel } from "../../domain/revisions";

export function RevisionTimeline({
  revisions,
}: {
  revisions: readonly Revision[];
}) {
  return (
    <div className="revision-list">
      <h4>
        <Layers3 size={17} /> Известные обновления
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
                  {revisionKindLabel[revision.kind]}
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
          Подтверждённые обновления пока не добавлены. Это не означает, что
          рестайлингов не было.
        </p>
      )}
    </div>
  );
}
