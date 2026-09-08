import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Photo } from "../domain/catalog";

export function VehiclePhoto({
  photo,
  compact = false,
}: {
  photo?: Photo;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState("");
  if (!photo || failed === photo.url)
    return (
      <div className="photo-missing">
        <ImageOff size={30} />
        <strong>Фото этого поколения ещё не добавлено</strong>
        <span>Снимок другой версии здесь не используется.</span>
      </div>
    );
  return (
    <figure className={"vehicle-photo " + (compact ? "compact" : "")}>
      <img
        src={import.meta.env.BASE_URL + photo.url}
        alt={photo.subject}
        loading="lazy"
        onError={() => setFailed(photo.url)}
      />
      <figcaption>
        {compact ? (
          <span>{photo.subject}</span>
        ) : (
          <>
            <strong>{photo.subject}</strong>
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
          </>
        )}
      </figcaption>
    </figure>
  );
}
