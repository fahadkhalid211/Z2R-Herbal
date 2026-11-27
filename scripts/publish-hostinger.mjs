import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { PUBLIC, ROOT } from "./asset-map.mjs";

const ZIP_NAME = "z2rherbal-hostinger-upload.zip";
const DEFAULT_OUT = "C:\\Publish_Data\\z2rherbal_website";
const EXPORT_DIR = path.join(ROOT, ".next-export");
const OVERLAY = path.join(ROOT, "hosting", "hostinger", "public_html");
const WIDTHS = [96, 160, 240, 320, 390, 480, 640, 828, 1080, 1280, 1600, 1920];
const NODE_APP_FILES = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.mjs",
  "src",
  "public",
  "assets/products/ZR² Herbal Signature Hair Oil Bottle.png",
];

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const [key, inline] = argv[i].split("=", 2);
    if (key === "--site" || key === "--out") args[key.slice(2)] = inline ?? argv[++i];
    if (key === "--static") args.static = true;
  }
  return args;
}

function siteUrl(raw) {
  if (!raw) fail("Pass your domain: npm run publish:hostinger -- --site https://your-domain.com");
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail(`--site is not a URL: ${raw}`);
  }
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes("."))
    fail(`--site must be a public URL: ${raw}`);
  return url.origin;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function buildStaticSite(site) {
  rmSync(EXPORT_DIR, { recursive: true, force: true });
  const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
  console.log(`▶ Building the static site for ${site} …\n`);
  const result = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_SITE_URL: site },
  });
  if (result.status !== 0) fail("next build failed (see the output above).");
  if (!existsSync(path.join(EXPORT_DIR, "index.html"))) fail(`No index.html in ${EXPORT_DIR}.`);
}

const exists = (dir, urlPath) => existsSync(path.join(dir, ...urlPath.split("/")));
const IMG = /^\/_img\/\d+(\/.+)\.webp$/;

function localRefs(dest) {
  const refs = new Set();
  for (const file of walk(dest).filter((f) => /\.(html|txt)$/.test(f))) {
    const text = readFileSync(file, "utf8");
    for (const [, ref] of text.matchAll(
      /["'(\s,](\/(?:_img|_next\/static|images|brand|textures)\/[^"'\s),\\?#]+?\.(?:webp|png|jpe?g|svg|ico|js|css|woff2))(?=["'\s),\\?#])/g,
    )) {
      refs.add(decodeURIComponent(ref));
    }
  }
  return refs;
}

function originalOf(ref) {
  const base = ref.match(IMG)?.[1];
  const candidates = base ? [".webp", ".png", ".jpg", ".jpeg"].map((ext) => base + ext) : [ref];
  return candidates.find((c) => /^\/(images|textures)\/.+\.(png|jpe?g|webp)$/i.test(c) && exists(PUBLIC, c));
}

async function generateImageSizes(dest, refs) {
  const sources = new Set([...refs].map(originalOf).filter(Boolean));
  let count = 0;
  for (const source of sources) {
    const file = path.join(PUBLIC, ...source.split("/"));
    const isWebp = /\.webp$/i.test(source);
    const urlPath = source.replace(/\.(png|jpe?g|webp)$/i, ".webp");
    const { width: original = Infinity } = await sharp(file).metadata();
    for (const width of WIDTHS) {
      if (width >= original && isWebp) continue;
      const target = path.join(dest, "_img", String(width), ...urlPath.split("/"));
      mkdirSync(path.dirname(target), { recursive: true });
      await sharp(file)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78, effort: 5 })
        .toFile(target);
      count++;
    }
  }
  return { images: sources.size, files: count };
}

function checkReferences(dest, refs) {
  const missing = [...refs].filter((ref) => {
    if (exists(dest, ref)) return false;
    const fallback = ref.match(IMG)?.[1]; // the .htaccess fallback to the WebP original
    return !(fallback && exists(dest, `${fallback}.webp`));
  });
  if (missing.length) fail(`Missing files referenced by the pages:\n  ${missing.slice(0, 20).join("\n  ")}`);
}

function zip(sourceDir, zipFile) {
  rmSync(zipFile, { force: true });
  const entries = readdirSync(sourceDir);
  const [cmd, args] =
    process.platform === "win32"
      ? [
          path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe"),
          ["-a", "-c", "--options", "zip:hdrcharset=UTF-8", "-f", zipFile, ...entries],
        ]
      : ["zip", ["-qr", zipFile, ...entries]];
  const result = spawnSync(cmd, args, { cwd: sourceDir, stdio: "inherit" });
  if (result.status !== 0) fail(`Could not create ${zipFile}.`);
}

function packNodeApp(site, zipFile) {
  const stage = path.join(tmpdir(), `z2r-hostinger-${process.pid}`);
  rmSync(stage, { recursive: true, force: true });
  for (const entry of NODE_APP_FILES) {
    const from = path.join(ROOT, ...entry.split("/"));
    if (!existsSync(from)) fail(`Missing ${entry}`);
    cpSync(from, path.join(stage, ...entry.split("/")), {
      recursive: true,
      filter: (src) => !/\.test\.tsx?$/.test(src), // tests need the dev test setup, not the build
    });
  }
  writeFileSync(path.join(stage, ".env.production"), `NEXT_PUBLIC_SITE_URL=${site}\n`);
  zip(stage, zipFile);
  rmSync(stage, { recursive: true, force: true });
}

