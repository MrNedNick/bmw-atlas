import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { loadFamily } from "../data/browser-catalog";
import type { ModelFamily } from "../domain/catalog";
import type { FamilyDetail as Detail } from "./FamilyDetail";
const importDetail = () =>
  import("./FamilyDetail").then((module) => ({ default: module.FamilyDetail }));
const directDetail =
  import.meta.env.MODE !== "test" &&
  new URLSearchParams(location.search).has("model")
    ? importDetail()
    : null;
const FamilyDetail = lazy(() => directDetail ?? importDetail());
export function LoadedFamilyDetail(props: ComponentProps<typeof Detail>) {
  const [family, setFamily] = useState<ModelFamily | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFamily(null);
    setError(false);
    loadFamily(props.family.id)
      .then((value) => {
        if (active) setFamily(value);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [props.family.id, attempt]);
  const english = props.language === "en";
  if (error)
    return (
      <section role="alert">
        <p>
          {english
            ? "The model history could not be loaded."
            : "Не удалось загрузить историю модели."}
        </p>
        <button onClick={() => setAttempt(attempt + 1)}>
          {english ? "Try again" : "Повторить"}
        </button>
        <button onClick={props.onBack}>
          {english ? "Back to collection" : "К коллекции"}
        </button>
      </section>
    );
  const loading = (
    <p role="status">
      {english ? "Loading model history…" : "Загрузка истории модели…"}
    </p>
  );
  if (!family || family.id !== props.family.id) return loading;
  const generation = family.generations.find(
    (item) => item.id === props.generation.id,
  )!;
  return (
    <Suspense fallback={loading}>
      <FamilyDetail {...props} family={family} generation={generation} />
    </Suspense>
  );
}
