import type { MeasurementScope } from "../units";

export type FactStatus = "unknown" | "confirmed" | "conflicting";

export interface FactAssertion<Value> {
  id: string;
  field: string;
  value: Value | null;
  sourceId: string;
  observedAt: string;
  scope: MeasurementScope;
}

export interface ResolvedFact<Value> {
  field: string;
  scope: MeasurementScope;
  status: FactStatus;
  value: Value | null;
  assertions: FactAssertion<Value>[];
  sourceIds: string[];
}

const sameScope = (left: MeasurementScope, right: MeasurementScope) =>
  left.region === right.region &&
  left.year === right.year &&
  left.body === right.body;

export function resolveFact<Value>(
  field: string,
  scope: MeasurementScope,
  assertions: readonly FactAssertion<Value>[],
  equals: (left: Value, right: Value) => boolean = Object.is,
): ResolvedFact<Value> {
  const scoped = assertions
    .filter(
      (assertion) =>
        assertion.field === field && sameScope(assertion.scope, scope),
    )
    .map((assertion) => ({
      ...assertion,
      scope: { ...assertion.scope },
    }));
  const known = scoped.filter(
    (assertion): assertion is FactAssertion<Value> & { value: Value } =>
      assertion.value !== null,
  );
  const sourceIds = [...new Set(scoped.map((assertion) => assertion.sourceId))];
  if (!known.length)
    return {
      field,
      scope: { ...scope },
      status: "unknown",
      value: null,
      assertions: scoped,
      sourceIds,
    };
  const value = known[0].value;
  const conflicting = known.some(
    (assertion) => !equals(assertion.value, value),
  );
  return {
    field,
    scope: { ...scope },
    status: conflicting ? "conflicting" : "confirmed",
    value: conflicting ? null : value,
    assertions: scoped,
    sourceIds,
  };
}

const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

export function validateFactAssertions<Value>(
  assertions: readonly FactAssertion<Value>[],
  knownSourceIds: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const assertion of assertions) {
    if (!assertion.id || ids.has(assertion.id))
      errors.push(`duplicate or empty assertion: ${assertion.id}`);
    ids.add(assertion.id);
    if (!assertion.field.trim())
      errors.push(`empty assertion field: ${assertion.id}`);
    if (!knownSourceIds.has(assertion.sourceId))
      errors.push(`unknown assertion source: ${assertion.id}`);
    if (!validDate(assertion.observedAt))
      errors.push(`invalid assertion date: ${assertion.id}`);
    if (
      !assertion.scope.region.trim() ||
      !assertion.scope.body.trim() ||
      !Number.isInteger(assertion.scope.year) ||
      assertion.scope.year < 1886 ||
      assertion.scope.year > 2100
    )
      errors.push(`invalid assertion scope: ${assertion.id}`);
  }
  return errors;
}
