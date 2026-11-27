import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PRODUCTS = path.join(ROOT, "public", "images", "products");
const MANIFEST = path.join(ROOT, "src", "services", "adapters", "mock", "data", "image-manifest.json");
const SLUGS = ["coconut", "almond", "pumpkin-seed", "signature", "olive", "mustard", "sesame"];

const HIGHLIGHT = [255, 236, 196]; // the gold glow behind the products
const SHADE = [92, 66, 34]; // warm brown of the stone shadows
const SOFT_LIGHT = 0.55;
const RIM = [255, 222, 150];
const RIM_PX = 7;

const softLight = (a, b) => {
  if (b < 0.5) return a - (1 - 2 * b) * a * (1 - a);
  const d = a <= 0.25 ? ((16 * a - 12) * a + 4) * a : Math.sqrt(a);
  return a + (2 * b - 1) * (d - a);
};

async function grade(src, dest, height) {
  const { data, info } = await sharp(src)
    .resize({ height, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const rimDist = new Float32Array(w * h).fill(RIM_PX);
  for (let y = 0; y < h; y++) {
    let d = RIM_PX;
    for (let x = w - 1; x >= 0; x--) {
      const solid = data[(y * w + x) * 4 + 3] > 128;
      d = solid ? Math.min(RIM_PX, d + 1) : 0;
      rimDist[y * w + x] = d;
    }
  }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] === 0) continue;
      const t = Math.min(1, Math.max(0, 0.55 * (x / w) + 0.45 * (1 - y / h)));
      const rim = Math.max(0, 1 - rimDist[y * w + x] / RIM_PX) * 0.38;
      const wb = [0.975, 0.945, 0.865]; // warm and ~5% darker, like the shaded design
      for (let c = 0; c < 3; c++) {
        let a = Math.min(1, (data[i + c] / 255) * wb[c]);
        const b = (SHADE[c] + (HIGHLIGHT[c] - SHADE[c]) * t) / 255;
        a = a + (softLight(a, b) - a) * SOFT_LIGHT;
        a = a + (RIM[c] / 255 - a) * rim;
        data[i + c] = Math.round(Math.min(1, Math.max(0, a)) * 255);
      }
    }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toFile(dest);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
for (const slug of SLUGS) {
  for (const [kind, height] of [
    ["bottle", 1100],
    ["box", 1180],
  ]) {
    const dest = path.join(PRODUCTS, slug, `hero-${kind}.webp`);
    const info = await grade(path.join(PRODUCTS, slug, `${kind}.webp`), dest, height);
    manifest[`/images/products/${slug}/hero-${kind}.webp`] = { width: info.width, height: info.height };
    console.log(
      `${slug.padEnd(13)} hero-${kind}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`,
    );
  }
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
