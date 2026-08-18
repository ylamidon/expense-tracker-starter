---
name: deploy
description: Deploy this app to staging - runs the full test suite, builds the production bundle, then pushes the release to the staging branch. Use when the user says "deploy", "ship it", "push to staging", or asks for a staging release.
---

# Deploy

Three gates, run in order. **Each gate must pass before the next one starts.** A failure stops the deploy -- report what failed and stop; never skip a gate, never continue past a red one, never push an unbuilt or untested tree.

## Preflight

1. `git status --porcelain` -- the working tree must be clean. If it is dirty, stop and ask the user to commit or stash first; do not commit on their behalf.
2. `git rev-parse --abbrev-ref HEAD` -- note the current branch, you return to it at the end.
3. Check for a running dev server **before touching `node_modules`**:

   ```bash
   # Windows / Git Bash
   powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='esbuild.exe' OR Name='node.exe'\" | Where-Object { \$_.CommandLine -match 'vite|esbuild' } | Select-Object ProcessId, CommandLine"
   ```

   A live `npm run dev` holds `node_modules/@esbuild/*/esbuild.exe` open. On Windows any install that deletes that file fails with `EPERM` **partway through**, leaving `node_modules` half-deleted and the project unbuildable. If a dev server is running, do not run `npm ci` -- either use `npm install` (step 4) or ask the user to stop the server first.

4. Install dependencies only if they are actually out of sync -- **never on an mtime comparison**. `package-lock.json` is routinely a few seconds newer than `node_modules/` purely from install ordering, and that skew is not a dependency change:

   ```bash
   npm ls >/dev/null 2>&1 || npm install
   ```

   `npm ls` exits non-zero on missing, extraneous, or version-mismatched packages -- that is the real signal. Prefer `npm install`: it adds what is missing and is safe next to a running dev server. Reserve `npm ci` for a verified-clean reinstall with no dev server running, and know that it **wipes `node_modules` first**, so a mid-run failure is destructive.

   If an install does fail partway, treat repairing `node_modules` as the immediate priority -- verify with `npm ls` and the presence of `node_modules/.bin/vite` before continuing. Report the breakage and the repair; do not silently move on to the gates.

## Gate 1 -- Tests

```bash
npm test
```

**This repo has no test runner configured** (no `test` script in `package.json`, no test files). Until one is added, `npm test` exits non-zero -- that is a real failure, not noise. Do not work around it with `--if-present`, `|| true`, or by deleting the step. Two acceptable outcomes:

- Tell the user the deploy is blocked on a missing test suite and offer to set up Vitest (the natural fit for a Vite project).
- Proceed only if the user explicitly says to deploy without tests, and say so plainly in the final report.

Run `npm run lint` alongside the tests; ESLint is configured and a lint failure blocks the deploy too.

## Gate 2 -- Production build

```bash
npm run build
```

Vite writes to `dist/`. The build must exit 0. After it does, confirm `dist/index.html` and `dist/assets/` exist -- an exit-0 build with no output means something is misconfigured.

Do not deploy a dev build, and do not reuse a stale `dist/` from an earlier run: the build always reruns as part of the deploy.

## Gate 3 -- Push to staging

Staging for this repo is the `staging` branch on `origin` (`https://github.com/ylamidon/expense-tracker-starter.git`). There is no hosting target wired up yet -- if the user has one (Vercel, Netlify, an S3 bucket, an `rsync` host), ask once and record the answer here, replacing this section.

```bash
git push origin HEAD:staging
```

Then return to the original branch if anything checked it out. Confirm the push landed with `git ls-remote --heads origin staging`.

The pushed commit is whatever `HEAD` was at preflight -- the tested, built commit. Never push a different ref than the one the gates ran against.

## Report

State, in order: tests (pass/fail/skipped-and-why), build (pass/fail + output present), push (commit SHA and target branch). If the deploy stopped early, say which gate stopped it and paste the failing output.
