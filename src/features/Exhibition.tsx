import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
import { families } from "../data/models";
import type { Language } from "../lib/preferences";

const stories = [
  {
    family: "bmw-isetta",
    generation: "bmw-isetta-standard",
    label: ["Маленькая революция", "A small revolution"],
    text: [
      "Одна дверь спереди. Совсем другой взгляд на автомобиль.",
      "One door at the front. A completely different idea of a car.",
    ],
  },
  {
    family: "bmw-i8",
    generation: "bmw-i8-i12-lci",
    label: ["Будущее стало формой", "The shape of the future"],
    text: [
      "Гибридный спорткар, который сохранил смелость концепта.",
      "A hybrid sports car that kept the boldness of a concept.",
    ],
  },
  {
    family: "bmw-gs-boxer",
    generation: "bmw-gs-r80",
    label: ["За пределами асфальта", "Beyond the tarmac"],
    text: [
      "Начало истории GS: путешествие важнее пункта назначения.",
      "The beginning of GS: a journey beyond the destination.",
    ],
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
}: {
  language: Language;
  modelHref: (family: string, generation: string) => string;
  onModel: (family: string, generation: string) => void;
  collectionHref: string;
  onCollection: () => void;
}) {
  const en = language === "en";
  const hero = families.find((f) => f.id === "bmw-m1")!.generations[0];
  return (
    <div className="exhibition">
      <section className="museum-hero" aria-labelledby="museum-title">
        <div className="museum-intro">
          <span className="eyebrow">
            BMW ATLAS / {en ? "THE COLLECTION" : "КОЛЛЕКЦИЯ"}
          </span>
          <h1 id="museum-title">
            {en ? "More than" : "Больше, чем"} <br />
            <em>{en ? "a machine." : "автомобиль."}</em>
          </h1>
          <p>
            {en
              ? "Design, character and the details that make a BMW. Take your time. There is a story behind every silhouette."
              : "Дизайн, характер и детали, из которых складывается BMW. Здесь можно не спешить. За каждым силуэтом — своя история."}
          </p>
          <a
            className="museum-cta"
            href={collectionHref}
            onClick={(e) => follow(e, onCollection)}
          >
            {en ? "Explore the collection" : "Войти в коллекцию"}
            <ArrowRight size={20} />
          </a>
          <span className="museum-note">
            {en
              ? "Cars & motorcycles · From 1923 to today"
              : "Автомобили и мотоциклы · С 1923 года до наших дней"}
          </span>
        </div>
        <a
          className="museum-exhibit"
          href={modelHref("bmw-m1", hero.id)}
          onClick={(e) => follow(e, () => onModel("bmw-m1", hero.id))}
        >
          <div className="exhibit-topline">
            <span>{en ? "IN THE SPOTLIGHT" : "В ЦЕНТРЕ ВНИМАНИЯ"}</span>
            <span>01 / BMW M</span>
          </div>
          <img
            src={import.meta.env.BASE_URL + hero.photo!.url}
            alt={hero.photo!.subject}
            fetchPriority="high"
          />
          <div className="exhibit-caption">
            <div>
              <span>1978 — 1981 · E26</span>
              <h2>BMW M1</h2>
              <p>
                {en
                  ? "Giugiaro’s wedge. A straight-six behind the seats. The beginning of a legend."
                  : "Клин Джуджаро. Рядная шестёрка за спиной. Начало легенды."}
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
              {en ? "FOLLOW YOUR CURIOSITY" : "СЛЕДУЙТЕ ЛЮБОПЫТСТВУ"}
            </span>
            <h2 id="discovery-title">
              {en ? "Three different ways in" : "Три истории для начала"}
            </h2>
          </div>
          <span className="museum-section-note">
            {en
              ? "Different eras. Different ideas."
              : "Разные эпохи. Разные идеи."}
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
                  <img
                    src={import.meta.env.BASE_URL + generation.photo!.url}
                    alt={generation.photo!.subject}
                    loading="lazy"
                  />
                  <span>0{i + 1}</span>
                </div>
                <span className="eyebrow">
                  BMW {family.name} · {generation.start}
                </span>
                <h3>{story.label[en ? 1 : 0]}</h3>
                <p>{story.text[en ? 1 : 0]}</p>
                <span className="discovery-link">
                  {en ? "Discover the story" : "Открыть историю"}
                  <ArrowUpRight size={18} />
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
