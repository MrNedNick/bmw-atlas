import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SafetyRating } from "../../domain/ratings";
import { RatingsPanel } from "./RatingsPanel";

const result = (id: string, label: string): SafetyRating => ({
  id,
  status: "rated",
  scheme: "Euro NCAP",
  protocolYear: 2022,
  testedVariant: "BMW example",
  market: "Europe",
  safetyPack: {
    status: label === "Standard" ? "standard" : "optional",
    label,
  },
  overall: { value: 5, scale: "stars-5" },
  components: [{ label: "Adult occupant", value: 88, scale: "percent" }],
  source: "bmw-history",
});

describe("RatingsPanel", () => {
  it("renders safety-pack scenarios separately without an average", () => {
    const html = renderToStaticMarkup(
      <RatingsPanel
        ratings={[
          result("standard", "Standard"),
          result("pack", "Safety Pack"),
        ]}
      />,
    );
    expect(html.match(/class="rating-scenario"/g)).toHaveLength(2);
    expect(html).toContain("Standard");
    expect(html).toContain("Safety Pack");
    expect(html).not.toContain("Средн");
  });

  it("renders missing coverage without a numeric score", () => {
    const html = renderToStaticMarkup(<RatingsPanel ratings={[]} />);
    expect(html).toContain("ещё не добавлена");
    expect(html).not.toContain("rating-overall");
  });
});
