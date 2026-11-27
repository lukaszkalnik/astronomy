import { defineConfig } from "vitest/config";

// Tests must never depend on the machine's timezone (see CLAUDE.md "Testing").
process.env["TZ"] = "Europe/Berlin";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: { TZ: "Europe/Berlin" },
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts"],
      thresholds: {
        "src/lib/**": { lines: 90 },
      },
    },
  },
});
