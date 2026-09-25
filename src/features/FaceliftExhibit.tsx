import { ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
import { families } from "../data/models";
import type { Language } from "../lib/preferences";

export const faceliftExhibits = [
  {
    family: "bmw-x7",
    name: "X7",
    before: "bmw-x7-g07",
    after: "bmw-x7-g07-lci",
    year: 2022,
    details: [
      [
        "Два уровня света",
        "Split-level lighting",
        "У раннего G07 — единый блок фар. У LCI тонкие дневные огни отделены от нижних основных фар.",
        "The original G07 has one headlamp unit. The LCI separates slim daytime lights from the main lamps below.",
      ],
      [
        "Другой интерьер",
        "A different interior",
        "Curved Display объединяет приборы и центральный экран в новую композицию.",
        "Curved Display brings the instruments and centre screen into a new composition.",
      ],
      [
        "То же поколение",
        "The same generation",
        "Новая внешность с 2022 года, но это по-прежнему первое поколение X7 — G07.",
        "A new face from 2022, but still the first X7 generation: G07.",
      ],
    ],
  },
  {
    family: "bmw-x5",
    name: "X5",
    before: "bmw-x5-g05",
    after: "bmw-x5-g05-lci",
    year: 2023,
    details: [
      [
        "Фары тоньше на 35 мм",
        "Headlamps 35 mm slimmer",
        "Самая заметная подсказка — более узкая оптика и новый рисунок света.",
        "The clearest clue is the slimmer headlamp unit and its new light signature.",
      ],
      [
        "Изогнутый дисплей",
        "A curved display",
        "BMW Curved Display заменил прежнее оформление приборов и центрального экрана.",
        "BMW Curved Display replaced the previous instrument and centre-screen layout.",
      ],
      [
        "Эволюция G05",
        "The evolution of G05",
        "Обновление 2023 года сохраняет код G05. Это рестайлинг четвёртого X5.",
        "The 2023 update retains the G05 code. It is a facelift of the fourth X5.",
      ],
    ],
  },
  {
    family: "bmw-x6",
    name: "X6",
    before: "bmw-x6-g06",
    after: "bmw-x6-g06-lci",
    year: 2023,
    details: [
      [
        "Новый взгляд",
        "A new expression",
        "Более узкие фары и обновлённая световая графика меняют выражение передней части.",
        "Slimmer headlights and a revised light signature change the face of the car.",
      ],
      [
        "Знакомый силуэт",
        "A familiar silhouette",
        "Купеобразная крыша остаётся главным отличием X6, несмотря на обновление передней части.",
        "The coupé roofline remains the signature X6 feature despite the revised front end.",
      ],
      [
        "G06, не новое поколение",
        "G06, not a new generation",
        "Версия LCI появилась в 2023 году. Ранний автомобиль и рестайлинг относятся к одному поколению.",
        "The LCI arrived in 2023. The original car and the facelift belong to the same generation.",
      ],
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
  const en = language === "en";
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
            {en ? "THE ART OF NOTICING" : "ИСКУССТВО ЗАМЕЧАТЬ"}
          </span>
          <h2 id="facelift-exhibit-title">
            {en
              ? "One generation. Two expressions."
              : "Одно поколение. Два характера."}
          </h2>
        </div>
        <div
          className="facelift-switch"
          aria-label={
            en
              ? "Choose a facelift comparison"
              : "Выбор рестайлинга для сравнения"
          }
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
        {en
          ? "A facelift is a chance to look closer. Start with the lights, then notice what stayed the same."
          : "Рестайлинг — повод присмотреться. Начните с фар, а потом найдите то, что осталось прежним."}
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
                    ? en
                      ? "AFTER / LCI"
                      : "ПОСЛЕ / LCI"
                    : en
                      ? "BEFORE"
                      : "ДО ОБНОВЛЕНИЯ"}
                </span>
                <span>{index ? pair.year : generation.start}</span>
              </div>
              <img
                src={import.meta.env.BASE_URL + generation.photo!.url}
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
            <h3>{detail[en ? 1 : 0]}</h3>
            <p>{detail[en ? 3 : 2]}</p>
          </div>
        ))}
      </div>
      <p className="facelift-note">
        {en
          ? "The images show different equipment versions. The notes describe confirmed facelift changes."
          : "На снимках разные комплектации. В пояснениях — подтверждённые изменения рестайлинга."}
      </p>
    </section>
  );
}
