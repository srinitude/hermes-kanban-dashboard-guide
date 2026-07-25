import { allElements, requireElement } from "./dom";

const runtimeText =
  "Current dashboard labels: the visible column says In Progress; the stored status is running. In v0.19.0, review may appear lowercase. Archived tasks are hidden by default rather than shown as an active work column.";

function addRuntimeNote(): void {
  const note = document.createElement("p");
  note.className = "runtime-note";
  note.textContent = runtimeText;
  requireElement("#columns h2").after(note);
}

function labelTable(table: HTMLTableElement): void {
  const headers = [...table.querySelectorAll<HTMLTableCellElement>("th")].map(
    (header) => header.textContent.trim(),
  );
  for (const row of table.querySelectorAll<HTMLTableRowElement>("tbody tr")) {
    for (const [index, cell] of [...row.cells].entries()) {
      cell.dataset.label = headers[index] ?? "";
    }
  }
}

export function setupTables(): void {
  addRuntimeNote();
  for (const table of allElements<HTMLTableElement>("table")) {
    labelTable(table);
  }
}
