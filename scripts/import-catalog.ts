import { runSnapshotImport, type VpicRow } from "./ingestion/snapshot";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getResults(path: string): Promise<VpicRow[]> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/${path}?format=json`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(25_000),
        headers: { "User-Agent": "BMWAtlas/0.3 catalogue research" },
      });
      if (!response.ok) throw new Error(String(response.status));
      const payload = (await response.json()) as { Results?: VpicRow[] };
      if (!Array.isArray(payload.Results)) throw new Error("Invalid results");
      return payload.Results;
    } catch (error) {
      if (attempt === 2) throw error;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw new Error("Import failed");
}

const snapshot = await runSnapshotImport({ getResults });
console.log(
  "Snapshot promoted:",
  snapshot.modelCount,
  "names",
  snapshot.makeCount,
  "makes",
);
