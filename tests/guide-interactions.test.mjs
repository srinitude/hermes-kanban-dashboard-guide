import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { Window } from "happy-dom";

const root = fileURLToPath(new URL("..", import.meta.url));
const html = readFileSync(join(root, "dist", "index.html"), "utf8");

function applicationScript() {
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  return (
    scripts
      .map((match) => match[1])
      .find((script) => script.includes("keyPrefix")) ??
    scripts
      .map((match) => match[1])
      .find((script) => script.includes("hermes-kanban-guide-"))
  );
}

function createApplication() {
  const window = new Window({
    url: "https://srinitude.github.io/hermes-kanban-dashboard-guide/",
  });
  window.matchMedia = () => ({ matches: false });
  window.IntersectionObserver = class {
    observe() {}
  };
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  const parsed = new window.DOMParser().parseFromString(html, "text/html");
  const root = window.document.importNode(parsed.documentElement, true);
  window.document.removeChild(window.document.documentElement);
  window.document.appendChild(root);
  // The generated local bundle runs only inside this isolated test context.
  runInNewContext(applicationScript(), {
    document: window.document,
    Event: window.Event,
    IntersectionObserver: window.IntersectionObserver,
    localStorage: window.localStorage,
    matchMedia: window.matchMedia,
    navigator: window.navigator,
    requestAnimationFrame: window.requestAnimationFrame,
    setTimeout: window.setTimeout.bind(window),
    window,
  });
  return window;
}

test("mobile search filters sections and clears", () => {
  const window = createApplication();
  const { document } = window;
  const search = document.querySelector("#mobile-search");
  search.value = "attachment";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  const visible = [...document.querySelectorAll(".searchable")].filter(
    (section) => !section.hidden,
  );
  assert.ok(visible.length > 0 && visible.length < 14);
  assert.equal(
    document.querySelector("#mobile-result-count").textContent,
    `Showing ${visible.length} of 14 sections`,
  );
  document.querySelector("#mobile-clear").click();
  assert.equal(
    document.querySelector("#result-count").textContent,
    "Showing every section",
  );
  window.close();
});

test("progress state and responsive table labels initialize", () => {
  const window = createApplication();
  const { document } = window;
  const firstCheck = document.querySelector("[data-progress='1']");
  firstCheck.checked = true;
  firstCheck.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert.equal(document.querySelector("#progress-label").textContent, "1 of 6");
  assert.equal(window.localStorage.getItem("hermes-kanban-guide-1"), "1");
  assert.equal(document.querySelector("tbody td").dataset.label, "Column");
  assert.match(
    document.querySelector(".runtime-note").textContent,
    /Current dashboard labels:/,
  );
  window.close();
});

test("slash search opens and focuses the mobile guide menu", () => {
  const window = createApplication();
  const { document } = window;
  document.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "/", bubbles: true }),
  );
  assert.equal(document.querySelector(".mobile-menu").open, true);
  assert.equal(
    document.activeElement,
    document.querySelector("#mobile-search"),
  );
  window.close();
});
