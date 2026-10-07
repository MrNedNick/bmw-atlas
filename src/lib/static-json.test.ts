import { gzipSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readStaticJson } from "./static-json";
afterEach(() => vi.unstubAllGlobals());
describe("compressed static data", () => {
  it("decompresses static files when the host serves them as binary data", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(gzipSync(JSON.stringify({ value: 42 }))),
        ),
    );
    expect(await readStaticJson("data/example.json")).toEqual({ value: 42 });
  });
  it("accepts data already decompressed by the browser HTTP stack", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ value: 42 }), {
          headers: { "content-encoding": "gzip" },
        }),
      ),
    );
    expect(await readStaticJson("data/example.json")).toEqual({ value: 42 });
  });
  it("loads plain JSON on browsers without streaming decompression", async () => {
    vi.stubGlobal("DecompressionStream", undefined);
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ value: 42 })));
    vi.stubGlobal("fetch", fetch);
    expect(await readStaticJson("data/example.json")).toEqual({ value: 42 });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/example\.json$/));
  });
});
