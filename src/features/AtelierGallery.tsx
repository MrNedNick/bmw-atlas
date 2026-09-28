import { ateliers } from "../data/ateliers";
import { sourceById } from "../data/sources";
import { t, type Locale } from "../i18n";
export function AtelierGallery({ language }: { language: Locale }) {
  return (
    <section className="atelier-gallery page-enter">
      <header className="archive-heading">
        <div>
          <span className="eyebrow">{t(language, "heritage.eyebrow")}</span>
          <h1>{t(language, "heritage.title")}</h1>
        </div>
        <p>{t(language, "heritage.intro")}</p>
      </header>
      <nav className="atelier-index" aria-label={t(language, "heritage.nav")}>
        {ateliers.map((a) => (
          <a key={a.id} href={`#atelier-${a.id}`}>
            {a.name} <span>↗</span>
          </a>
        ))}
      </nav>
      {ateliers.map((a, i) => (
        <article className="atelier-chapter" id={`atelier-${a.id}`} key={a.id}>
          <header>
            <span className="eyebrow">
              0{i + 1} · {a.years}
            </span>
            <h2>{a.name}</h2>
            <p className="atelier-status">{t(language, a.status)}</p>
          </header>
          <div className="atelier-story">
            <p>{t(language, a.story)}</p>
            <p>{t(language, a.transition)}</p>
            <aside className="atelier-next">
              <span className="eyebrow">{t(language, "heritage.next")}</span>
              <p>{t(language, a.next)}</p>
            </aside>
            <details className="atelier-sources">
              <summary>{t(language, "heritage.sources")}</summary>
              {a.sources.map((id) => (
                <a
                  key={id}
                  href={sourceById[id].url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {sourceById[id].publisher} ↗
                </a>
              ))}
            </details>
          </div>
        </article>
      ))}
    </section>
  );
}
