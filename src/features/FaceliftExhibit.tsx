import { VehicleImage } from "./media/VehicleImage";
import { t } from "../i18n";
import { ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
import { families } from "../data/browser-catalog";
import type { Language } from "../lib/preferences";

export const faceliftExhibits = [
  {
    family: "bmw-x7",
    name: "X7",
    before: "bmw-x7-g07",
    after: "bmw-x7-g07-lci",
    year: 2022,
    details: [
      ["story.aa4f43f2b7", "story.5ebce5e65c"],
      ["story.ebb9891c09", "story.faff6ddf15"],
      ["story.291b95b66a", "story.a52c0960a7"],
    ],
  },
  {
    family: "bmw-x5",
    name: "X5",
    before: "bmw-x5-g05",
    after: "bmw-x5-g05-lci",
    year: 2023,
    details: [
      ["story.5677519767", "story.e5e90da5bb"],
      ["story.c9591b64d1", "story.a17799d7c8"],
      ["story.6c9368886c", "story.e2d6c278b2"],
    ],
  },
  {
    family: "bmw-x6",
    name: "X6",
    before: "bmw-x6-g06",
    after: "bmw-x6-g06-lci",
    year: 2023,
    details: [
      ["story.da10d6aacb", "story.2225396125"],
      ["story.bb0ac274d2", "story.45323946fe"],
      ["story.097777c156", "story.1b57f5aec6"],
    ],
  },
] as const;

export function FaceliftExhibit({
  language,
  modelHref,
  onModel,
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
  language: Language;
  modelHref: (family: string, generation: string) => string;
  onModel: (family: string, generation: string) => void;
}) {
  const pair = faceliftExhibits[selected];
  const family = families.find((f) => f.id === pair.family)!;

  const follow = (event: MouseEvent<HTMLAnchorElement>, generation: string) => {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onModel(pair.family, generation);
  };
  return (
    <section
      className="facelift-exhibit"
      aria-labelledby="facelift-exhibit-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {t(language, "the.art.of.noticing.017b22")}
          </span>
          <h2 id="facelift-exhibit-title">
            {t(language, "one.generation.two.expressions.391b7c")}
          </h2>
        </div>
        <div
          className="facelift-switch"
          aria-label={t(language, "choose.a.facelift.comparison.7ece6f")}
        >
          {faceliftExhibits.map((item, index) => (
            <button
              key={item.family}
              aria-pressed={selected === index}
              onClick={() => onSelect(index)}
            >
              BMW {item.name}
            </button>
          ))}
        </div>
      </div>
      <p className="facelift-intro">
        {t(language, "a.facelift.is.a.chance.to.look.closer.start.with.04460e")}
      </p>
      <div className="facelift-pair">
        {[pair.before, pair.after].map((id, index) => {
          const generation = family.generations.find((g) => g.id === id)!;
          return (
            <a
              key={id}
              href={modelHref(pair.family, id)}
              onClick={(event) => follow(event, id)}
              className="facelift-phase"
            >
              <div>
                <span>
                  {index
                    ? t(language, "after.lci.64e253")
                    : t(language, "before.c1b3e1")}
                </span>
                <span>{index ? pair.year : generation.start}</span>
              </div>
              <VehicleImage
                photo={generation.photo!}
                compact
                alt={generation.photo!.subject}
                loading="lazy"
              />
              <div>
                <strong>
                  BMW {pair.name} · {generation.code}
                </strong>
                <ArrowUpRight size={20} />
              </div>
            </a>
          );
        })}
      </div>
      <div className="facelift-details" aria-live="polite">
        {pair.details.map((detail, i) => (
          <div key={detail[0]}>
            <span>0{i + 1}</span>
            <h3>{t(language, detail[0])}</h3>
            <p>{t(language, detail[1])}</p>
          </div>
        ))}
      </div>
      <p className="facelift-note">
        {t(language, "the.images.show.different.equipment.versions.the.f93259")}
      </p>
    </section>
  );
}
