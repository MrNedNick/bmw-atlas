import { VehicleImage } from "./media/VehicleImage";
import { t } from "../i18n";
import { ArrowRight, ArrowUpRight, Shuffle } from "lucide-react";
import type { MouseEvent } from "react";
import { families } from "../data/browser-catalog";
import { FaceliftExhibit } from "./FaceliftExhibit";
import type { Language } from "../lib/preferences";

const stories = [
  {
    family: "bmw-isetta",
    generation: "bmw-isetta-standard",
    label: "story.bc86a7d34c",
    text: "story.d14446e26c",
  },
  {
    family: "bmw-i8",
    generation: "bmw-i8-i12-lci",
    label: "story.f430006148",
    text: "story.368618a0fd",
  },
  {
    family: "bmw-gs-boxer",
    generation: "bmw-gs-r80",
    label: "story.74cd5a31bd",
    text: "story.8d23fcea05",
  },
] as const;

function follow(event: MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (
    event.button ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  action();
}

export function Exhibition({
  language,
  modelHref,
  onModel,
  collectionHref,
  onCollection,
  onRandom,
  faceliftSelection,
  onFaceliftSelection,
}: {
  language: Language;
  modelHref: (family: string, generation: string) => string;
  onModel: (family: string, generation: string) => void;
  collectionHref: string;
  onCollection: () => void;
  onRandom: () => void;
  faceliftSelection: number;
  onFaceliftSelection: (index: number) => void;
}) {
  const hero = families.find((f) => f.id === "bmw-m1")!.generations[0];
  return (
    <div className="exhibition">
      <section className="museum-hero" aria-labelledby="museum-title">
        <img
          className="museum-cover-art"
          src={
            import.meta.env.BASE_URL + "images/bmw-atlas-exhibition-cover.webp"
          }
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="museum-intro">
          <span className="eyebrow">
            BMW ATLAS / {t(language, "the.collection.71e618")}
          </span>
          <h1 id="museum-title">
            {t(language, "more.than.aa3aed")} <br />
            <em>{t(language, "a.machine.7a5c92")}</em>
          </h1>
          <p>
            {t(
              language,
              "design.character.and.the.details.that.make.a.bmw.b160e2",
            )}
          </p>
          <a
            className="museum-cta"
            href={collectionHref}
            onClick={(e) => follow(e, onCollection)}
          >
            {t(language, "explore.the.collection.de801b")}
            <ArrowRight size={20} />
          </a>
          <button className="museum-random" onClick={onRandom}>
            <Shuffle size={17} />
            {t(language, "surprise.me.ea464f")}
          </button>
          <span className="museum-note">
            {t(language, "cars.motorcycles.from.1923.to.today.7ac203")}
          </span>
        </div>
        <a
          className="museum-exhibit"
          href={modelHref("bmw-m1", hero.id)}
          onClick={(e) => follow(e, () => onModel("bmw-m1", hero.id))}
        >
          <div className="exhibit-topline">
            <span>{t(language, "in.the.spotlight.7abdbd")}</span>
            <span>01 / BMW M</span>
          </div>
          <VehicleImage
            photo={hero.photo!}
            alt={hero.photo!.subject}
            fetchPriority="high"
          />
          <div className="exhibit-caption">
            <div>
              <span>1978 — 1981 · E26</span>
              <h2>BMW M1</h2>
              <p>
                {t(
                  language,
                  "giugiaro.s.wedge.a.straight.six.behind.the.seats.002fbf",
                )}
              </p>
            </div>
            <span className="round-arrow">
              <ArrowUpRight />
            </span>
          </div>
        </a>
      </section>
      <section className="museum-stories" aria-labelledby="discovery-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t(language, "follow.your.curiosity.44e49e")}
            </span>
            <h2 id="discovery-title">
              {t(language, "three.different.ways.in.ef1657")}
            </h2>
          </div>
          <span className="museum-section-note">
            {t(language, "different.eras.different.ideas.dd66f8")}
          </span>
        </div>
        <div className="discovery-grid">
          {stories.map((story, i) => {
            const family = families.find((f) => f.id === story.family)!;
            const generation = family.generations.find(
              (g) => g.id === story.generation,
            )!;
            return (
              <a
                className="discovery-card"
                key={story.family}
                href={modelHref(story.family, story.generation)}
                onClick={(e) =>
                  follow(e, () => onModel(story.family, story.generation))
                }
              >
                <div className="discovery-image">
                  <VehicleImage
                    photo={generation.photo!}
                    compact
                    alt={generation.photo!.subject}
                    loading="lazy"
                  />
                  <span>0{i + 1}</span>
                </div>
                <span className="eyebrow">
                  BMW {family.name} · {generation.start}
                </span>
                <h3>{t(language, story.label)}</h3>
                <p>{t(language, story.text)}</p>
                <span className="discovery-link">
                  {t(language, "discover.the.story.582e60")}
                  <ArrowUpRight size={18} />
                </span>
              </a>
            );
          })}
        </div>
      </section>
      <FaceliftExhibit
        selected={faceliftSelection}
        onSelect={onFaceliftSelection}
        language={language}
        modelHref={modelHref}
        onModel={onModel}
      />
    </div>
  );
}
