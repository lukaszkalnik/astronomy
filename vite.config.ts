import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Public base path of the site. Local dev and preview use "/"; the GitHub Pages
 * build sets BASE_PATH=/astronomy/ (wired up in task 0006).
 */
const base = process.env["BASE_PATH"] ?? "/";

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        sonnenuntergang: resolve(root, "sonnenuntergang.html"),
      },
    },
  },
});
