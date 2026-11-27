import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { inpaint } from "./inpaint.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const STAGE = path.join(ROOT, "assets", "products", "hero background image.png");
const OUT = path.join(ROOT, "public", "images", "intro");

mkdirSync(OUT, { recursive: true });

const CORNERS = {
  "leaves-top-left": { left: 0, top: 0, width: 300, height: 215 },
  "leaves-top-right": { left: 1588, top: 0, width: 250, height: 232 },
};
for (const [name, box] of Object.entries(CORNERS)) {
  const info = await sharp(STAGE)
    .extract(box)
    .webp({ quality: 82 })
    .toFile(path.join(OUT, `${name}.webp`));
  console.log(`intro/${name}.webp ${info.width}x${info.height}`);
}

const box = { left: 722, top: 352, width: 470, height: 372 };
const { data: raw, info: ci } = await sharp(STAGE)
  .extract(box)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const cluster = Float32Array.from(raw);
const ring = new Uint8Array(ci.width * ci.height);
for (let y = 0; y < 270; y++)
  for (let x = 190; x < 262; x++) {
    const i = (y * ci.width + x) * 3;
    const [r, g, b] = [raw[i], raw[i + 1], raw[i + 2]];
    if (r > 58 && r > g - 3 && b < r * 0.85)
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < ci.width && ny < ci.height) ring[ny * ci.width + nx] = 1;
        }
  }
inpaint(cluster, ring, ci.width, ci.height);
const info = await sharp(Buffer.from(Uint8ClampedArray.from(cluster)), {
  raw: { width: ci.width, height: ci.height, channels: 3 },
})
  .webp({ quality: 84 })
  .toFile(path.join(OUT, "cluster.webp"));
console.log(`intro/cluster.webp ${info.width}x${info.height}`);
