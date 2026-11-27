import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Public base path of the site. Local dev and preview use "/"; the GitHub Pages
 * deploy (.github/workflows/deploy.yml) builds with BASE_PATH=/astronomy/.
 */
const base = process.env["BASE_PATH"] ?? "/";

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        sonnenuntergang: resolve(root, "sonnenuntergang.html"),
        // Served by GitHub Pages for every missing path.
        notFound: resolve(root, "404.html"),
      },
    },
  },
});
