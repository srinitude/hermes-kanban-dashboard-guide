# Hermes Kanban dashboard guide

An Astro application for the complete Hermes Kanban dashboard guide. It preserves the verified mobile-first interface, all 118 dashboard feature markers, the searchable sections, copy controls, saved progress, responsive tables, and keyboard search.

## Local development

Requirements are managed by Mise.

```sh
mise run install
mise run dev
```

Open the URL printed by Astro. The production site uses the GitHub Pages base path `/hermes-kanban-dashboard-guide`.

## Verification

```sh
mise run ci
```

The canonical task installs the locked dependency graph, checks formatting and Astro diagnostics, builds the static site, and runs output-level behavior tests. The tests verify:

- all 118 feature markers;
- the complete visible guide-copy hash;
- fragment-link integrity;
- responsive accessibility styles;
- bundled search, copy, progress, table, and navigation behavior;
- GitHub Pages asset prefixes.

## Project map

- `src/pages/index.astro` composes the application.
- `src/layouts/BaseLayout.astro` owns the document shell.
- `src/components/` owns visible regions.
- `src/content/sections/` owns the migrated guide sections.
- `src/scripts/` owns browser behavior.
- `src/styles/` owns ordered CSS layers.
- `tests/` owns output contracts.

## Deployment

The private repository deploys with Astro's official GitHub Pages workflow in `.github/workflows/deploy.yml`. The Astro config sets:

```js
site: "https://srinitude.github.io";
base: "/hermes-kanban-dashboard-guide";
```

GitHub Pages availability and site visibility depend on the account's GitHub plan and Pages settings. Repository privacy does not by itself make the published Pages site private.

## Source basis

The application was refactored from the verified standalone guide at installed Hermes commit `46c7a4076fc543bdc98de12b81c2c85ef9c864b9`. Its normalized visible body copy has SHA-256 `e1d900576cf832f975e873333b2478ec6698936ffb245350f9ff703d61a08e5f`.
