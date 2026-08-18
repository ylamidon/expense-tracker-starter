# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # Vite dev server -> http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the built dist/
npm run lint     # ESLint over the repo (flat config)
```

No test runner is configured -- there is no test framework, no test files, and no `test` script. If tests are needed, one must be added (Vitest is the natural fit for a Vite project).

## Architecture

Single-page React 19 + Vite app, JavaScript (`.jsx`, no TypeScript despite the `@types/react` devDependencies). Entry chain: [index.html](index.html) -> [src/main.jsx](src/main.jsx) (`createRoot` + `StrictMode`) -> [src/App.jsx](src/App.jsx).

The entire application lives in [src/App.jsx](src/App.jsx): a single `App` component holding all state as flat `useState` hooks (the `transactions` array seeded with hardcoded sample data, the four add-form fields, and the two filter selects). Derived values -- `totalIncome`, `totalExpenses`, `balance`, `filteredTransactions` -- are recomputed inline on every render. There are no other components, no routing, no state management library, no persistence (state is lost on reload), and no backend/API. Styling is plain CSS: global [src/index.css](src/index.css) plus [src/App.css](src/App.css) imported by `App`.

## Context: this is a deliberately flawed starter

Per [README.md](README.md), this is the starter project for a Claude Code course; it "intentionally has a bug, poor UI, and messy code -- all of which we fix together throughout the course." Do not treat the existing shape as an intended design to preserve. Known planted issues (leave them unless asked to fix):

- Amounts are stored as **strings**, so `reduce((sum, t) => sum + t.amount, 0)` in [src/App.jsx:25-31](src/App.jsx#L25-L31) string-concatenates instead of adding (`0 + "5000"` -> `"05000"`). This is the headline bug; totals and balance are wrong.
- The sample row `"Freelance Work"` is `type: "expense"` with `category: "salary"` ([src/App.jsx:9](src/App.jsx#L9)).
- The transactions table has a trailing empty `<th>`/`<td>` column ([src/App.jsx:135](src/App.jsx#L135), [src/App.jsx:147](src/App.jsx#L147)) -- a placeholder for a delete action that was never implemented.

## Conventions

- ESLint flat config in [eslint.config.js](eslint.config.js): `js.configs.recommended` + `react-hooks` + `react-refresh` (Vite preset), with `no-unused-vars` allowing uppercase-prefixed identifiers. `react-refresh/only-export-components` means a `.jsx` module exporting a component should not also export non-component values.
- Existing code mixes semicolon and no-semicolon lines and uses double-quoted JS strings inside `App.jsx`; match whatever the file around you does.
