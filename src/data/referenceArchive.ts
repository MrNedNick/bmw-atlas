import { existsSync } from "node:fs";

const root = new URL("../../", import.meta.url);

// Full-size source photographs stay outside the repository. Where the archive is
// present locally, every reference must resolve to a file in it.
export const hasReferenceArchive = existsSync(
  new URL("references/images/", root),
);

export const referenceFileExists = (localFile: string | undefined): boolean =>
  !hasReferenceArchive || (!!localFile && existsSync(new URL(localFile, root)));
