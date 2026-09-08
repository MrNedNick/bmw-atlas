export type RevisionKind = "facelift" | "model-year" | "technical";

export interface Revision {
  year: number;
  kind: RevisionKind;
  title: string;
  source: string;
  market: string;
  bodies: string[];
}

export const revisionKindLabel: Record<RevisionKind, string> = {
  facelift: "Рестайлинг",
  "model-year": "Модельный год",
  technical: "Техническое обновление",
};

export const faceliftCount = (revisions: readonly Revision[]) =>
  revisions.filter((revision) => revision.kind === "facelift").length;

export function validateRevisions(
  revisions: readonly Revision[],
  generation: { id: string; start: number; end: number | null },
) {
  const errors: string[] = [];
  for (const revision of revisions) {
    if (
      !Number.isInteger(revision.year) ||
      revision.year < generation.start ||
      (generation.end !== null && revision.year > generation.end)
    )
      errors.push(`revision outside generation: ${generation.id}`);
    if (!revision.market.trim() || !revision.bodies.length)
      errors.push(`revision without scope: ${generation.id}`);
    if (revision.bodies.some((body) => !body.trim()))
      errors.push(`invalid revision body: ${generation.id}`);
  }
  return errors;
}
