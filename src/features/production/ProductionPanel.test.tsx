import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductionPanel } from "./ProductionPanel";

const render = (generationId: string) =>
  renderToStaticMarkup(
    <ProductionPanel
      generationId={generationId}
      familyVolume={null}
      generationVolume={null}
      sourceLink={(id) => <a href={`https://example.com/${id}`}>Источник</a>}
    />,
  );

describe("ProductionPanel", () => {
  it("shows plants with explicit production periods", () => {
    const html = render("bmw-g20");
    expect(html).toContain("BMW Group Plant Munich");
    expect(html).toContain("2018–н. в.");
    expect(html).toContain("Полное производство");
  });

  it("does not substitute the brand country when coverage is missing", () => {
    const html = render("generation-without-production-evidence");
    expect(html).toContain("Страна происхождения BMW сюда не подставляется");
    expect(html).not.toContain("BMW Group Plant Munich");
  });
});
