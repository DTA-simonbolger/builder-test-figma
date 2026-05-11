import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSite } from "./validate.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outDir = resolve(root, "dist");
const outRelative = relative(root, outDir);

if (outRelative !== "dist") {
  throw new Error(`Refusing to clean unexpected output directory: ${outDir}`);
}

const files = [
  "index.html",
  "services.html",
  "services-b.html",
  "about.html",
  "team.html",
  "insights.html",
  "insights-b.html",
  "careers.html",
  "careers-b.html",
  "contact.html",
  "404.html",
  "homepage.css",
  "services.css",
  "services-b.css",
  "about.css",
  "team.css",
  "insights.css",
  "insights-b.css",
  "careers.css",
  "careers-b.css",
  "contact.css",
  "main.js",
  "_headers",
  "_redirects",
  "robots.txt"
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const file of files) {
  copyFileSync(join(root, file), join(outDir, basename(file)));
}

cpSync(join(root, "assets"), join(outDir, "assets"), { recursive: true });

validateSite(outDir);
console.log("Built Cloudflare Pages output in dist/.");
