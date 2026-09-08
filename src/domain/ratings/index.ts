export type SafetyScheme = "Euro NCAP" | "NHTSA NCAP";
export type SafetyPackStatus = "standard" | "optional" | "none" | "unknown";

export interface SafetyPackContext {
  status: SafetyPackStatus;
  label: string;
}

export interface RatedSafetyResult {
  id: string;
  status: "rated";
  scheme: SafetyScheme;
  protocolYear: number;
  testedVariant: string;
  market: "Europe" | "US";
  safetyPack: SafetyPackContext;
  overall: { value: number; scale: "stars-5" } | null;
  components: {
    label: string;
    value: number;
    scale: "percent" | "stars-5";
  }[];
  source: string;
}

export interface UnknownSafetyResult {
  id: string;
  status: "unknown";
  scheme: SafetyScheme;
  protocolYear: null;
  testedVariant: string;
  market: "Europe" | "US";
  safetyPack: { status: "unknown"; label: string };
  reason: string;
}

export type SafetyRating = RatedSafetyResult | UnknownSafetyResult;

export function validateSafetyRatings(ratings: readonly SafetyRating[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const rating of ratings) {
    if (ids.has(rating.id))
      errors.push(`duplicate safety rating: ${rating.id}`);
    ids.add(rating.id);
    if (!rating.testedVariant.trim() || !rating.safetyPack.label.trim())
      errors.push(`missing safety context: ${rating.id}`);
    if (rating.status === "unknown") {
      if (!rating.reason.trim())
        errors.push(`missing unknown reason: ${rating.id}`);
      continue;
    }
    if (!Number.isInteger(rating.protocolYear) || rating.protocolYear < 1997)
      errors.push(`invalid safety protocol year: ${rating.id}`);
    const values = [
      ...(rating.overall ? [rating.overall] : []),
      ...rating.components,
    ];
    for (const score of values) {
      const max = score.scale === "percent" ? 100 : 5;
      if (score.value < 0 || score.value > max)
        errors.push(`invalid safety score: ${rating.id}`);
    }
  }
  return errors;
}

export function safetyRatingView(ratings: readonly SafetyRating[]) {
  return ratings.length
    ? ({ status: "rated", ratings: [...ratings] } as const)
    : ({
        status: "unknown",
        reason:
          "Проверенная оценка для этой версии ещё не добавлена. Рейтинг другого поколения не переносится.",
      } as const);
}
