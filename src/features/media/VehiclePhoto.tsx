import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Photo } from "../../domain/catalog";
import type { Language } from "../../lib/preferences";

export function VehiclePhoto({
  photo,
  compact = false,
  language = "ru",
  onOpen,
}: {
  photo?: Photo;
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
        <strong>
          {isEnglish ? "Photo coming soon" : "Фото скоро появится"}
        </strong>
      </div>
    );
  return (
    <figure className={"vehicle-photo " + (compact ? "compact" : "")}>
      {onOpen ? (
        <button
          className="photo-open"
          onClick={onOpen}
          aria-label={(isEnglish ? "Enlarge " : "Увеличить ") + photo.subject}
        >
          <img
            src={import.meta.env.BASE_URL + photo.url}
            alt={photo.subject}
            loading="lazy"
            onError={() => setFailed(photo.url)}
          />
        </button>
      ) : (
        <img
          src={import.meta.env.BASE_URL + photo.url}
          alt={photo.subject}
          loading="lazy"
          onError={() => setFailed(photo.url)}
        />
      )}
      <figcaption>
        {compact ? (
          <span>{photo.subject}</span>
        ) : (
          <>
            <strong>{photo.subject}</strong>
            <details className="photo-credits">
              <summary>
                {isEnglish ? "About this image" : "Об изображении"}
              </summary>
              <span>
                <a href={photo.page} target="_blank" rel="noreferrer">
                  {photo.author}
                </a>{" "}
                ·{" "}
                <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                  {photo.license}
                </a>
              </span>
              {photo.note && <small className="photo-note">{photo.note}</small>}
            </details>
          </>
        )}
      </figcaption>
    </figure>
  );
}
