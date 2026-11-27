import { readdirSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const ASSETS = path.join(ROOT, "assets");
export const PRODUCTS_DIR = path.join(ASSETS, "products");
export const PUBLIC = path.join(ROOT, "public");

export const SET_ORDER = ["coconut", "almond", "pumpkin-seed", "signature", "olive", "mustard", "sesame"];

export const PRODUCT_FOLDERS = {
  signature: {
    dir: "signature",
    bottle: "Signature Herbal Hair Oil Bottle.png",
    box: "Herbal Hair Oil Signature Box.png",
    duo: "Signature Herbal Hair Oil Duo.png",
  },
  coconut: {
    dir: "cocnut",
    bottle: "Turquoise Coconut Hair Oil Bottle.png",
    box: "Turquoise Premium Coconut Hair Oil Box.png",
    duo: "Premium Coconut Hair Oil Set.png",
  },
  almond: {
    dir: "Almond oil",
    bottle: "Premium Almond Hair Oil Bottle.png",
    box: "Premium Almond Hair Oil Packaging.png",
    duo: "ZR² Almond Hair Oil Duo.png",
  },
  "pumpkin-seed": {
    dir: "pumpkin",
    bottle: "Premium Pumpkin Seed Hair Oil Bottle.png",
    box: "Sage Green Herbal Pumpkin Hair Oil Box.png",
    duo: "Sage Herbal Pumpkin Seed Hair Oil Set.png",
  },
  olive: {
    dir: "olive",
    bottle: "Premium Olive Herbal Hair Oil Bottle.png",
    box: "Olive Herbal Hair Oil Packaging.png",
    duo: "Olive Hair Oil Bottle and Box Duo.png",
  },
  mustard: {
    dir: "mustarad",
    bottle: "Premium Mustard Hair Oil Bottle.png",
    box: "Mustard Herbal Hair Oil Packaging.png",
    duo: "ZR Mustard Hair Oil Bottle and Box.png",
  },
  sesame: {
    dir: "sesame",
    bottle: "Premium Sesame Hair Oil Bottle.png",
    box: "Dusty Pink Sesame Hair Oil Box.png",
    duo: "Premium Sesame Hair Oil Packaging Duo.png",
  },
};

export function packagingFile(slug, kind) {
  const entry = PRODUCT_FOLDERS[slug];
  if (!entry) throw new Error(`No packaging folder for ${slug}`);
  return path.join(PRODUCTS_DIR, entry.dir, entry[kind]);
}

const productFiles = readdirSync(PRODUCTS_DIR);

function findOne(pattern, label) {
  const hits = productFiles.filter((f) => pattern.test(f));
  if (hits.length !== 1) throw new Error(`${label}: expected 1 match for ${pattern}, found ${hits.length}`);
  return path.join(PRODUCTS_DIR, hits[0]);
}

export function setFile(timePrefix, slug) {
  const n = SET_ORDER.indexOf(slug) + 1;
  return findOne(
    new RegExp(`^ChatGPT Image .*, ${timePrefix}_\\d\\d PM-${n}\\.png$`),
    `${timePrefix} ${slug}`,
  );
}

export function bottleFile(slug) {
  return packagingFile(slug, "bottle");
}

export function productAsset(name) {
  return findOne(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), name);
}
