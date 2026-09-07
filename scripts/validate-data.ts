import { families } from "../src/data/models";
import { sources } from "../src/data/sources";
import { validateCatalog } from "../src/domain/catalog";
const errors = validateCatalog(families, sources);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Valid: ${families.length} families, ${families.reduce((n, f) => n + f.generations.length, 0)} generations, ${sources.length} sources`,
  );
