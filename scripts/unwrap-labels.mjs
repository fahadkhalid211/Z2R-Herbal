import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PUBLIC, ROOT, SET_ORDER, bottleFile } from "./asset-map.mjs";
import { analyzeBottle } from "./bottle-analysis.mjs";

const THETA_MAX_DEG = 70;
const OUT_WIDTH = 640;
const INSET_TOP = 4;
const INSET_BOTTOM = 16;

function sample(a, x, y, out, o) {
  const x0 = Math.floor(x),
    x1 = Math.min(a.width - 1, x0 + 1),
    fx = x - x0;
  const row = y * a.width;
  for (let c = 0; c < 4; c++) {
    out[o + c] = a.data[(row + x0) * 4 + c] * (1 - fx) + a.data[(row + x1) * 4 + c] * fx;
  }
}

const theta = (THETA_MAX_DEG * Math.PI) / 180;
const bands = { thetaMaxDeg: THETA_MAX_DEG, products: {} };
const outDir = path.join(PUBLIC, "textures", "labels");
mkdirSync(outDir, { recursive: true });

for (const slug of SET_ORDER) {
  const a = await analyzeBottle(bottleFile(slug));
  const top = a.labelTop + INSET_TOP,
    bottom = a.labelBottom - INSET_BOTTOM;
  const bandRows = bottom - top + 1;
  const meanR = a.rows.slice(top, bottom + 1).reduce((s, r) => s + r.r, 0) / bandRows;

  const outHeight = Math.round((OUT_WIDTH * bandRows) / (meanR * 2 * theta));
  const px = Buffer.alloc(OUT_WIDTH * outHeight * 4);

  for (let v = 0; v < outHeight; v++) {
    const y = Math.min(bottom, Math.round(top + (v / (outHeight - 1)) * (bandRows - 1)));
    const { cx, r } = a.rows[y];
    for (let u = 0; u < OUT_WIDTH; u++) {
      const t = -theta + (u / (OUT_WIDTH - 1)) * 2 * theta;
      const x = Math.min(a.width - 1.001, Math.max(0, cx + r * Math.sin(t)));
      sample(a, x, y, px, (v * OUT_WIDTH + u) * 4);
    }
  }

  const dest = path.join(outDir, `${slug}.webp`);
  const info = await sharp(px, { raw: { width: OUT_WIDTH, height: outHeight, channels: 4 } })
    .removeAlpha()
    .webp({ quality: 88, effort: 6 })
    .toFile(dest);
  bands.products[slug] = {
    top: Math.round((1 - top / a.height) * 10000) / 10000,
    bottom: Math.round((1 - bottom / a.height) * 10000) / 10000,
    texture: `/textures/labels/${slug}.webp`,
  };
  console.log(`${slug.padEnd(13)} ${OUT_WIDTH}x${outHeight}  ${(info.size / 1024).toFixed(0)} KB`);
}

const bandsDest = path.join(ROOT, "src", "webgl", "label-bands.json");
writeFileSync(bandsDest, JSON.stringify(bands, null, 2) + "\n");
console.log(`→ ${path.relative(ROOT, bandsDest)}`);
