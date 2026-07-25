export function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required guide element: ${selector}`);
  }
  return element;
}

export function allElements<T extends Element>(selector: string): T[] {
  return [...document.querySelectorAll<T>(selector)];
}
