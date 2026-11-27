import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Public base path of the site. Local dev and preview use "/"; the GitHub Pages
 * deploy (.github/workflows/deploy.yml) builds with BASE_PATH=/astronomy/.
 */
const base = process.env["BASE_PATH"] ?? "/";

/**
 * The pages carry a strict CSP `<meta>` (no inline scripts or styles). The dev
 * server injects imported CSS as `<style>` elements for hot reload, so in dev
 * only, `style-src` also allows inline styles. Production builds keep the
 * policy exactly as written in the HTML.
 */
function relaxCspInDev(): Plugin {
  return {
    name: "relax-csp-in-dev",
    apply: "serve",
    transformIndexHtml(html) {
      return html.replace("style-src 'self'", "style-src 'self' 'unsafe-inline'");
    },
  };
}

export default defineConfig({
  base,
  plugins: [relaxCspInDev()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        sunset: resolve(root, "sunset.html"),
        // Served by GitHub Pages for every missing path.
        notFound: resolve(root, "404.html"),
      },
    },
  },
});
