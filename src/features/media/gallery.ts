import { allGenerations } from "../../data/models";
import { catalogGroups } from "../../data/catalog-groups";
import { matchesText } from "../../domain/catalog";

export function gallerySelection(
  collection: string,
  query: string,
  faceliftOnly: boolean,
) {
  const group = catalogGroups.find((group) => group.id === collection);
  const code = query.trim().toUpperCase();
  const exactBodyCode = /^[EFGKRU]\d{2}$/.test(code);
  return allGenerations.filter(
    ({ family, generation }) =>
      generation.photo &&
      (!group || group.familyIds.includes(family.id)) &&
      (!faceliftOnly ||
        generation.photo.reference?.phase === "facelift" ||
        generation.code.includes("LCI")) &&
      (exactBodyCode
        ? generation.code
            .toUpperCase()
            .split(/[^A-Z0-9]+/)
            .includes(code)
        : matchesText(
            `${family.name} ${generation.code} ${generation.photo.subject} ${generation.start}`,
            query,
          )),
  );
}
