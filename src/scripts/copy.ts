import { allElements } from "./dom";

const copiedDelay = 1600;

async function copyCommand(button: HTMLButtonElement): Promise<void> {
  const command = button.dataset.copy ?? "";
  try {
    await navigator.clipboard.writeText(command);
    showCopiedState(button);
  } catch {
    window.prompt("Copy this command:", command);
  }
}

function showCopiedState(button: HTMLButtonElement): void {
  button.textContent = "Copied";
  button.classList.add("copied");
  window.setTimeout(() => {
    button.textContent = "Copy";
    button.classList.remove("copied");
  }, copiedDelay);
}

export function setupCopyButtons(): void {
  for (const button of allElements<HTMLButtonElement>("[data-copy]")) {
    button.addEventListener("click", () => void copyCommand(button));
  }
}
