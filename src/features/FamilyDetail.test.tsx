import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { families } from "../data/models";
import { FamilyDetail } from "./FamilyDetail";

describe("FamilyDetail", () => {
  it("places generation controls after the photo and omits an unknown volume summary", () => {
    const family = families.find((item) => item.id === "bmw-m4");
    expect(family).toBeDefined();
    if (!family) return;

    const generation = family.generations[0];
    const html = renderToStaticMarkup(
      <FamilyDetail
        family={family}
        generation={generation}
        onGeneration={() => undefined}
        onBack={() => undefined}
        saved={false}
        onSave={() => undefined}
        compare={[]}
        onCompare={() => undefined}
      />,
    );

    expect(html.indexOf("detail-visual")).toBeLessThan(
      html.indexOf('aria-label="Выбор поколения"'),
    );
    expect(html).toContain('aria-label="Выберите поколение"');
    expect(html).toContain('aria-label="Факты о семействе"');
    expect(html).not.toContain("Тираж · нет данных");
    expect(html).not.toContain("Нет подтверждённых данных</strong>");
  });

  it("keeps a confirmed family volume as an optional fact", () => {
    const family = families.find((item) => item.volume);
    expect(family).toBeDefined();
    if (!family) return;

    const html = renderToStaticMarkup(
      <FamilyDetail
        family={family}
        generation={family.generations[0]}
        onGeneration={() => undefined}
        onBack={() => undefined}
        saved={false}
        onSave={() => undefined}
        compare={[]}
        onCompare={() => undefined}
      />,
    );

    expect(html).toContain(family.volume?.scope);
  });
});
