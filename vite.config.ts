import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  build: { target: "es2022" },
  plugins: [react(), tailwindcss()],
  base: process.env.GITHUB_PAGES === "true" ? "/bmw-atlas/" : "/",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
