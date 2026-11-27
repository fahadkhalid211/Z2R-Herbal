import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PUBLIC, ROOT, SET_ORDER, packagingFile, productAsset, setFile } from "./asset-map.mjs";

const OUT = path.join(PUBLIC, "images");

async function cutout(src, dest, width) {
  mkdirSync(path.dirname(dest), { recursive: true });
  const info = await sharp(src)
    .trim({ threshold: 10 })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90, effort: 6 })
    .toFile(dest);
  return info;
}

async function photo(src, dest, { width, quality = 80, extract } = {}) {
  mkdirSync(path.dirname(dest), { recursive: true });
  let img = sharp(src);
  if (extract) img = img.extract(extract);
  return img.resize({ width, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(dest);
}

function report(dest, info) {
  const kb = (info.size / 1024).toFixed(0).padStart(4);
  console.log(`${kb} KB  ${info.width}x${info.height}  ${path.relative(PUBLIC, dest)}`);
}

const jobs = [];

for (const slug of SET_ORDER) {
  const dir = path.join(OUT, "products", slug);
  for (const [file, kind, width] of [
    ["card.webp", "duo", 900],
    ["box.webp", "box", 640],
    ["bottle.webp", "bottle", 600],
  ]) {
    const dest = path.join(dir, file);
    jobs.push([dest, () => cutout(packagingFile(slug, kind), dest, width)]);
  }
}

async function cutWhiteSurround(src, dest, { quality, white = 240 }) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const isWhite = (i) => data[i] >= white && data[i + 1] >= white && data[i + 2] >= white;
  const cleared = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);
  while (stack.length) {
    const p = stack.pop();
    if (cleared[p] || !isWhite(p * 4)) continue;
    cleared[p] = 1;
    data[p * 4 + 3] = 0;
    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }
  for (let p = 0; p < width * height; p++) {
    if (cleared[p]) continue;
    const x = p % width;
    const nearCleared =
      (x > 0 && cleared[p - 1]) ||
      (x < width - 1 && cleared[p + 1]) ||
      cleared[p - width] ||
      cleared[p + width];
    if (!nearCleared) continue;
    const i = p * 4;
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const f = Math.min(1, Math.max(0.05, (255 - avg) / 205));
    for (let c = 0; c < 3; c++) data[i + c] = Math.min(255, Math.max(0, (data[i + c] - (1 - f) * 255) / f));
    data[i + 3] = Math.round(f * 255);
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  return sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality, alphaQuality: 90, effort: 6 })
    .toFile(dest);
}

const story = productAsset("girl background section image.png");
jobs.push([
  path.join(OUT, "story", "banner.webp"),
  () => cutWhiteSurround(story, path.join(OUT, "story", "banner.webp"), { quality: 78 }),
]);

const journal = {
  "choose-right-oil": "Woman_showcasing_healthy_hair_b8cf047b.jpg",
  "coconut-oil-benefits": "Coconut_oil_liquid_splash_69fb6113.jpg",
  "almond-oil-boost": "Almonds_and_argan_nuts_24456c1a.jpg",
};
for (const [slug, file] of Object.entries(journal)) {
  const dest = path.join(OUT, "journal", `${slug}.webp`);
  jobs.push([dest, () => photo(productAsset(file), dest, { width: 896, quality: 78 })]);
}

const portrait = path.join(OUT, "editorial", "long-hair.webp");
jobs.push([
  portrait,
  async () => {
    mkdirSync(path.dirname(portrait), { recursive: true });
    return sharp(productAsset("Woman_showing_long_black_hair_0ebb0ed7.jpg"))
      .linear([1.0, 0.985, 0.95], [2, 0, -2])
      .resize({ width: 896, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(portrait);
  },
]);

const INGREDIENT_CROPS = {
  coconut: {
    src: () => productAsset("Fresh_coconuts_isolated_on_white_445bcc0f.jpg"),
    left: 18,
    top: 200,
    size: 860,
  },
  almond: { src: () => productAsset("Almonds_and_argan_nuts_24456c1a.jpg"), left: 8, top: 120, size: 880 },
  "pumpkin-seed": { src: () => setFile("10_31", "pumpkin-seed"), left: 560, top: 950, size: 330 },
  olive: { src: () => setFile("10_31", "olive"), left: 640, top: 985, size: 300 },
  mustard: { src: () => setFile("10_31", "mustard"), left: 620, top: 990, size: 320 },
  sesame: { src: () => setFile("10_31", "sesame"), left: 600, top: 985, size: 320 },
};
for (const [slug, c] of Object.entries(INGREDIENT_CROPS)) {
  const dest = path.join(OUT, "ingredients", `${slug}.webp`);
  jobs.push([
    dest,
    () =>
      photo(c.src(), dest, {
        width: 480,
        quality: 82,
        extract: { left: c.left, top: c.top, width: c.size, height: c.size },
      }),
  ]);
}

let total = 0;
const manifest = {};
for (const [dest, run] of jobs) {
  const info = await run();
  total += info.size;
  manifest["/" + path.relative(PUBLIC, dest).replaceAll("\\", "/")] = {
    width: info.width,
    height: info.height,
  };
  report(dest, info);
}

const manifestDest = path.join(ROOT, "src", "services", "adapters", "mock", "data", "image-manifest.json");
mkdirSync(path.dirname(manifestDest), { recursive: true });
writeFileSync(manifestDest, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `\n${jobs.length} files, ${(total / 1024 / 1024).toFixed(2)} MB total → ${path.relative(ROOT, manifestDest)}`,
);
