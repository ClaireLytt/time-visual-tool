# CLAUDE.md — Project Guidelines for AI Assistants

## Project

TimeVisual — a React 18 + TypeScript + Tailwind + Vite productivity app with Firebase backend.

## Build & Test
- 不允许运行/metr-finish
- 不允许出现选择题 你直接选择一个最合适的方案
- 不要重复问我同一个问题 你自己做最佳决定
- 可以改代码 但不允许删除现有的代码文件
- 不允许运行任何rm -f的命令
- 不允许自动merge pr
- 及时ship更新pr

- `cmd /c "npm run dev"` — start dev server (auto-opens browser)
- `npx tsc --noEmit` — type-check
- `npx vite build` — production build
- `npm test` — run vitest tests
- `npm run ui-audit` — automated browser UI inspection (see "UI Audit Workflow")

## UI Audit Workflow (REQUIRED after UI changes)

After **any code change that affects the UI**, and **before committing/pushing**, run the
ui-audit CLI against the modules you touched:

1. Make sure the dev server is running (`npx vite --port 5173 --strictPort`, background).
   If Tailwind/config colors were changed, restart it with `--force` to clear the cache.
2. Run the audit scoped to the affected modules, e.g.:
   ```bash
   node scripts/ui-audit.mjs --modes diary,overview
   ```
   (`npm run ui-audit` audits all modules.) The tool opens a real browser, switches to each
   module, exercises the page, and reports: console/page errors, failed requests, touch
   targets < 40px, horizontal overflow, banned blue-violet colors (hue 235-265 saturated),
   missing accessible names/alt, duplicate ids. Screenshots land in `ui-audit/` — read the
   screenshot of each changed screen to visually verify the change actually works.
3. **Fix every error-level finding automatically** (exit code 1 = errors present), re-run
   the audit until it's clean. Warn-level findings on screens you touched should be fixed
   too; pre-existing warnings elsewhere may be noted and left.
4. Only then run `npm run predeploy-check`, commit, and push.

Auth note: entering `/app` requires Firebase anonymous auth to be enabled, or
`UI_AUDIT_EMAIL` / `UI_AUDIT_PASSWORD` env vars for form login. If neither is available the
tool audits the landing page only — say so in the report to the user instead of skipping
silently. The app uses **HashRouter** (`#/app`, `#/login`, `#/register`).

## Architecture

- Data hooks: `src/hooks/use*Entries.ts` → all use `useFirestore<T>()` from `src/hooks/useFirestore.ts`
- Module wiring: AppShell.tsx (switch), BottomTabBar.tsx (TABS), Header.tsx (icons/titles), OverviewDashboard.tsx (cards)
- Types: `src/types/*.ts`
- i18n: `src/i18n/locales/zh.json` + `en.json`

## Design, Color, Canvas & TypeScript Rules

→ See `CODING_STANDARDS.md` for full rules (design palette, canvas, TS pitfalls).

Key: **no blue-purple** (hue 235-265), Morandi low-saturation palette, ES2020 target, `ease` tuples need `as [number, number, number, number]`.

### Pre-Push Verification
**ALWAYS** run `npm run predeploy-check` (or at minimum `npx tsc -b`) before pushing.

## Critical Rules

### NO BLOCKING LOADING SPINNERS

**NEVER** write `if (loading) { return <Spinner /> }` in dashboard components.

This pattern blocks the entire UI with a spinner on every tab switch, creating a terrible UX.
The `useFirestore` hook has:
1. An in-memory `cache` Map — data loaded once stays cached across component remounts
2. A 3-second timeout fallback — loading auto-resolves even if Firestore is slow/offline

Dashboard components should **always render their full UI**, even when `loading` is true.
When data hasn't arrived yet, the UI simply shows empty/zero state, then data appears.

**Bad:**
```tsx
if (loading) {
  return <div className="animate-spin" />  // ❌ Blocks entire dashboard
}
```

**Good:**
```tsx
// Just render normally — empty data is fine, it fills in when ready
return <div>{entries.length === 0 ? <EmptyState /> : <EntryList />}</div>
```

### Data Preloading

All module data hooks are preloaded in `AppShell.tsx` so that switching tabs is instant.
When adding a new module, add its `use*Entries()` call to the preload block in AppShell.

### Adding a New Module

→ See `docs/new-module.md` for the full 12-step checklist.
After wiring, run `npm run check-modules` to verify all registration points.

## CLI Issue Recording

**EVERY time a CLI script run hits a problem** (ui-audit findings/crash, predeploy-check failure,
dev-server issues, test failures, script bugs), record it in the `issue_recode/` folder:

1. The file is `issue_recode/<issue-number>.md`, where `<issue-number>` is the GitHub issue
   number of the task currently being worked on (e.g. the attached task's issue). If the file
   doesn't exist yet, create it.
2. Append a dated entry — date format is year-month-day (e.g. `2026-10-13`), one heading per day:

   ```markdown
   ## 2026-10-13
   - ui-audit: anonymous auth rejected (400), could not reach /app — enabled Anonymous sign-in in Firebase console
   - predeploy-check: TS2554 in OverviewDashboard (getEntry signature) — fixed call site
   ```

3. Write what went wrong AND how it was resolved (or that it's still open). Keep entries short.
4. Do this at the moment the problem is found, not batched at the end.

## Git & Commit Rules

### Branch Policy

**NEVER develop directly on `main`.** All new work must happen on a feature branch.

| Branch | Purpose | Who merges |
|--------|---------|-----------|
| `main` | Production-ready code only. Protected. | PR merge only. |
| `phantom` | Phantom of the Opera game development. | Merge to main via PR when milestone is complete. |
| `feature/*` | Other new features. | Merge to main via PR. |

**Before starting any work:**
1. Check which branch you're on: `git branch --show-current`
2. If on `main`, create or switch to the appropriate feature branch first
3. Never commit directly to `main` — always use a Pull Request

### Auto-Commit After Every Change

**ALWAYS** commit your changes after making any code modifications.
- Run `git add` and `git commit` immediately after finishing any code edits (e.g., adding a module, fixing a bug, or adjusting styles).
- Commit messages must be clear and descriptive (e.g., `feat: move game entry below settings`, `fix: change avatar color to muted gray-blue`).
- **NEVER** leave uncommitted changes in the working directory.
- **NEVER** add your own name, signature, `Co-authored-by` tag (e.g., `Co-authored-by: Claude`), or any AI attribution to the commit message or author fields.
