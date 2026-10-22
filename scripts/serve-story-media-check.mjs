import { createRequire } from "node:module";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

// tsx owns this dependency; resolve from it with npm and pnpm alike.
const { build } = createRequire(import.meta.resolve("tsx"))("esbuild");

const out = path.resolve("node_modules/.cache/story-media-check");
const port = Number(process.env.PORT ?? 4387);
await mkdir(out, { recursive: true });
await build({
  entryPoints: ["scripts/story-media-harness.tsx"],
  bundle: true,
  outdir: out,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  loader: { ".module.css": "local-css" },
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [
    {
      name: "tailwind",
      setup(builder) {
        builder.onLoad({ filter: /globals\.css$/ }, async ({ path: file }) => ({
          contents: (
            await postcss([tailwindcss()]).process(
              await readFile(file, "utf8"),
              { from: file },
            )
          ).css,
          loader: "css",
          resolveDir: path.dirname(file),
        }));
      },
    },
  ],
});
const html =
  '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/story-media-harness.css"><div id="root"></div><script src="/story-media-harness.js"></script>';
await writeFile(path.join(out, "index.html"), html);
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700"><rect width="600" height="700" fill="#186c74"/><circle cx="300" cy="290" r="160" fill="#e5b966"/><text x="300" y="570" text-anchor="middle" fill="white" font-size="48">STORY PHOTO</text></svg>';
if (!process.argv.includes("--build-only")) createServer(async (req, res) => {
  if (req.url === "/api/public/watermark-settings" || req.url === "/api/watermarks") {
    res.setHeader("Content-Type", "application/json");
    res.end('{"enabled":false}');
    return;
  }
  if (req.url === "/fixture.svg") {
    res.setHeader("Content-Type", "image/svg+xml");
    res.end(svg);
    return;
  }
  const name = req.url === "/" ? "index.html" : req.url?.slice(1);
  if (
    ![
      "index.html",
      "story-media-harness.js",
      "story-media-harness.css",
    ].includes(name)
  ) {
    res.writeHead(404).end();
    return;
  }
  res.setHeader(
    "Content-Type",
    name.endsWith(".js")
      ? "text/javascript"
      : name.endsWith(".css")
        ? "text/css"
        : "text/html",
  );
  res.end(await readFile(path.join(out, name)));
}).listen(port, "127.0.0.1", () =>
  console.log(`Story media check: http://127.0.0.1:${port}`),
);
