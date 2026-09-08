import { normalize, type ModelFamily } from "../../../src/domain/catalog";

export const WIKIDATA_LICENSE = {
  name: "CC0 1.0",
  url: "https://creativecommons.org/publicdomain/zero/1.0/",
} as const;

export interface WikidataBinding {
  entityId: string;
  familyId: string;
}

interface WikidataTerm {
  language: string;
  value: string;
}

export interface WikidataEntity {
  id: string;
  labels?: Record<string, WikidataTerm>;
  aliases?: Record<string, WikidataTerm[]>;
}

export interface AliasCandidate {
  id: string;
  alias: string;
  normalizedAlias: string;
  language: string;
  entityId: string;
  entityUrl: string;
  boundFamilyId: string;
  familyChoices: string[];
  status: "accepted" | "ambiguous";
  alreadyPresent: boolean;
  license: typeof WIKIDATA_LICENSE;
}

type WikidataResponse = { entities?: Record<string, WikidataEntity> };

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

export async function fetchWikidataEntities(
  entityIds: string[],
  options: {
    fetchFn?: typeof fetch;
    sleep?: (ms: number) => Promise<void>;
    minimumIntervalMs?: number;
  } = {},
) {
  const fetchFn = options.fetchFn ?? fetch;
  const sleep =
    options.sleep ??
    ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const minimumIntervalMs = options.minimumIntervalMs ?? 1000;
  const uniqueIds = [...new Set(entityIds)];
  if (uniqueIds.some((id) => !/^Q[1-9]\d*$/.test(id)))
    throw new Error("Invalid Wikidata entity id");

  const entities: WikidataEntity[] = [];
  const batches = chunks(uniqueIds, 50);
  for (let index = 0; index < batches.length; index += 1) {
    if (index > 0) await sleep(minimumIntervalMs);
    const params = new URLSearchParams({
      action: "wbgetentities",
      ids: batches[index].join("|"),
      props: "labels|aliases",
      languages: "ru|en",
      languagefallback: "1",
      format: "json",
      formatversion: "2",
      origin: "*",
    });
    const response = await fetchFn(
      `https://www.wikidata.org/w/api.php?${params}`,
      {
        headers: { "User-Agent": "BMWAtlas/0.3 catalogue research" },
      },
    );
    if (!response.ok)
      throw new Error(`Wikidata request failed: ${response.status}`);
    const payload = (await response.json()) as WikidataResponse;
    if (!payload.entities) throw new Error("Invalid Wikidata response");
    for (const id of batches[index]) {
      const entity = payload.entities[id];
      if (!entity || entity.id !== id)
        throw new Error(`Missing Wikidata entity: ${id}`);
      entities.push(entity);
    }
  }
  return entities;
}

const manualOwners = (families: readonly ModelFamily[]) => {
  const owners = new Map<string, Set<string>>();
  for (const family of families)
    for (const value of [family.name, ...family.aliases]) {
      const key = normalize(value);
      if (!key) continue;
      const current = owners.get(key) ?? new Set<string>();
      current.add(family.id);
      owners.set(key, current);
    }
  return owners;
};

export function createAliasCandidates(
  families: readonly ModelFamily[],
  bindings: readonly WikidataBinding[],
  entities: readonly WikidataEntity[],
) {
  const familyIds = new Set(families.map((family) => family.id));
  const entityById = new Map(entities.map((entity) => [entity.id, entity]));
  const owners = manualOwners(families);
  const proposedOwners = new Map<string, Set<string>>();
  const candidates = new Map<string, AliasCandidate>();

  const termsFor = (entity: WikidataEntity) => [
    ...Object.values(entity.labels ?? {}),
    ...Object.values(entity.aliases ?? {}).flat(),
  ];

  for (const binding of bindings) {
    const entity = entityById.get(binding.entityId);
    if (!entity) continue;
    for (const term of termsFor(entity)) {
      if (term.language !== "ru" && term.language !== "en") continue;
      const key = normalize(term.value);
      if (!key) continue;
      const current = proposedOwners.get(key) ?? new Set<string>();
      current.add(binding.familyId);
      proposedOwners.set(key, current);
    }
  }

  for (const binding of bindings) {
    if (!familyIds.has(binding.familyId))
      throw new Error(`Unknown family binding: ${binding.familyId}`);
    if (!/^Q[1-9]\d*$/.test(binding.entityId))
      throw new Error(`Invalid Wikidata entity id: ${binding.entityId}`);
    const entity = entityById.get(binding.entityId);
    if (!entity) throw new Error(`Missing bound entity: ${binding.entityId}`);
    for (const term of termsFor(entity)) {
      if (term.language !== "ru" && term.language !== "en") continue;
      const normalizedAlias = normalize(term.value);
      if (!normalizedAlias) continue;
      const existingOwners = owners.get(normalizedAlias) ?? new Set<string>();
      const familyChoices = [
        ...new Set([
          binding.familyId,
          ...existingOwners,
          ...(proposedOwners.get(normalizedAlias) ?? []),
        ]),
      ].sort();
      const id = `wikidata:${binding.entityId}:${term.language}:${normalizedAlias}`;
      candidates.set(id, {
        id,
        alias: term.value.trim(),
        normalizedAlias,
        language: term.language,
        entityId: binding.entityId,
        entityUrl: `https://www.wikidata.org/wiki/${binding.entityId}`,
        boundFamilyId: binding.familyId,
        familyChoices,
        status: familyChoices.length === 1 ? "accepted" : "ambiguous",
        alreadyPresent: existingOwners.has(binding.familyId),
        license: WIKIDATA_LICENSE,
      });
    }
  }
  return [...candidates.values()].sort(
    (left, right) =>
      left.normalizedAlias.localeCompare(right.normalizedAlias) ||
      left.entityId.localeCompare(right.entityId),
  );
}

export function acceptedAliasAdditions(candidates: readonly AliasCandidate[]) {
  const additions = new Map<string, string[]>();
  for (const candidate of candidates) {
    if (candidate.status !== "accepted" || candidate.alreadyPresent) continue;
    const current = additions.get(candidate.boundFamilyId) ?? [];
    if (
      !current.some((alias) => normalize(alias) === candidate.normalizedAlias)
    )
      current.push(candidate.alias);
    additions.set(candidate.boundFamilyId, current);
  }
  return additions;
}
