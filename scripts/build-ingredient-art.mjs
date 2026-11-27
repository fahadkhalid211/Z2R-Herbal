import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets", "products");
const OUT_PROPS = path.join(ROOT, "public", "images", "hero", "ingredients");
const OUT_HERBS = path.join(ROOT, "public", "images", "herbs");
const lifestyle = (n, time) => `ChatGPT Image Nov 3, 2026, ${time} PM-${n}.png`;
const byPrefix = (prefix) => {
  const file = readdirSync(SRC).find((f) => f.startsWith(prefix));
  if (!file) throw new Error(`No file in assets/products starts with ${prefix}`);
  return file;
};

const PROPS = {
  coconut: {
    keep: [
      [760, 1190],
      [720, 1050],
      [440, 1186],
      [430, 1158],
      [930, 1186],
      [520, 1100],
      [640, 1180],
    ],
    file: lifestyle(1, "10_31_46"),
    crop: [370, 915, 1005, 1218],
    bg: [
      [880, 900, 1100, 1000],
      [850, 1222, 1100, 1300],
      [380, 1222, 700, 1300],
    ],
    zones: [
      {
        rect: [300, 820, 882, 1146],
        samples: [
          [300, 820, 570, 1070],
          [570, 820, 660, 960],
          [300, 1080, 470, 1140],
        ],
      },
    ],
  },
  almond: {
    opts: { neutral: 50, floorRows: 40 },
    clip: [
      [588, 1020, 690, 1104],
      [690, 1020, 725, 1075],
      [862, 1020, 882, 1066],
    ],
    keep: [
      [520, 1140],
      [640, 1150],
      [810, 1120],
      [880, 1080],
      [540, 1060],
    ],
    file: lifestyle(2, "10_31_48"),
    crop: [410, 1020, 945, 1198],
    bg: [
      [900, 1000, 1050, 1100],
      [420, 1205, 1100, 1300],
    ],
    zones: [
      {
        rect: [300, 960, 872, 1140],
        samples: [
          [300, 960, 560, 1028],
          [300, 1060, 410, 1130],
          [790, 960, 862, 1000],
        ],
      },
    ],
  },
  "pumpkin-seed": {
    opts: { floorRows: 30 },
    keep: [
      [750, 1100],
      [640, 1080],
      [450, 1180],
      [560, 1190],
      [690, 1180],
      [480, 1150],
      [580, 1150],
    ],
    file: lifestyle(3, "10_31_49"),
    crop: [370, 945, 905, 1215],
    bg: [
      [910, 900, 1050, 1100],
      [420, 1222, 1050, 1260],
      [300, 1150, 370, 1260],
    ],
    zones: [
      {
        rect: [300, 820, 887, 1146],
        samples: [
          [300, 820, 600, 990],
          [700, 820, 880, 950],
          [300, 1100, 470, 1140],
        ],
      },
    ],
  },
  olive: {
    clip: [
      [445, 1035, 500, 1176],
      [498, 1142, 524, 1174],
      [856, 1048, 894, 1084],
    ],
    opts: { neutral: 50, zoneTol: 12, localTol: 6, floorRows: 40 },
    keep: [
      [640, 1160],
      [740, 1080],
      [830, 1175],
      [560, 1190],
      [920, 1110],
      [860, 1070],
      [650, 1060],
    ],
    file: lifestyle(5, "10_31_53"),
    crop: [445, 1018, 980, 1216],
    shapes: [
      [755, 1072, 68, 50],
      [615, 1108, 44, 44],
      [665, 1148, 84, 66],
      [736, 1097, 19, 17],
      [820, 1150, 79, 65],
    ],
    bg: [
      [910, 950, 1050, 1100],
      [700, 1225, 1050, 1290],
    ],
    zones: [
      {
        rect: [445, 950, 906, 1166],
        samples: [
          [300, 950, 580, 1040],
          [600, 960, 780, 1030],
        ],
      },
    ],
  },
  mustard: {
    opts: { neutral: 50, zoneTol: 60, localTol: 2, floorRows: 40 },
    clip: [
      [370, 1003, 500, 1088],
      [370, 1085, 440, 1124],
      [440, 1085, 470, 1108],
      [496, 1078, 534, 1104],
      [520, 1003, 540, 1046],
      [602, 1003, 612, 1036],
      [892, 980, 904, 1048],
      [905, 1088, 950, 1114],
      [480, 980, 535, 1050],
      [812, 950, 872, 1004],
      [870, 996, 882, 1064],
      [600, 950, 760, 986],
    ],
    keep: [
      [640, 1060],
      [720, 1030],
      [810, 1080],
      [740, 1130],
      [480, 1150],
      [530, 1130],
      [920, 1060],
      [860, 1140],
    ],
    file: lifestyle(6, "10_31_54"),
    crop: [370, 984, 950, 1182],
    shapes: [
      [640, 1026, 31, 26],
      [604, 1080, 37, 31],
      [690, 1072, 28, 30],
      [652, 1119, 34, 30],
      [650, 1075, 25, 25],
      [694, 1006, 21, 19],
      [730, 1025, 22, 23],
      [700, 1034, 24, 18],
      [780, 1019, 31, 31],
      [836, 1033, 32, 30],
      [762, 1065, 30, 33],
      [842, 1096, 32, 32],
      [805, 1062, 26, 26],
      [733, 1098, 29, 31],
      [790, 1100, 28, 30],
      [563, 1128, 30, 34],
    ],
    bg: [
      [910, 1000, 1050, 1050],
      [500, 1190, 1050, 1290],
    ],
    zones: [
      {
        rect: [300, 950, 906, 1126],
        samples: [
          [300, 1000, 520, 1035],
          [300, 1100, 420, 1120],
          [880, 1000, 900, 1040],
        ],
      },
    ],
  },
  sesame: {
    keep: [
      [700, 1080],
      [560, 1200],
      [450, 1180],
      [850, 1050],
      [780, 1150],
      [400, 1220],
      [650, 1230],
    ],
    file: lifestyle(7, "10_31_56"),
    crop: [330, 1008, 898, 1248],
    bg: [
      [940, 1000, 1010, 1150],
      [600, 1255, 1010, 1320],
      [250, 1200, 330, 1320],
    ],
    zones: [
      {
        rect: [250, 1000, 940, 1183],
        samples: [
          [250, 1000, 440, 1100],
          [470, 1000, 580, 1045],
          [870, 1000, 930, 1140],
          [250, 1110, 330, 1170],
        ],
      },
    ],
  },
};

