import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { inpaint } from "./inpaint.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets", "hero", "hero-reference.webp");
const OUT = path.join(ROOT, "public", "images", "hero");
const W = 1600;
const H = 900;

function roundRect(x0, y0, x1, y1, r) {
  return (x, y) => {
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    const cx = Math.min(Math.max(x, x0 + r), x1 - r);
    const cy = Math.min(Math.max(y, y0 + r), y1 - r);
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };
}

function polygon(points) {
  return (x, y) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i];
      const [xj, yj] = points[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
}

const SHAPES = {
  nav: [roundRect(96, 11, 1500, 89, 38), roundRect(96, 11, 345, 114, 30)],
  copy: [roundRect(140, 148, 656, 632, 12)],
  product: [
    polygon([
      [932, 189],
      [1044, 189],
      [1046, 262],
      [1055, 290],
      [1056, 632],
      [909, 632],
      [909, 290],
      [918, 262],
      [930, 262],
    ]),
    polygon([
      [1046, 150],
      [1246, 150],
      [1247, 633],
      [1046, 633],
    ]),
  ],
  ingredient: [
    polygon([
      [733, 575],
      [742, 528],
      [775, 500],
      [835, 492],
      [885, 508],
      [910, 545],
      [916, 585],
      [916, 662],
      [808, 662],
      [760, 648],
      [736, 618],
    ]),
  ],
  selector: [
    roundRect(184, 733, 1382, 860, 62),
    ...[290, 460, 618, 776, 936, 1094, 1252].map((x) => roundRect(x - 4, 716, x + 32, 742, 6)),
  ],
};

function buildMask(shapes) {
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (shapes.some((inside) => inside(x + 0.5, y + 0.5))) mask[y * W + x] = 1;
  const grown = mask.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < W && ny < H) grown[ny * W + nx] = 1;
        }
    }
  return grown;
}

function fillBehindProducts(img, hole) {
  const wall = img.slice();
  const fill = new Float32Array(W * H * 3);
  const cols = [];
  for (let x = 0; x < W; x++) {
    let y0 = -1;
    let y1 = -1;
    for (let y = 0; y < H; y++)
      if (hole[y * W + x]) {
        if (y0 < 0) y0 = y;
        y1 = y;
      }
    if (y0 < 8 || y1 > H - 8) continue;
    const avg = (from, to) => {
      const c = [0, 0, 0];
      for (let y = from; y <= to; y++) for (let k = 0; k < 3; k++) c[k] += img[(y * W + x) * 3 + k];
      return c.map((v) => v / (to - from + 1));
    };
    const top = avg(y0 - 8, y0 - 1);
    const bottom = avg(y1 + 1, Math.min(y1 + 4, H - 1));
    for (let y = y0; y <= y1; y++) {
      const t = Math.min(1, Math.max(0, (y - (y1 - 40)) / 40));
      for (let k = 0; k < 3; k++) fill[(y * W + x) * 3 + k] = top[k] * (1 - t) + bottom[k] * t;
    }
    cols.push(x);
  }
  for (let y = 0; y < H; y++)
    for (const x of cols) {
      const p = y * W + x;
      if (!hole[p]) continue;
      const c = [0, 0, 0];
      let n = 0;
      for (let dx = -18; dx <= 18; dx++) {
        const q = p + dx;
        if (x + dx < 0 || x + dx >= W || !hole[q]) continue;
        for (let k = 0; k < 3; k++) c[k] += fill[q * 3 + k];
        n++;
      }
      for (let k = 0; k < 3; k++) wall[p * 3 + k] = c[k] / n;
    }
  const membrane = img.slice();
  inpaint(membrane, hole, W, H);
  const FEATHER = 36;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (!hole[p]) continue;
      let d = 0;
      while (d < FEATHER && x - d - 1 >= 0 && x + d + 1 < W && hole[p - d - 1] && hole[p + d + 1]) d++;
      const t = d / FEATHER;
      const w = t * t * (3 - 2 * t);
      for (let k = 0; k < 3; k++) img[p * 3 + k] = membrane[p * 3 + k] * (1 - w) + wall[p * 3 + k] * w;
    }
}

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== W || info.height !== H)
  throw new Error(`Expected ${W}x${H}, got ${info.width}x${info.height}`);