function nodeSteps(site) {
  return `Z2R Herbal — upload to Hostinger (Node.js web app)
Built for: ${site}    Built at: ${new Date().toISOString()}

1. hPanel → Websites → Add Website → Node.js web app → Upload your files.
   (If ${new URL(site).hostname} is already added as a website, remove it first.)
2. Upload ${ZIP_NAME}.
3. Check the build settings Hostinger fills in, then click Deploy:
     Framework preset:  Next.js
     Node.js version:   24
     Build command:     npm run build
     Output directory:  .next
4. In the app's settings, add these environment variables (values: see .env.example in the project):
     STORE_API_URL            https://admin.z2rherbal.com
     STORE_API_CLIENT_ID      (admin panel → General Settings → Website API)
     STORE_API_CLIENT_SECRET  (the secret shown once when the key was made; never share it)
     STORE_WEBHOOK_SECRET     (a long random value; the admin's webhook sends it to ${site}/api/webhooks/store)
     DATA_DIR            /home/<your-user>/z2r-data   (newsletter sign-ups; orders.json only without the Store API)
     SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, ORDER_EMAIL_TO
     ADMIN_PASSWORD, ADMIN_SESSION_SECRET   (the order desk at ${site}/admin/orders)
   Redeploy after changing them.
5. hPanel → Security → SSL: make sure SSL is active for the domain.
6. Open ${site}, place a test order, and check it arrives by email and in the order desk.

To publish again after changes: run the same command, then in the app's deployment
settings upload the new ${ZIP_NAME} and redeploy.
`;
}

function steps(site) {
  return `Z2R Herbal — upload to Hostinger (static site)
Built for: ${site}    Built at: ${new Date().toISOString()}

1. hPanel → Websites → your domain → Dashboard → File Manager.
2. Open public_html. Delete Hostinger's default files there (default.php / index.php) and any old
   version of this site. Leave the ".well-known" folder if it exists.
3. Upload ${ZIP_NAME} into public_html, right-click it → Extract → extract into public_html
   itself (not a sub-folder). Then delete the .zip.
   (Or upload the CONTENTS of the public_html folder here via FTP — not the folder itself.)
4. Check that public_html now contains index.html, 404.html, .htaccess,
   _next/ and _img/ directly.
5. hPanel → Security → SSL: make sure SSL is active, then turn on "Force HTTPS".
6. Open ${site} and hard-refresh (Ctrl+F5).

NOTE: a static site cannot take orders, track them or send forms. Use the default
(Node.js web app) publish for the live store.

To publish again after changes: run the same command, then repeat steps 2–4.
`;
}

const args = parseArgs(process.argv.slice(2));
const site = siteUrl(args.site ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://z2rherbal.com");
if (new URL(site).hostname !== "z2rherbal.com")
  console.warn(
    `Note: --site is ${site}; the site itself always uses https://z2rherbal.com for canonical URLs.`,
  );
const outDir = path.resolve(args.out ?? DEFAULT_OUT);
const siteDir = path.join(outDir, "public_html");
const zipFile = path.join(outDir, ZIP_NAME);

if (args.static) {
  console.warn(
    "\n⚠ --static: orders, tracking, the contact form and the newsletter need the Node.js web app; they will not work in this build.\n",
  );
}

if (!args.static) {
  mkdirSync(outDir, { recursive: true });
  rmSync(siteDir, { recursive: true, force: true }); // a previous --static run's output
  console.log(`▶ Packing the Node.js web app for ${site}`);
  packNodeApp(site, zipFile);
  writeFileSync(path.join(outDir, "UPLOAD-STEPS.txt"), nodeSteps(site));
  console.log(`
✔ Published for ${site}
  ${zipFile}  (${(statSync(zipFile).size / 1024 / 1024).toFixed(1)} MB)
  Next: follow ${path.join(outDir, "UPLOAD-STEPS.txt")}`);
  process.exit(0);
}

buildStaticSite(site);

console.log(`\n▶ Writing ${siteDir}`);
mkdirSync(outDir, { recursive: true });
rmSync(siteDir, { recursive: true, force: true });
cpSync(EXPORT_DIR, siteDir, { recursive: true });

const refs = localRefs(siteDir);
const sized = await generateImageSizes(siteDir, refs);
console.log(`  ${sized.files} image sizes from ${sized.images} images`);

cpSync(OVERLAY, siteDir, { recursive: true });
writeFileSync(
  path.join(siteDir, "_next", "static", ".htaccess"),
  '<IfModule mod_headers.c>\n  Header set Cache-Control "public, max-age=31536000, immutable"\n</IfModule>\n',
);
writeFileSync(
  path.join(siteDir, "_img", ".htaccess"),
  '<IfModule mod_headers.c>\n  Header set Cache-Control "public, max-age=2592000"\n</IfModule>\n',
);

checkReferences(siteDir, refs);

zip(siteDir, zipFile);
writeFileSync(path.join(outDir, "UPLOAD-STEPS.txt"), steps(site));

const files = walk(siteDir);
const totalMb = files.reduce((sum, f) => sum + statSync(f).size, 0) / 1024 / 1024;
console.log(`
✔ Published for ${site}
  ${siteDir}  (${files.length} files, ${totalMb.toFixed(1)} MB)
  ${zipFile}  (${(statSync(zipFile).size / 1024 / 1024).toFixed(1)} MB)
  Next: follow ${path.join(outDir, "UPLOAD-STEPS.txt")}`);
