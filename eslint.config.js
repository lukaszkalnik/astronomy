// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "coverage/", "playwright-report/", "test-results/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js", "vite.config.ts", "vitest.config.ts"],
          defaultProject: "tsconfig.node.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Security rules (CLAUDE.md "Security & privacy"): no HTML-string sinks,
    // no code from strings. A constant-only template may disable the rule on
    // one line with a comment explaining why it is safe.
    rules: {
      "no-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "AssignmentExpression > MemberExpression.left[property.name=/^(innerHTML|outerHTML)$/]",
          message:
            "Do not assign HTML strings; use textContent/setAttribute or the builders in src/i18n/dom.ts.",
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message:
            "Do not insert HTML strings; use textContent/setAttribute or the builders in src/i18n/dom.ts.",
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
          message: "Do not use document.write; build DOM nodes instead.",
        },
      ],
    },
  },
  {
    files: ["*.config.{js,ts}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // One-off Node scripts (e.g. fixture generators): not part of a TS project,
    // so no type-aware rules.
    files: ["scripts/**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
