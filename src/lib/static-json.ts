export async function readStaticJson<T>(path: string): Promise<T> {
  const compressed = typeof DecompressionStream !== "undefined";
  const response = await fetch(
    import.meta.env.BASE_URL + path + (compressed ? ".gz" : ""),
  );
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  if (!compressed || response.headers.get("content-encoding") === "gzip")
    return response.json();
  if (!response.body) throw new Error(`Empty response for ${path}`);
  return new Response(
    response.body.pipeThrough(new DecompressionStream("gzip")),
  ).json();
}