const HERB_PHOTOS = {
  rosemary: byPrefix("Rosemary_sprigs"),
  neemBhringraj: byPrefix("Neem_leaves_and_Bhringraj"),
  amlaHibiscus: byPrefix("Amla_fruits_and_hibiscus"),
  seeds: byPrefix("Black_seeds_and_fenugreek"),
  shikakaiReetha: byPrefix("Shikakai_pods_and_reetha"),
  aloe: byPrefix("Aloe_vera_leaves"),
};

const HERBS = {
  rosemary: { photo: HERB_PHOTOS.rosemary, cut: [40, 140, 860, 1060], tile: [150, 250, 600] },
  neem: { photo: HERB_PHOTOS.neemBhringraj, cut: null, tile: [40, 330, 430] },
  bhringraj: { photo: HERB_PHOTOS.neemBhringraj, cut: null, tile: [450, 360, 400] },
  amla: { photo: HERB_PHOTOS.amlaHibiscus, cut: null, tile: [330, 420, 330] },
  hibiscus: { photo: HERB_PHOTOS.amlaHibiscus, cut: null, tile: [520, 150, 260] },
  "black-seed": { photo: HERB_PHOTOS.seeds, cut: null, tile: [80, 400, 380] },
  fenugreek: { photo: HERB_PHOTOS.seeds, cut: null, tile: [470, 360, 380] },
  shikakai: { photo: HERB_PHOTOS.shikakaiReetha, cut: null, tile: [330, 300, 320] },
  reetha: { photo: HERB_PHOTOS.shikakaiReetha, cut: null, tile: [120, 700, 300] },
  "aloe-vera": { photo: HERB_PHOTOS.aloe, cut: null, tile: [150, 350, 560] },
};

