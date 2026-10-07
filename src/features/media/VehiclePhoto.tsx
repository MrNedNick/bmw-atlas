import { VehicleImage } from "./VehicleImage";
import { t, label } from "../../i18n";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Photo } from "../../domain/catalog";
import type { Language } from "../../lib/preferences";

export function VehiclePhoto({
  photo,
  compact = false,
  language = "ru",
  onOpen,
  planned,
  priority = false,
}: {
  photo?: Photo;
  planned?: string;
  priority?: boolean;
  compact?: boolean;
  language?: Language;
  onOpen?: () => void;
}) {
  const [failed, setFailed] = useState("");
  const isEnglish = language === "en";
  if (!photo || failed === photo.url)
    return (
      <div className="photo-missing">
        <ImageOff size={30} />
        <strong>{t(language, "photo.coming.soon.577ba2")}</strong>
        {planned && <span className="photo-planned-subject">{planned}</span>}
      </div>
    );
  const subject = label(language, photo.subject);
  return (
    <figure className={"vehicle-photo " + (compact ? "compact" : "")}>
      {onOpen ? (
        <button
          className="photo-open"
          onClick={onOpen}
          aria-label={t(language, "enlarge.37acfd") + subject}
        >
          <VehicleImage
            photo={photo}
            compact={compact}
            fetchPriority={priority ? "high" : "auto"}
            alt={subject}
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailed(photo.url)}
          />
        </button>
      ) : (
        <VehicleImage
          photo={photo}
          compact={compact}
          fetchPriority={priority ? "high" : "auto"}
          alt={subject}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(photo.url)}
        />
      )}
      <figcaption>
        {compact ? (
          <span>{subject}</span>
        ) : (
          <>
            <strong>{subject}</strong>
            <details className="photo-credits">
              <summary>{t(language, "about.this.image.8ee887")}</summary>
              <span>
                <a href={photo.page} target="_blank" rel="noreferrer">
                  {isEnglish && photo.author === "Редакция BMW Atlas"
                    ? "BMW Atlas editorial team"
                    : photo.author}
                </a>{" "}
                ·{" "}
                <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                  {isEnglish && photo.license === "Редакционная визуализация"
                    ? "Editorial visualization"
                    : photo.license}
                </a>
              </span>
              {photo.note && (
                <small className="photo-note">
                  {isEnglish && photo.note.includes("Редакционная")
                    ? photo.reference
                      ? "Editorial visualization based on the exact source photograph; background and lighting modified."
                      : "Editorial visualization; the source photograph requires verification."
                    : photo.note}
                </small>
              )}
            </details>
          </>
        )}
      </figcaption>
    </figure>
  );
}
