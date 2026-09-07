export function parseGarage(
  raw: string | null,
  allowed: readonly string[],
): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return [
      ...new Set(
        value.filter(
          (item): item is string =>
            typeof item === "string" && allowed.includes(item),
        ),
      ),
    ];
  } catch {
    return [];
  }
}