const pixels = async (file) => {
  const { data, info } = await sharp(path.join(SRC, file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

function palette(img, rects) {
  const buckets = new Map();
  for (const [x0, y0, x1, y1] of rects)
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const i = (y * img.w + x) * 3;
        const r = img.data[i];
        const g = img.data[i + 1];
        const b = img.data[i + 2];
        const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
        const s = buckets.get(key) ?? [0, 0, 0, 0];
        s[0] += r;
        s[1] += g;
        s[2] += b;
        s[3]++;
        buckets.set(key, s);
      }
  return [...buckets.values()].filter((s) => s[3] >= 3).map(([r, g, b, n]) => [r / n, g / n, b / n]);
}

function near(colors, r, g, b, tol) {
  const t2 = tol * tol;
  for (const c of colors) {
    const dr = c[0] - r;
    const dg = c[1] - g;
    const db = c[2] - b;
    if (dr * dr + dg * dg + db * db < t2) return true;
  }
  return false;
}

const inside = ([x0, y0, x1, y1], x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;

function cutOut(img, spec, defaults = {}) {
  const {
    bgTol = 16,
    zoneTol = 30,
    localTol = 14,
    minArea = 400,
    studio = false,
    neutral = 0,
    floorRows = 0,
  } = { ...defaults, ...spec.opts };
  const [cx0, cy0, cx1, cy1] = spec.crop;
  const w = cx1 - cx0;
  const h = cy1 - cy0;
  const bg = palette(img, spec.bg);
  const zones = spec.zones.map((z) => ({ rect: z.rect, colors: palette(img, z.samples) }));
  const removable = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const sx = x + cx0;
      const sy = y + cy0;
      const i = (sy * img.w + sx) * 3;
      const r = img.data[i];
      const g = img.data[i + 1];
      const b = img.data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let hit =
        near(bg, r, g, b, bgTol) ||
        (studio && max - min < 20 && max > 165) ||
        (max - min < neutral && max > 140);
      for (const z of zones)
        if (!hit && inside(z.rect, sx, sy) && near(z.colors, r, g, b, zoneTol)) hit = true;
      removable[y * w + x] = hit ? 1 : 0;
    }

  const at = (p) => (((p / w) | 0) + cy0) * img.w * 3 + ((p % w) + cx0) * 3;
  const step = (p, q) => {
    const a = at(p);
    const b = at(q);
    return Math.max(
      Math.abs(img.data[a] - img.data[b]),
      Math.abs(img.data[a + 1] - img.data[b + 1]),
      Math.abs(img.data[a + 2] - img.data[b + 2]),
    );
  };
  const cleared = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  for (const p of stack) if (removable[p]) cleared[p] = 1;
  while (stack.length) {
    const p = stack.pop();
    if (!cleared[p]) continue;
    const x = p % w;
    for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
      if (q < 0 || q >= w * h || cleared[q] || !removable[q] || step(p, q) > localTol) continue;
      cleared[q] = 1;
      stack.push(q);
    }
  }

  if (studio) for (let p = 0; p < w * h; p++) if (removable[p]) cleared[p] = 1;
  if (spec.shapes)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sx = x + cx0;
        const sy = y + cy0;
        const p = y * w + x;
        if (spec.shapes.some(([ex, ey, rx, ry]) => ((sx - ex) / rx) ** 2 + ((sy - ey) / ry) ** 2 <= 1)) {
          cleared[p] = 0;
        } else if (spec.zones.some((z) => inside(z.rect, sx, sy))) {
          const i = at(p);
          cleared[p] = img.data[i + 1] > img.data[i] + 4 && img.data[i + 1] > img.data[i + 2] + 20 ? 0 : 1;
        }
      }
  for (let y = h - floorRows; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = at(y * w + x);
      const spread =
        Math.max(img.data[i], img.data[i + 1], img.data[i + 2]) -
        Math.min(img.data[i], img.data[i + 1], img.data[i + 2]);
      const beige = img.data[i] >= img.data[i + 1] && img.data[i + 1] >= img.data[i + 2] && img.data[i] > 110;
      if ((spread < 60 && img.data[i] > 70) || (spread < 90 && beige)) cleared[y * w + x] = 1;
    }
  for (const [x0, y0, x1, y1] of spec.clip ?? [])
    for (let y = Math.max(y0, cy0); y < Math.min(y1, cy1); y++)
      for (let x = Math.max(x0, cx0); x < Math.min(x1, cx1); x++) cleared[(y - cy0) * w + x - cx0] = 1;

  const label = new Int32Array(w * h).fill(-1);
  const sizes = [];
  for (let p0 = 0; p0 < w * h; p0++) {
    if (cleared[p0] || label[p0] >= 0) continue;
    const id = sizes.length;
    let n = 0;
    const queue = [p0];
    label[p0] = id;
    while (queue.length) {
      const p = queue.pop();
      n++;
      const x = p % w;
      for (const nb of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (nb < 0 || nb >= w * h || cleared[nb] || label[nb] >= 0) continue;
        label[nb] = id;
        queue.push(nb);
      }
    }
    sizes.push(n);
  }

  const keepIds = new Set();
  if (spec.keep)
    for (const [kx, ky] of spec.keep) {
      const id = label[(ky - cy0) * w + (kx - cx0)];
      if (id >= 0) keepIds.add(id);
      else console.warn(`  seed ${kx},${ky} fell on removed backdrop`);
    }
  else sizes.forEach((n, id) => n >= minArea && keepIds.add(id));

  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const i = ((y + cy0) * img.w + x + cx0) * 3;
      for (let c = 0; c < 3; c++) rgba[p * 4 + c] = img.data[i + c];
      rgba[p * 4 + 3] = !cleared[p] && keepIds.has(label[p]) ? 255 : 0;
    }
  if (studio) {
    const solid = new Uint8Array(w * h);
    for (let p = 0; p < w * h; p++) solid[p] = rgba[p * 4 + 3] ? 1 : 0;
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        if (solid[p] && !(solid[p - 1] && solid[p + 1] && solid[p - w] && solid[p + w])) rgba[p * 4 + 3] = 0;
      }
  }
  const alpha = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) alpha[p] = rgba[p * 4 + 3];
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (!alpha[p]) continue;
      const open = [p - 1, p + 1, p - w, p + w].filter((n) => !alpha[n]).length;
      if (open) rgba[p * 4 + 3] = open >= 2 ? 120 : 190;
    }
  return { rgba, w, h };
}

