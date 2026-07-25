import { allElements, requireElement } from "./dom";

const sections = allElements<HTMLElement>(".searchable");
const desktopSearch = requireElement<HTMLInputElement>("#guide-search");
const mobileSearch = requireElement<HTMLInputElement>("#mobile-search");
const desktopCount = requireElement<HTMLElement>("#result-count");
const mobileCount = requireElement<HTMLElement>("#mobile-result-count");
const empty = requireElement<HTMLElement>("#no-results");

function matches(section: HTMLElement, query: string): boolean {
  const keywords = section.dataset.keywords ?? "";
  return (
    !query || `${section.textContent} ${keywords}`.toLowerCase().includes(query)
  );
}

function applySearch(value: string): void {
  const query = value.trim().toLowerCase();
  const shown = sections.filter((section) => {
    section.hidden = !matches(section, query);
    return !section.hidden;
  }).length;
  const label = query
    ? `Showing ${shown} of ${sections.length} sections`
    : "Showing every section";
  desktopCount.textContent = label;
  mobileCount.textContent = label;
  empty.hidden = shown !== 0;
}

function syncSearch(source: HTMLInputElement, target: HTMLInputElement): void {
  target.value = source.value;
  applySearch(source.value);
}

function clearSearch(focusTarget: HTMLInputElement): void {
  desktopSearch.value = "";
  mobileSearch.value = "";
  applySearch("");
  focusTarget.focus();
}

export function setupSearch(): void {
  desktopSearch.addEventListener("input", () =>
    syncSearch(desktopSearch, mobileSearch),
  );
  mobileSearch.addEventListener("input", () =>
    syncSearch(mobileSearch, desktopSearch),
  );
  requireElement("#clear-search").addEventListener("click", () =>
    clearSearch(desktopSearch),
  );
  requireElement("#mobile-clear").addEventListener("click", () =>
    clearSearch(mobileSearch),
  );
}