const img = Float32Array.from(data);
fillBehindProducts(img, buildMask(SHAPES.product));
inpaint(img, buildMask([...SHAPES.nav, ...SHAPES.copy, ...SHAPES.selector, ...SHAPES.ingredient]), W, H);

function refillFoliage(img, hole) {
  const src = img.slice();
  const dist = new Float32Array(W * H).fill(Infinity);
  for (let p = 0; p < W * H; p++) if (!hole[p]) dist[p] = 0;
  for (let y = 1; y < H; y++)
    for (let x = 1; x < W; x++) {
      const p = y * W + x;
      dist[p] = Math.min(dist[p], dist[p - 1] + 1, dist[p - W] + 1, dist[p - W - 1] + 1.4);
    }
  for (let y = H - 2; y >= 0; y--)
    for (let x = W - 2; x >= 0; x--) {
      const p = y * W + x;
      dist[p] = Math.min(dist[p], dist[p + 1] + 1, dist[p + W] + 1, dist[p + W + 1] + 1.4);
    }
  const ease = (t) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
  };
  const STONE_TOP = 644;
  const SHADE_TOP = [40, 78, 28];
  const SHADE_BOTTOM = [18, 40, 15];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (!hole[p]) continue;
      const depth = ease((y - 492) / 140);
      const t = ease(dist[p] / 26) * (1 - ease((y - (STONE_TOP - 6)) / 8));
      for (let k = 0; k < 3; k++) {
        const shade = SHADE_TOP[k] * (1 - depth) + SHADE_BOTTOM[k] * depth;
        img[p * 3 + k] = img[p * 3 + k] * (1 - t) + shade * t;
      }
    }

  const isGold = (i) => src[i] > src[i + 1] + 8;
  const leafMask = ([x0, y0, x1, y1]) => {
    const w = x1 - x0;
    const h = y1 - y0;
    const leaf = new Uint8Array(w * h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sx = x + x0;
        const sy = y + y0;
        const i = (sy * W + sx) * 3;
        if (src[i + 1] > src[i] * 1.02 + 6 && src[i + 1] > src[i + 2] + 18) leaf[y * w + x] = 1;
      }
    const outside = new Uint8Array(w * h);
    const stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const p = stack.pop();
      if (outside[p] || leaf[p]) continue;
      outside[p] = 1;
      const x = p % w;
      if (x > 0) stack.push(p - 1);
      if (x < w - 1) stack.push(p + 1);
      if (p >= w) stack.push(p - w);
      if (p < w * (h - 1)) stack.push(p + w);
    }
    const label = new Int32Array(w * h).fill(-1);
    let best = -1;
    let bestSize = 0;
    let ids = 0;
    for (let p0 = 0; p0 < w * h; p0++) {
      if (outside[p0] || label[p0] >= 0) continue;
      const id = ids++;
      let n = 0;
      const queue = [p0];
      label[p0] = id;
      while (queue.length) {
        const p = queue.pop();
        n++;
        const x = p % w;
        for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
          if (q < 0 || q >= w * h || outside[q] || label[q] >= 0) continue;
          label[q] = id;
          queue.push(q);
        }
      }
      if (n > bestSize) [best, bestSize] = [id, n];
    }
    let alpha = Float32Array.from(label, (id) => (id === best ? 1 : 0));
    for (let pass = 0; pass < 2; pass++) {
      const next = new Float32Array(w * h);
      for (let y = 1; y < h - 1; y++)
        for (let x = 1; x < w - 1; x++) {
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) sum += alpha[(y + dy) * w + x + dx];
          next[y * w + x] = sum / 9;
        }
      alpha = next;
    }
    return { x0, y0, w, h, alpha };
  };

  const stamp = (mask, x, y, scale, shade = 1) => {
    const dw = Math.round(mask.w * scale);
    const dh = Math.round(mask.h * scale);
    for (let dy = 0; dy < dh; dy++)
      for (let dx = 0; dx < dw; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px < 0 || px >= 926 || py < 0 || py >= STONE_TOP + 6) continue;
        const u = Math.min(mask.w - 1.001, Math.max(0, mask.w - 1 - dx / scale));
        const v = Math.min(mask.h - 1.001, dy / scale);
        const ux = Math.floor(u);
        const vy = Math.floor(v);
        const fx = u - ux;
        const fy = v - vy;
        const at = (ix, iy) => iy * mask.w + ix;
        const tap = (arr, off, stride, base) =>
          arr[base(ux, vy) * stride + off] * (1 - fx) * (1 - fy) +
          arr[base(ux + 1, vy) * stride + off] * fx * (1 - fy) +
          arr[base(ux, vy + 1) * stride + off] * (1 - fx) * fy +
          arr[base(ux + 1, vy + 1) * stride + off] * fx * fy;
        const a = tap(mask.alpha, 0, 1, at);
        if (a <= 0.01) continue;
        const p = (py * W + px) * 3;
        const srcAt = (ix, iy) => {
          const q = (iy + mask.y0) * W + ix + mask.x0;
          return isGold(q * 3) ? q - 8 * W + 26 : q;
        };
        for (let k = 0; k < 3; k++) img[p + k] = img[p + k] * (1 - a) + tap(src, k, 3, srcAt) * shade * a;
      }
  };

  const large = leafMask([1288, 425, 1470, 548]);
  const small = leafMask([1318, 548, 1446, 606]);
  stamp(large, 806, 474, 0.8, 0.8); // behind, in shade
  stamp(small, 760, 600, 1.15, 0.7);
  stamp(large, 738, 498, 1); // front
  stamp(small, 702, 578, 1.1, 0.92); // low left, over the hole's edge
  stamp(small, 806, 596, 0.95, 0.86); // low right
}
refillFoliage(img, buildMask(SHAPES.ingredient));

