import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { assetByGeneration } from "../../data/assets";
import { VehiclePhoto } from "./VehiclePhoto";

describe("VehiclePhoto", () => {
  it("renders a generation-specific fallback when the asset is unavailable", () => {
    const html = renderToStaticMarkup(<VehiclePhoto />);
    expect(html).toContain("Фото этого поколения ещё не добавлено");
    expect(html).toContain("Снимок другой версии здесь не используется");
  });

  it("keeps attribution links available in the full view", () => {
    const asset = assetByGeneration["bmw-r32-1923"];
    const html = renderToStaticMarkup(<VehiclePhoto photo={asset} />);
    expect(html).toContain(asset.subject);
    expect(html).toContain(asset.page.replaceAll("&", "&amp;"));
    expect(html).toContain(asset.licenseUrl.replaceAll("&", "&amp;"));
  });
});
