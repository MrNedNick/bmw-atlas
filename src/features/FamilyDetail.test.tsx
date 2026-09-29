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
        hrefForGeneration={(id) => `?generation=${id}`}
        onBack={() => undefined}
        saved={false}
        onSave={() => undefined}
      />,
    );

    expect(html.indexOf("detail-visual")).toBeLessThan(
      html.indexOf('aria-label="Выбор поколения"'),
    );
    expect(html).toContain('aria-label="Выберите поколение"');
    expect(html).toContain('aria-label="Факты о семействе"');
    expect(html).toContain(`href="?generation=${generation.id}"`);
    expect(html).not.toContain("Тираж · нет данных");
    expect(html).not.toContain("Нет подтверждённых данных");
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
        hrefForGeneration={(id) => `?generation=${id}`}
        onBack={() => undefined}
        saved={false}
        onSave={() => undefined}
      />,
    );

    expect(html).toContain(family.volume?.scope);
  });
});

it("keeps driving specifications together and production facts below the hero", () => {
  const family = families.find((f) => f.id === "bmw-8-coupe")!;
  const generation = family.generations[0];
  const html = renderToStaticMarkup(
    <FamilyDetail
      family={family}
      generation={generation}
      language="en"
      saved={false}
      onSave={() => {}}
      onBack={() => {}}
      onGeneration={() => {}}
      hrefForGeneration={(id) => `?generation=${id}`}
    />,
  );
  const hero = html.split('class="hero-specifications"')[1].split("</dl>")[0];
  expect(hero).toContain("300 PS");
  expect(hero).toContain("450");
  expect(hero.indexOf("Power")).toBeLessThan(hero.indexOf("Torque"));
  expect(hero).not.toContain("30,621");
  expect(hero).not.toContain("Assembly");
  expect(html).toContain("30,621");
  expect(html).toContain("Rosslyn");
});
