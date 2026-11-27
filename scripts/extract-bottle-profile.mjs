import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ROOT, SET_ORDER, bottleFile } from "./asset-map.mjs";
import { analyzeBottle } from "./bottle-analysis.mjs";

const SAMPLES = 160;
const round = (v) => Math.round(v * 10000) / 10000;

function radiusAt(a, t) {
  const y = Math.round(t * (a.height - 1));
  let sum = 0,
    n = 0;
  for (let k = -4; k <= 4; k++) {
    const row = a.rows[Math.min(a.height - 1, Math.max(0, y + k))];
    sum += row.r;
    n++;
  }
  return sum / n / a.height;
}

const analyses = [];
for (const slug of SET_ORDER) {
  const a = await analyzeBottle(bottleFile(slug));
  analyses.push(a);
  console.log(
    `${slug.padEnd(13)} ${a.width}x${a.height}  cap→${(a.capBottom / a.height).toFixed(3)}  label ${(a.labelTop / a.height).toFixed(3)}–${(a.labelBottom / a.height).toFixed(3)}`,
  );
}

const avg = (fn) => analyses.reduce((s, a) => s + fn(a), 0) / analyses.length;
const capSplit = avg((a) => a.capBottom / a.height); // from top

const points = [];
for (let i = 0; i <= SAMPLES; i++) {
  const t = i / SAMPLES; // 0 top … 1 bottom
  points.push({ y: 1 - t, r: avg((a) => radiusAt(a, t)) });
}

const toPairs = (list) => list.map((p) => [round(p.r), round(p.y)]).reverse(); // bottom → top
const capY = 1 - capSplit;

const profile = {
  source: "Averaged silhouette of the 7 bottle PNGs (scripts/extract-bottle-profile.mjs)",
  aspect: round(avg((a) => a.width / a.height)),
  capBottom: round(capY),
  body: toPairs(points.filter((p) => p.y <= capY)),
  cap: toPairs(points.filter((p) => p.y >= capY)),
};

const dest = path.join(ROOT, "src", "webgl", "bottle-profile.json");
mkdirSync(path.dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(profile) + "\n");
console.log(
  `\nbody ${profile.body.length} pts, cap ${profile.cap.length} pts → ${path.relative(ROOT, dest)}`,
);
