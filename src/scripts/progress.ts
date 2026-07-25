import { allElements, requireElement } from "./dom";

const checks = allElements<HTMLInputElement>("[data-progress]");
const keyPrefix = "hermes-kanban-guide-";

function createProgressMeter(): HTMLElement {
  const meter = document.createElement("div");
  const title = document.createElement("strong");
  const label = document.createElement("span");
  const track = document.createElement("div");
  const fill = document.createElement("div");
  meter.className = "progress-meter";
  meter.setAttribute("aria-live", "polite");
  label.id = "progress-label";
  label.textContent = "0 of 6";
  track.className = "progress-track";
  track.setAttribute("aria-hidden", "true");
  fill.className = "progress-fill";
  fill.id = "progress-fill";
  title.append("First task progress ", label);
  track.append(fill);
  meter.append(title, track);
  return meter;
}

function restoreChecks(): void {
  for (const check of checks) {
    const key = `${keyPrefix}${check.dataset.progress}`;
    check.checked = localStorage.getItem(key) === "1";
    check.addEventListener("change", () => {
      localStorage.setItem(key, check.checked ? "1" : "0");
      syncProgress();
    });
  }
}

function syncProgress(): void {
  const done = checks.filter((item) => item.checked).length;
  requireElement("#progress-label").textContent = `${done} of ${checks.length}`;
  requireElement<HTMLElement>("#progress-fill").style.width =
    `${(done / checks.length) * 100}%`;
}

export function setupProgress(): void {
  requireElement(".searchbox").append(createProgressMeter());
  restoreChecks();
  syncProgress();
}
