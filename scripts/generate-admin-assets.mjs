import fs from "fs";
import path from "path";

const keys = [
  "logo",
  "odyssea_logo",
  "stamp_corner",
  "dashboard",
  "stories",
  "portfolio",
  "videos",
  "clients_album",
  "clients",
  "media_librairie",
  "media_library",
  "website_page",
  "navigation",
  "appearance",
  "seo_settings",
  "forms_emails",
  "eye",
];

const roots = [
  "public/images/admin",
  "public/images/admin/icons",
  "public/icons/admin",
  "public/admin",
].filter((dir) => fs.existsSync(dir));

const allowed = new Set([".svg", ".png", ".webp", ".jpg", ".jpeg"]);
const priority = {
  ".svg": 0,
  ".png": 1,
  ".webp": 2,
  ".jpg": 3,
  ".jpeg": 4,
};

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(full);
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (!allowed.has(ext)) {
      return [];
    }

    return [full];
  });
}

const files = roots
  .flatMap(walk)
  .sort((a, b) => {
    const extA = path.extname(a).toLowerCase();
    const extB = path.extname(b).toLowerCase();

    return (priority[extA] ?? 99) - (priority[extB] ?? 99);
  });

const found = {};

for (const file of files) {
  const base = path.basename(file, path.extname(file)).toLowerCase();

  if (!keys.includes(base)) {
    continue;
  }

  if (found[base]) {
    continue;
  }

  const url = "/" + file.replace(/^public[\\/]/, "").replaceAll("\\", "/");
  found[base] = url;
}

if (!found.media_librairie && found.media_library) {
  found.media_librairie = found.media_library;
}

if (!found.logo && found.odyssea_logo) {
  found.logo = found.odyssea_logo;
}

// Safety: portfolio must use SVG when available.
if (fs.existsSync("public/images/admin/portfolio.svg")) {
  found.portfolio = "/images/admin/portfolio.svg";
}

const output = `export const adminAsset = ${JSON.stringify(
  Object.fromEntries(keys.map((key) => [key, found[key] ?? ""])),
  null,
  2
)} as const;

export type AdminAssetKey = keyof typeof adminAsset;
`;

fs.writeFileSync("src/data/adminAssets.ts", output);

const missing = keys.filter((key) => !found[key] && key !== "media_library");

if (missing.length) {
  console.log("Missing admin assets:");
  for (const key of missing) {
    console.log("-", key);
  }
} else {
  console.log("All admin assets found.");
}
