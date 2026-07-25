# Hermes Kanban dashboard guide

## Scope

- This repository owns the Astro application for the Hermes Kanban dashboard guide.
- Preserve the verified guide wording, 118 feature markers, accessibility behavior, and mobile-first layout unless a task explicitly changes them.
- Keep generated output in `dist/` and dependencies in `node_modules/`. Neither belongs in Git.

## Commands

- Install dependencies with `mise run install`.
- Run the complete local path with `mise run ci`.
- Start development with `mise run dev`.
- Build the static site with `mise run build`.

## Structure

- `src/pages/` owns routes.
- `src/layouts/` owns document structure and metadata.
- `src/components/` owns visible page regions.
- `src/content/sections/` owns trusted static guide sections.
- `src/scripts/` owns browser behavior.
- `src/styles/` owns the layered visual system.
- `tests/` owns output-level behavior contracts.

## Delivery

- GitHub Actions must run `mise run ci`.
- GitHub Pages deployment follows Astro's official `withastro/action` workflow.
- Do not add external runtime assets or secrets.
