// Generates characterisation fixtures from the legacy single-file sunset page
// (task 0003). It runs the math part of the original inline script from git
// commit e93f17e (`decl`, `geom`, `sunVec`, the vector helpers and `dateFor`)
// in a Node `vm` sandbox and records their output. The migrated TypeScript
// must reproduce these numbers (see src/lib/astro/sunsetLegacy.test.ts).
//
// Usage: TZ=Europe/Berlin node scripts/legacy-sunset-fixtures.mjs
// Output: tests/fixtures/sunset-legacy.json (run `npm run format` afterwards).
// Kept for provenance; it does not need to run again.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import vm from "node:vm";

const LEGACY_COMMIT = "e93f17e";

if (Intl.DateTimeFormat().resolvedOptions().timeZone !== "Europe/Berlin") {
  throw new Error("Run with TZ=Europe/Berlin");
}

const html = execFileSync("git", ["show", `${LEGACY_COMMIT}:sunset.html`], { encoding: "utf8" });
/** Source text between two markers of the legacy script (start inclusive). */
function slice(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`markers not found: ${startMarker}`);
  return html.slice(start, end);
}
const code = [
  slice("const D2R=", "const C={"),
  slice("/* ---------------- Mathematik", "/* ---------------- Canvas-Helfer"),
  slice("const MON=", "/* ================= Anzeigen"),
  "globalThis.__legacy={decl,geom,sunVec,dot,cross,norm,dateFor};",
].join("\n");

const sandbox = { Math, Date };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const L = sandbox.__legacy;

const r9 = (v) => Math.round(v * 1e9) / 1e9;
const vec = (v) => v.map(r9);

const eclLons = [];
for (let lam = 0; lam < 360; lam += 7.5) eclLons.push(lam);
eclLons.push(0.3, 89.9, 271.2, 359.9);

const declination = eclLons.map((eclLonDeg) => ({ eclLonDeg, declDeg: r9(L.decl(eclLonDeg)) }));

const lats = [0, 10, 23.5, 40.7, 50.9, 51, 59.3, 65.5, 66, 66.5, 69.7, 70, 72];
const decls = [
  0,
  0.5,
  -0.5,
  5,
  -5,
  12,
  -12,
  20,
  -20,
  19.99,
  23.4392811,
  -23.4392811,
  L.decl(90),
  L.decl(45),
];
const geometry = [];
for (const latDeg of lats) {
  for (const declDeg of decls) {
    const g = L.geom(latDeg, declDeg);
    const out = { latDeg, declDeg, state: g.state };
    if (g.state === "ok") {
      for (const k of ["A", "azSet", "rate", "gamma", "dur", "H0"]) out[k] = r9(g[k]);
    }
    geometry.push(out);
  }
}

const sunVector = [];
for (const [latDeg, declDeg] of [
  [51, 0],
  [51, 23.44],
  [0, -23.44],
  [69.7, 12],
  [-33.9, 5],
]) {
  for (const hourAngleDeg of [0, 40, 90, 135, 180, 270, 359]) {
    sunVector.push({
      latDeg,
      declDeg,
      hourAngleDeg,
      v: vec(L.sunVec(latDeg, declDeg, hourAngleDeg)),
    });
  }
}

const vectors = [
  [
    [1, 2, 3],
    [4, -5, 6],
  ],
  [
    [0.3, -0.7, 0.1],
    [0, 0, 1],
  ],
  [
    [0, 0, 0],
    [1, 0, 0],
  ],
].map(([a, b]) => ({
  a,
  b,
  dot: r9(L.dot(a, b)),
  cross: vec(L.cross(a, b)),
  norm: vec(L.norm(a)),
}));

const orbitDate = [];
for (let lam = 0; lam < 360; lam += 5) orbitDate.push({ eclLonDeg: lam, label: L.dateFor(lam) });

const out = {
  source: `sunset.html @ ${LEGACY_COMMIT}`,
  declination,
  geometry,
  sunVector,
  vectors,
  orbitDate,
};
writeFileSync("tests/fixtures/sunset-legacy.json", JSON.stringify(out, null, 2) + "\n");
console.log("geometry", geometry.length, "states", [...new Set(geometry.map((g) => g.state))]);
