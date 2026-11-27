// Generates characterisation fixtures from the legacy single-file moon path page (Mondbahn)
// (task 0002). It runs the original inline script from git commit 640ff7f in a
// Node `vm` sandbox with a minimal fake DOM and records the output of `pos()`,
// `findPhase()`, `yearData()`, the 18.6-year cycle data and `phasePath()`.
// The migrated TypeScript must reproduce these numbers (see *.legacy.test.ts).
//
// Usage: TZ=Europe/Berlin node scripts/legacy-moon-path-fixtures.mjs
// Output: tests/fixtures/moon-path-legacy.json (run `npm run format` afterwards).
// Kept for provenance; it does not need to run again.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import vm from "node:vm";

const LEGACY_COMMIT = "640ff7f";

if (Intl.DateTimeFormat().resolvedOptions().timeZone !== "Europe/Berlin") {
  throw new Error("Run with TZ=Europe/Berlin");
}

const html = execFileSync("git", ["show", `${LEGACY_COMMIT}:index.html`], { encoding: "utf8" });
const start = html.indexOf("<script>") + "<script>".length;
const end = html.indexOf("</script>", start);
let code = html.slice(start, end).trim();
// The script is one block `{ … }`; expose its internals before the block closes.
code = `${code.slice(0, -1)}\nglobalThis.__legacy={pos,findPhase,yearData,phasePath,cyc,st};\n}`;

const fakeEl = () => ({
  clientWidth: 0,
  clientHeight: 0,
  value: "",
  textContent: "",
  innerHTML: "",
  getBoundingClientRect: () => ({ left: 0, top: 0 }),
});
const els = new Map();
const sandbox = {
  Math,
  Date,
  JSON,
  String,
  Number,
  Array,
  isFinite,
  parseInt,
  document: {
    getElementById: (id) => {
      if (!els.has(id)) els.set(id, fakeEl());
      return els.get(id);
    },
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  ResizeObserver: class {
    observe() {}
  },
  setInterval,
  clearInterval,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const L = sandbox.__legacy;

const r6 = (v) => Math.round(v * 1e6) / 1e6;
const body = (b) => ({ altDeg: r6(b.alt), azDeg: r6(b.az), decDeg: r6(b.dec) });

const places = {
  cologne: [50.94, 6.96],
  northCape: [71.17, 25.78],
  quito: [-0.18, -78.47],
  sydney: [-33.87, 151.21],
};
const times = [
  "2026-11-27T19:00:00Z",
  "2026-12-24T03:30:00Z",
  "2026-06-21T10:00:00Z",
  "2025-03-14T06:58:00Z",
  "2000-01-01T12:00:00Z",
  "2034-09-01T22:15:00Z",
].map((s) => Date.parse(s));

const pos = [];
for (const tMs of times) {
  for (const [place, [latDeg, lonDeg]] of Object.entries(places)) {
    const p = L.pos(tMs, latDeg, lonDeg);
    pos.push({
      tMs,
      place,
      latDeg,
      lonDeg,
      sun: body(p.sun),
      moon: body(p.moon),
      k: r6(p.k),
      waxing: p.waxing,
    });
  }
}

const findPhase = [];
for (const tMs of times) {
  for (const [targetDeg, dir] of [
    [180, 1],
    [180, -1],
    [0, 1],
    [90, 1],
    [270, -1],
  ]) {
    findPhase.push({ tMs, targetDeg, dir, resultMs: Math.round(L.findPhase(tMs, targetDeg, dir)) });
  }
}

const yearData = [];
for (const [tIso, place] of [
  ["2026-11-27T19:00:00Z", "cologne"],
  ["2024-06-21T10:00:00Z", "northCape"],
  ["2025-01-01T00:30:00Z", "sydney"],
]) {
  const [latDeg, lonDeg] = places[place];
  L.st.t = Date.parse(tIso);
  L.st.lat = latDeg;
  L.st.lon = lonDeg;
  const yd = L.yearData();
  yearData.push({
    tMs: L.st.t,
    place,
    latDeg,
    lonDeg,
    year: yd.Y,
    yearStartMs: yd.j1,
    dayCount: yd.days.length,
    // Every 5th day keeps the fixture small but covers the whole year.
    days: yd.days
      .map((d, i) => ({ i, moonMaxAltDeg: r6(d.m), k: r6(d.k), sunNoonAltDeg: r6(d.s) }))
      .filter((d) => d.i % 5 === 0 || d.i === yd.days.length - 1),
    fullMoons: yd.full.map((f) => ({
      dayOffset: r6(f.d),
      maxAltDeg: r6(f.a),
      tMs: Math.round(f.t),
    })),
  });
}

const cycle = {
  count: L.cyc.length,
  samples: L.cyc
    .map((c, i) => ({ i, tMs: c.t, hiDecDeg: r6(c.hi), loDecDeg: r6(c.lo) }))
    .filter((c) => c.i % 7 === 0 || c.i === L.cyc.length - 1),
};

const phasePath = [];
for (const latDeg of [50.94, -33.87]) {
  L.st.lat = latDeg;
  for (const [k, waxing] of [
    [0.1, true],
    [0.5, false],
    [0.8, true],
    [0.99, false],
  ]) {
    phasePath.push({ latDeg, k, waxing, d: L.phasePath(38, 38, 32, k, waxing) });
  }
}

const out = { source: `index.html @ ${LEGACY_COMMIT}`, pos, findPhase, yearData, cycle, phasePath };
writeFileSync("tests/fixtures/moon-path-legacy.json", JSON.stringify(out, null, 2) + "\n");
console.log("pos", pos.length, "findPhase", findPhase.length, "yearData", yearData.length);
