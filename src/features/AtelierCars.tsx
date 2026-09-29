import { useState } from "react";
import { atelierCars, type AtelierCar } from "../data/atelier-cars";
import { sourceById } from "../data/sources";
import { t, type Locale } from "../i18n";
import { Button } from "../components/button/button";

export type AtelierFilter = "all" | "sedan" | "touring" | "facelift";
export function selectAtelierCars(filter: AtelierFilter): AtelierCar[] {
  return atelierCars.filter(
    (car) => filter === "all" || car.body === filter || car.phase === filter,
  );
}
export function AtelierCars({ language }: { language: Locale }) {
  const [filter, setFilter] = useState<AtelierFilter>("all");
  const cars = selectAtelierCars(filter);
  return (
    <section className="atelier-cars" aria-labelledby="atelier-cars-title">
      <header>
        <span className="eyebrow">ALPINA · 2020 / 2022 / 2023</span>
        <h2 id="atelier-cars-title">{t(language, "atelier.cars.title")}</h2>
        <p>{t(language, "atelier.cars.intro")}</p>
      </header>
      <div
        className="atelier-car-filters"
        role="group"
        aria-label={t(language, "collection.filters")}
      >
        {(["all", "sedan", "touring", "facelift"] as const).map((value) => (
          <Button
            key={value}
            variant="outline"
            aria-pressed={filter === value}
            onClick={() => setFilter(filter === value ? "all" : value)}
          >
            {t(language, `atelier.cars.${value}`)}
          </Button>
        ))}
        <span role="status">
          {t(language, "collection.versions")}: {cars.length}
        </span>
      </div>
      <div className="atelier-car-grid">
        {cars.map((car) => (
          <article className="atelier-car" key={car.id} id={car.id}>
            <div className="atelier-car-phase">
              <span>
                {car.code} · {car.asOf.slice(0, 4)}
              </span>
              <span>
                {t(
                  language,
                  car.phase === "facelift"
                    ? "collection.facelift"
                    : `atelier.cars.${car.phase}`,
                )}
              </span>
            </div>
            <h3>
              {language === "ru"
                ? car.name.replace("Sedan", "Седан")
                : car.name}
            </h3>
            <dl className="atelier-car-stats">
              <div>
                <dt>{t(language, "atelier.cars.power")}</dt>
                <dd>
                  {car.powerPs} <small>{t(language, "atelier.cars.ps")}</small>
                </dd>
              </div>
              <div>
                <dt>0–100 {t(language, "atelier.cars.kmh")}</dt>
                <dd>
                  {car.zeroTo100.toLocaleString(language)}{" "}
                  <small>{t(language, "atelier.cars.seconds")}</small>
                </dd>
              </div>
              <div>
                <dt>{t(language, "atelier.cars.torque")}</dt>
                <dd>
                  {car.torqueNm} <small>{t(language, "atelier.cars.nm")}</small>
                </dd>
              </div>
            </dl>
            <p className="atelier-photo-reserved">
              {t(language, "photo.coming.soon.577ba2")} · {car.code}{" "}
              {car.phase === "facelift" ? "LCI" : ""}
            </p>
            <details>
              <summary>{t(language, "atelier.cars.details")}</summary>
              <p>{t(language, car.story)}</p>
              <dl className="atelier-car-technical">
                <div>
                  <dt>{t(language, "atelier.cars.displacement")}</dt>
                  <dd>
                    {car.engine} · {car.powerKw}{" "}
                    {t(language, "atelier.cars.kw")}
                  </dd>
                </div>
                <div>
                  <dt>{t(language, "atelier.cars.speed")}</dt>
                  <dd>
                    {car.topSpeedKmh} {t(language, "atelier.cars.kmh")}
                  </dd>
                </div>
              </dl>
              <p>{t(language, "atelier.cars.gearbox")}</p>
              {car.editionLimit && (
                <p className="atelier-edition-note">
                  {t(language, "atelier.cars.limit")}
                </p>
              )}
              <a
                className="source-link"
                href={`?view=models&model=${car.baseFamilyId}`}
              >
                {t(language, "atelier.cars.base")} ↗
              </a>
              <p className="atelier-spec-scope">
                {t(language, "atelier.cars.snapshot")}: {car.asOf}.{" "}
                {t(language, "atelier.cars.scope")}
              </p>
              <a
                className="source-link"
                href={sourceById[car.source].url}
                target="_blank"
                rel="noreferrer"
              >
                ALPINA · PDF ↗
              </a>
              <h4>{t(language, "atelier.cars.photo")}</h4>
              <p>{t(language, car.photoBrief)}</p>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