const sizes = {};

async function writeCutout(name, { rgba, w, h }, maxWidth) {
  for (let y = 0; y < h; y++) {
    const ground = 1 - 0.14 * Math.max(0, (y / h - 0.55) / 0.45);
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      rgba[i] = Math.min(255, rgba[i] * 1.03 * ground);
      rgba[i + 1] = rgba[i + 1] * 0.985 * ground;
      rgba[i + 2] = rgba[i + 2] * 0.86 * ground;
    }
  }
  const out = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 92, effort: 6 })
    .toFile(path.join(OUT_PROPS, `${name}.webp`));
  sizes[name] = { width: out.width, height: out.height };
  console.log(`hero/ingredients/${name}.webp ${out.width}x${out.height}`);
}

mkdirSync(OUT_PROPS, { recursive: true });
mkdirSync(OUT_HERBS, { recursive: true });

for (const [name, spec] of Object.entries(PROPS)) {
  await writeCutout(name, cutOut(await pixels(spec.file), spec), 640);
}

for (const [name, herb] of Object.entries(HERBS)) {
  const img = await pixels(herb.photo);
  if (herb.cut) {
    const corners = [
      [0, 0, 60, 60],
      [img.w - 60, 0, img.w, 60],
      [0, img.h - 60, 60, img.h],
      [img.w - 60, img.h - 60, img.w, img.h],
    ];
    const cut = cutOut(
      img,
      { crop: herb.cut, bg: corners, zones: [] },
      { bgTol: 26, minArea: 150, studio: true },
    );
    await writeCutout(name, cut, 480);
  }
  const [left, top, size] = herb.tile;
  const tile = await sharp(path.join(SRC, herb.photo))
    .extract({ left, top, width: size, height: size })
    .resize(160, 160)
    .webp({ quality: 82 })
    .toFile(path.join(OUT_HERBS, `${name}.webp`));
  console.log(`herbs/${name}.webp ${tile.width}x${tile.height}`);
}

writeFileSync(
  path.join(ROOT, "src", "components", "hero", "ingredient-art.generated.json"),
  `${JSON.stringify(sizes, null, 2)}\n`,
);
console.log("hero/ingredient-art.generated.json");
