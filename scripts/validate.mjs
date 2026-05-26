import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const externalRef = /^(?:https?:|mailto:|tel:|data:)/i;

const ignoredDirectories = new Set([".git", "dist", "node_modules", ".wrangler"]);

function walk(dir, predicate, results = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (ignoredDirectories.has(entry)) continue;
      walk(path, predicate, results);
    } else if (!predicate || predicate(path)) {
      results.push(path);
    }
  }
  return results;
}

function idsForHtml(html) {
  return new Set(
    [...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((match) => match[1])
  );
}

function resolveHtmlRoute(root, targetPart) {
  const cleanTarget = targetPart || "/";
  const basePath = cleanTarget.startsWith("/")
    ? resolve(root, `.${cleanTarget}`)
    : null;

  if (cleanTarget === "/") {
    return resolve(root, "index.html");
  }

  if (!basePath) {
    return null;
  }

  const candidates = extname(basePath)
    ? [basePath]
    : [`${basePath}.html`, join(basePath, "index.html"), basePath];

  return candidates.find((candidate) => existsSync(candidate)) || basePath;
}

function resolveReference(root, file, targetPart) {
  if (!targetPart) return file;

  if (targetPart.startsWith("/")) {
    return resolveHtmlRoute(root, targetPart);
  }

  return resolve(dirname(file), targetPart);
}

function validateHtmlReferences(root, errors) {
  const htmlFiles = walk(root, (path) => extname(path) === ".html");

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

    for (const ref of refs) {
      if (externalRef.test(ref)) continue;

      const [targetPart, anchor] = ref.split("#", 2);
      const targetPath = resolveReference(root, file, targetPart);

      if (targetPart && !existsSync(targetPath)) {
        errors.push(`${file}: missing reference ${ref}`);
        continue;
      }

      if (anchor) {
        if (extname(targetPath) !== ".html") {
          errors.push(`${file}: anchor reference ${ref} does not target an HTML file`);
          continue;
        }

        const targetHtml = readFileSync(targetPath, "utf8");
        if (!idsForHtml(targetHtml).has(anchor)) {
          errors.push(`${file}: missing anchor ${ref}`);
        }
      }
    }
  }
}

function validateCssReferences(root, errors) {
  const cssFiles = walk(
    root,
    (path) => extname(path) === ".css" && !path.endsWith(".figma-export.css")
  );

  for (const file of cssFiles) {
    const css = readFileSync(file, "utf8");
    const open = (css.match(/\{/g) || []).length;
    const close = (css.match(/\}/g) || []).length;

    if (open !== close) {
      errors.push(`${file}: unbalanced CSS braces (${open} open, ${close} close)`);
    }

    for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      const ref = match[1];
      if (externalRef.test(ref)) continue;

      const targetPath = resolve(dirname(file), ref);
      if (!existsSync(targetPath)) {
        errors.push(`${file}: missing CSS asset ${ref}`);
      }
    }
  }
}

export function validateSite(rootDir = process.cwd()) {
  const root = resolve(rootDir);
  const errors = [];

  validateHtmlReferences(root, errors);
  validateCssReferences(root, errors);

  if (errors.length) {
    throw new Error(`Site validation failed:\n${errors.join("\n")}`);
  }

  console.log(`Validated ${root}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  validateSite(process.argv[2] || process.cwd());
}
