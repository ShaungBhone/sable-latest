# AGENTS.md

## Project

- Framework: Nuxt 4 (`nuxt@^4.3.1`)
- Language: TypeScript + Vue SFC
- UI: Tailwind CSS + shadcn-nuxt/reka-ui
- Package manager: npm (`package-lock.json` is committed)
- Node: use Node `24.x` (minimum compatible is Node `>=20.19`)

## Goals For Agent Changes

- Keep changes minimal and task-focused.
- Preserve existing Nuxt 4 patterns and file structure.
- Avoid unrelated refactors.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Linting And Formatting

- Full lint: `npm run lint`
  - Runs:
    - `npm run lint:oxlint`
    - `npm run lint:prettier`
- Auto-fix: `npm run lint:fix`
  - Runs:
    - `npm run lint:oxlint:fix`
    - `npm run format`
- Format only: `npm run format`

## Code Quality Rules

- Run `npm run lint` before finishing.
- If formatting is needed, run `npm run lint:fix`.
- Keep Tailwind classes sortable by Prettier plugin (do not disable it).
- Respect `.prettierignore` and `.gitignore`-based lint ignores.

## Nuxt Conventions

- Prefer auto-imported Nuxt/Vue APIs where appropriate.
- Keep page/layout/component responsibility clear:
  - `app/pages` for routes
  - `app/layouts` for shared shell
  - `app/components` for reusable UI
- Do not move files across these boundaries unless requested.

## Editing Guidance

- Avoid changing generated or dependency files manually.
- Do not edit `node_modules`.
- Update docs/scripts when behavior changes.
