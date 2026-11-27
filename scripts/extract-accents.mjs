import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, SET_ORDER, bottleFile } from "./asset-map.mjs";
import { analyzeBottle } from "./bottle-analysis.mjs";

const hex = (rgb) => "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");

function dominant(a, y0, y1) {
  const buckets = new Map();
  for (let y = y0; y <= y1; y++) {
    const { cx, r } = a.rows[y];
    for (let x = Math.round(cx - r * 0.6); x <= Math.round(cx + r * 0.6); x++) {
      const i = (y * a.width + x) * 4;
      if (a.data[i + 3] < 200) continue;
      const rgb = [a.data[i], a.data[i + 1], a.data[i + 2]];
      if (Math.max(...rgb) < 90) continue; // skip dark text/artwork
      const key = rgb.map((c) => c >> 4).join(",");
      const b = buckets.get(key) ?? { n: 0, sum: [0, 0, 0] };
      b.n++;
      for (let c = 0; c < 3; c++) b.sum[c] += rgb[c];
      buckets.set(key, b);
    }
  }
  const best = [...buckets.values()].sort((p, q) => q.n - p.n)[0];
  return best.sum.map((s) => s / best.n);
}

function shoulderOil(a) {
  const y0 = a.capBottom + Math.round((a.labelTop - a.capBottom) * 0.55);
  const y1 = a.labelTop - 6;
  const sum = [0, 0, 0];
  let n = 0;
  for (let y = y0; y <= y1; y++) {
    const m = a.means[y];
    for (let c = 0; c < 3; c++) sum[c] += m[c];
    n++;
  }
  return sum.map((s) => s / n);
}

const colors = {};
for (const slug of SET_ORDER) {
  const a = await analyzeBottle(bottleFile(slug));
  const span = a.labelBottom - a.labelTop;
  const accent = dominant(a, a.labelTop + Math.round(span * 0.05), a.labelTop + Math.round(span * 0.95));
  colors[slug] = { accent: hex(accent), oil: hex(shoulderOil(a)) };
  console.log(`${slug.padEnd(13)} accent ${colors[slug].accent}  oil ${colors[slug].oil}`);
}

const dest = path.join(ROOT, "src", "services", "adapters", "mock", "data", "product-colors.json");
mkdirSync(path.dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(colors, null, 2) + "\n");
console.log(`→ ${path.relative(ROOT, dest)}`);
