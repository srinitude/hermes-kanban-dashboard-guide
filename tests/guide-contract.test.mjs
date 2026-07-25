import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const base = "/hermes-kanban-dashboard-guide/";
const required = JSON.parse(
  readFileSync(new URL("./required-features.json", import.meta.url), "utf8"),
);
const expectedBodyHash = readFileSync(
  new URL("./guide-body.sha256", import.meta.url),
  "utf8",
).trim();

function builtHtml() {
  return readFileSync(join(dist, "index.html"), "utf8");
}

function tokensFor(html, attribute) {
  const pattern = new RegExp(`${attribute}="([^"]+)"`, "g");
  return [...html.matchAll(pattern)].flatMap((match) => match[1].split(/\s+/));
}

function localAssetText(html, attribute) {
  const pattern = new RegExp(`${attribute}="([^"]*_astro/[^"]+)"`, "g");
  return [...html.matchAll(pattern)]
    .map((match) => match[1].replace(base, ""))
    .map((path) => readFileSync(join(dist, path), "utf8"))
    .join("\n");
}

function inlineText(html, tag) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  return [...html.matchAll(pattern)].map((match) => match[1]).join("\n");
}

function normalizedBody(html) {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
  return body
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

test("build emits the guide document shell", () => {
  const html = builtHtml();
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<html lang="en" data-layout="mobile-first">/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  assert.match(html, /Use one board to start and follow agent work\./);
});

test("build preserves the complete visible guide copy", () => {
  const body = normalizedBody(builtHtml());
  const actualHash = createHash("sha256").update(body).digest("hex");
  assert.equal(actualHash, expectedBodyHash);
});

test("build preserves every dashboard feature marker", () => {
  const actual = [...new Set(tokensFor(builtHtml(), "data-feature"))].sort();
  assert.deepEqual(actual, [...required].sort());
  assert.equal(actual.length, 118);
});

test("build resolves every fragment link", () => {
  const html = builtHtml();
  const ids = new Set(tokensFor(html, "id"));
  const fragments = tokensFor(html, "href").filter((href) =>
    href.startsWith("#"),
  );
  const missing = fragments
    .map((href) => href.slice(1))
    .filter((id) => !ids.has(id));
  assert.deepEqual(missing, []);
});

test("build preserves responsive accessibility styles", () => {
  const html = builtHtml();
  const css = `${inlineText(html, "style")}\n${localAssetText(html, "href")}`;
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /safe-area-inset/);
  assert.doesNotMatch(css, /@media\s*\(\s*max-width/);
});

test("build preserves guide interactions", () => {
  const html = builtHtml();
  const javascript = `${inlineText(html, "script")}\n${localAssetText(html, "src")}`;
  for (const token of [
    "hermes-kanban-guide-",
    "mobile-search",
    "progress-label",
  ]) {
    assert.match(javascript, new RegExp(token));
  }
});

test("build prefixes generated assets for GitHub Pages", () => {
  const html = builtHtml();
  const assets = tokensFor(html, "src").concat(tokensFor(html, "href"));
  const generated = assets.filter((path) => path.includes("_astro/"));
  assert.ok(generated.length > 0);
  assert.ok(generated.every((path) => path.startsWith(base)));
});

test("build uses the mobile-first editorial field-manual visual system", () => {
  const html = builtHtml();
  const css = `${inlineText(html, "style")}\n${localAssetText(html, "href")}`;

  for (const token of ["--accent:", "--hairline:", "--paper-grain:"]) {
    assert.match(css, new RegExp(token));
  }

  assert.doesNotMatch(css, /--(?:hard-shadow|orange):/);
  assert.match(css, /\.route-strip a:first-child\{[^}]*var\(--accent\)/);

  const wideStart = css.search(
    /@media\s*\((?:min-width:\s*64rem|width\s*>=\s*64rem)\)/,
  );
  assert.ok(wideStart > 0, "desktop enhancement must start at 64rem");
  const mobileCss = css.slice(0, wideStart);
  assert.match(mobileCss, /\.layout\{[^}]*display:\s*block/);
  assert.doesNotMatch(mobileCss, /\.layout\{[^}]*display:\s*grid/);
});

test("build uses the reference manual composition", () => {
  const html = builtHtml();
  const css = `${inlineText(html, "style")}\n${localAssetText(html, "href")}`;

  for (const token of [
    'class="topnav folio-nav"',
    'class="side manual-rail"',
    'class="hero manual-sheet"',
    'class="command code-plate"',
    'class="hero-note margin-note"',
    'class="page-turner"',
  ]) {
    assert.match(html, new RegExp(token));
  }

  assert.equal((html.match(/data-folio="0[2-5]"/g) ?? []).length, 4);
  assert.match(html, /name="color-scheme" content="light"/);
  assert.match(css, /--manual-rail:/);
  assert.match(css, /--reading-measure:/);
  assert.match(css, /\.folio-nav/);
  assert.match(css, /\.page-turner/);
  assert.match(css, /\.manual-sheet/);
});

test("build keeps mobile manual chrome unobstructed", () => {
  const html = builtHtml();
  const css = `${inlineText(html, "style")}\n${localAssetText(html, "href")}`;
  const shell = readFileSync(join(root, "src/styles/manual-shell.css"), "utf8");

  assert.match(css, /\.brand\{[^}]*white-space:\s*nowrap/);
  assert.match(css, /\.mobile-menu\{[^}]*position:\s*absolute/);
  assert.match(css, /\.page-turner\{[^}]*background:\s*var\(--paper\)/);
  assert.match(
    css,
    /@media\s*\(prefers-color-scheme:\s*dark\)[\s\S]*--paper-grain:/,
  );
  assert.match(shell, /body\s*\{[^}]*background-color:\s*var\(--paper\)/s);
});
