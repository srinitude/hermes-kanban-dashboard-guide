import { allElements, requireElement } from "./dom";

function activateNavigation(entries: IntersectionObserverEntry[]): void {
  const visible = entries.find((entry) => entry.isIntersecting);
  if (!visible) return;
  const links = allElements<HTMLAnchorElement>("#side-nav a");
  for (const link of links) {
    link.classList.toggle("active", link.hash.slice(1) === visible.target.id);
  }
}

function observeSections(): void {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(activateNavigation, {
    rootMargin: "-15% 0px -72%",
  });
  for (const section of allElements<HTMLElement>("section[id]")) {
    observer.observe(section);
  }
}

function closeMobileMenuLinks(): void {
  const menu = requireElement<HTMLDetailsElement>(".mobile-menu");
  for (const link of allElements<HTMLAnchorElement>(".mobile-links a")) {
    link.addEventListener("click", () => menu.removeAttribute("open"));
  }
}

function focusSearch(event: KeyboardEvent): void {
  const target = document.activeElement?.tagName ?? "";
  if (event.key !== "/" || /input|textarea|select/i.test(target)) return;
  event.preventDefault();
  if (matchMedia("(min-width: 64rem)").matches) {
    requireElement<HTMLInputElement>("#guide-search").focus();
    return;
  }
  requireElement<HTMLDetailsElement>(".mobile-menu").open = true;
  requestAnimationFrame(() =>
    requireElement<HTMLInputElement>("#mobile-search").focus(),
  );
}

export function setupNavigation(): void {
  observeSections();
  closeMobileMenuLinks();
  document.addEventListener("keydown", focusSearch);
}
