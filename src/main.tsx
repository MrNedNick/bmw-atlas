import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
const root = document.getElementById("root")!;
import("./App")
  .then(({ default: App }) => {
    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  })
  .catch(() => {
    root.replaceChildren();
    const message = document.createElement("p");
    message.textContent =
      "Не удалось загрузить коллекцию / Unable to load the collection";
    const retry = document.createElement("button");
    retry.textContent = "Повторить / Try again";
    retry.onclick = () => location.reload();
    root.append(message, retry);
  });