mkdirSync(path.join(OUT, "props"), { recursive: true });
const plate = await sharp(Buffer.from(Uint8ClampedArray.from(img)), {
  raw: { width: W, height: H, channels: 3 },
})
  .webp({ quality: 86, effort: 6 })
  .toFile(path.join(OUT, "scene.webp"));
console.log(`hero/scene.webp ${plate.width}x${plate.height} ${(plate.size / 1024).toFixed(0)} KB`);

const PROPS = {
  coconut: { left: 491, top: 765, width: 49, height: 43 },
  almond: { left: 644, top: 770, width: 46, height: 39 },
  "pumpkin-seed": { left: 806, top: 772, width: 46, height: 37 },
  olive: { left: 963, top: 768, width: 47, height: 40 },
  mustard: { left: 1124, top: 768, width: 46, height: 40 },
  sesame: { left: 1281, top: 774, width: 43, height: 34 },
};

for (const [name, box] of Object.entries(PROPS)) {
  const { data: raw, info: pi } = await sharp(SRC)
    .extract(box)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = pi;
  const rgba = Buffer.alloc(w * h * 4);
  const dist = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const bg = (y * w + (w - 1)) * 3;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      dist[y * w + x] = Math.hypot(raw[i] - raw[bg], raw[i + 1] - raw[bg + 1], raw[i + 2] - raw[bg + 2]);
      for (let c = 0; c < 3; c++) rgba[(y * w + x) * 4 + c] = raw[i + c];
      rgba[(y * w + x) * 4 + 3] = 255;
    }
  }
  const LIMIT = 24;
  const cleared = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (cleared[p] || dist[p] > LIMIT) continue;
    cleared[p] = 1;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < w * (h - 1)) stack.push(p + w);
  }
  for (let p = 0; p < w * h; p++) {
    if (cleared[p]) rgba[p * 4 + 3] = 0;
    else {
      const x = p % w;
      const edge =
        (x > 0 && cleared[p - 1]) || (x < w - 1 && cleared[p + 1]) || cleared[p - w] || cleared[p + w];
      if (edge) rgba[p * 4 + 3] = Math.round(255 * Math.min(1, dist[p] / (LIMIT * 2)));
    }
  }
  const prop = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .resize({ width: w * 3, kernel: "lanczos3" })
    .sharpen({ sigma: 0.8 })
    .webp({ quality: 90, alphaQuality: 95 })
    .toFile(path.join(OUT, "props", `${name}.webp`));
  console.log(`hero/props/${name}.webp ${prop.width}x${prop.height}`);
}
