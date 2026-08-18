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

Four components, one file each, flat in [src/](src/) -- no `components/` directory, no routing, no state management library, no persistence (state is lost on reload), no backend/API:

```
App  (src/App.jsx)                              state: transactions, const categories
|-- Summary          transactions               derives totalIncome / totalExpenses / balance
|-- TransactionForm  categories, onAdd          state: description, amount, type, category
+-- TransactionList  transactions, categories   state: filterType, filterCategory
```

`App` is a composition root: it owns only `transactions` (the one piece of shared state) and hands `addTransaction` to the form as `onAdd`. Each child keeps the state nobody else needs -- form fields in [src/TransactionForm.jsx](src/TransactionForm.jsx), filter selects in [src/TransactionList.jsx](src/TransactionList.jsx). Derived values (`totalIncome`, `totalExpenses`, `balance` in [src/Summary.jsx](src/Summary.jsx); `filteredTransactions` in `TransactionList`) are recomputed inline on every render -- no memoization. `categories` lives in `App` and is prop-drilled to both children.

Transaction shape: `{ id, description, amount, type, category, date }` where `amount` is a **number** and `type` is `"income" | "expense"`. The form's `amount` input state is a string (a controlled `<input>` requires that) and is converted with `Number()` at insertion, in [src/TransactionForm.jsx:16](src/TransactionForm.jsx#L16).

Styling is plain CSS, no CSS modules: global [src/index.css](src/index.css) plus [src/App.css](src/App.css) imported once by `App`. Child components use its class names (`.summary-card`, `.add-transaction`, `.transactions`, `.income-amount`, `.expense-amount`) without importing anything.

## Context: this is a deliberately flawed starter

Per [README.md](README.md), this is the starter project for a Claude Code course; it "intentionally has a bug, poor UI, and messy code -- all of which we fix together throughout the course." Do not treat the existing shape as an intended design to preserve.

Already fixed (do not reintroduce): amounts used to be stored as strings, so `sum + t.amount` string-concatenated instead of adding (`0 + "5000"` -> `"05000"`) and every total was wrong. Fixed at the source by typing the seed data numerically and wrapping the form input in `Number()`, which is why the reduces in `Summary` need no coercion.

Remaining planted issues (leave them unless asked to fix):

- The sample row `"Freelance Work"` is `type: "expense"` with `category: "salary"` ([src/App.jsx:12](src/App.jsx#L12)), so it counts against the balance.
- The transactions table has a trailing empty `<th>`/`<td>` column ([src/TransactionList.jsx:39](src/TransactionList.jsx#L39), [src/TransactionList.jsx:51](src/TransactionList.jsx#L51)) -- a placeholder for a delete action that was never implemented.

## Conventions

- ESLint flat config in [eslint.config.js](eslint.config.js): `js.configs.recommended` + `react-hooks` + `react-refresh` (Vite preset), with `no-unused-vars` allowing uppercase-prefixed identifiers. `react-refresh/only-export-components` means a `.jsx` module exporting a component should not also export non-component values -- so shared constants belong in a `.js` module or a prop, not alongside a component export.
- One component per file, named the same as the file, `export default` at the end with no trailing semicolon.
- Imports use single quotes; JS string literals inside components use double quotes. Semicolon usage is inconsistent (import lines have none, statements do); match whatever the file around you does.
