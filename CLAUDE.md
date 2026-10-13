# CLAUDE.md — Project Guidelines for AI Assistants

## Project

TimeVisual — a React 18 + TypeScript + Tailwind + Vite productivity app with Firebase backend.

## Build & Test

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

## Design / Color Rules

### NO Blue-Purple (pure purple is allowed)

**NEVER** use blue-purple/violet (hue ~235-265), bright blue-purple gradients, or purple-blue color schemes anywhere in the UI. **Pure purple (hue ~270-300) is allowed** when muted — the user approved it for the diary accent (e.g. `#b09cc4`).

The overall palette is **Morandi / low-saturation**: muted warm grays, haze blue (雾霾蓝), gray-green, dusty tones:
- Avatar backgrounds: solid `#8B9DAB` (muted gray-blue), not gradients
- Neutral accents: `#7B929F`, `#9AABB5`, `#A3B5BF` range; ink/borders `#a39b8d`
- Avoid: `blue-400 to purple-500` style gradients, any saturated `violet-*`/`indigo-*` (hue 235-265 with saturation > ~45%), high-saturation colors in general

## Canvas Game Rules

### Button Placement
**NEVER** place interactive buttons at the browser viewport edge (e.g. `W - pad`, `0 + pad`). Buttons must be positioned **near related UI elements** — beside a panel, below a timer, inside a HUD cluster. Edge-positioned buttons are hard to tap on mobile and look disconnected from the game UI.

### Emoji Rendering
Canvas renders emoji as bitmaps that blend with the background. On dark backgrounds, emoji appear muddy/dark. **Always** draw an opaque white circle (`rgba(255,255,255, 0.85)`) behind each emoji before drawing it with `fillText`.

## Common TypeScript Pitfalls (avoid these)

### ES Target Compatibility
Project target is **ES2020**. Do NOT use ES2022+ features:
- ❌ `new Error('msg', { cause: err })` — use `Object.assign(new Error('msg'), { cause: err })`
- ❌ `Array.at()`, `Object.hasOwn()` — use bracket access / `hasOwnProperty`

### Motion / Framer Motion Types
- `ease` must be a typed tuple, not a plain array:
  - ❌ `ease: [0.25, 0.1, 0.25, 1]`
  - ✅ `ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]`

### React Hook Imports
- Every hook you use (`useState`, `useMemo`, `useCallback`, `useEffect`, `useRef`) **must** be in the import statement. Do NOT assume the previous import covers it.

### Optional vs Nullable Fields
- TypeScript `?:` fields are `T | undefined`, NOT `T | null`. When constructing objects with optional fields, use `undefined` (or omit the field), never `null`.

### Unused Variables
- `tsconfig` has `noUnusedLocals` and `noUnusedParameters` enabled. Any declared-but-unused variable is a build error. Remove it or use it.

### ConfirmDialog Props
- The shared `ConfirmDialog` component uses `confirmVariant`, NOT `variant`. Always check the actual prop name before using it:
  - ❌ `<ConfirmDialog variant="danger" />`
  - ✅ `<ConfirmDialog confirmVariant="danger" />`

### Removing Props from Types
- When deleting a prop from an interface/type, **also remove it from every call site**. Search all usages with grep before committing.

### String vs Number in Charts
- Firestore/form values are often `string`. Chart libraries (Recharts) expect `number`. Always convert with `Number()` or `parseFloat()` before passing to chart data.

### Windows Shell: gh CLI Body Argument
- `gh pr edit --body @- <<'EOF'` (Bash heredoc) does **NOT** work in Git Bash on Windows — `@-` becomes literal text.
- ✅ Use PowerShell with `$body = @"..."@` variable, then `gh pr edit --body $body`.

### Pre-Push Verification
**ALWAYS** run `npm run predeploy-check` (or at minimum `npx tsc -b`) before pushing. IDE type-checking may miss errors that the strict CLI build catches.

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

### Adding a New Module Checklist

1. `src/types/{module}.ts` — types
2. `src/constants/{module}.ts` — constants
3. `src/hooks/use{Module}Entries.ts` — hook (useFirestore)
4. `src/components/{module}/` — Dashboard, Form, Item, List components
5. `src/components/icons.tsx` — add icon
6. `src/i18n/locales/*.json` — add mode + module keys
7. `src/types/index.ts` — add to `AppMode` union
8. `src/components/layout/AppShell.tsx` — import, MODE_COLORS, validateMode, **preload hook**, switch case
9. `src/components/layout/BottomTabBar.tsx` — add to TABS
10. `src/components/layout/Header.tsx` — icon/title/subtitle/border
11. `src/components/overview/OverviewDashboard.tsx` — add overview card
12. `tailwind.config.js` — add `mode.{module}` color

## Git & Commit Rules

### Auto-Commit After Every Change

**ALWAYS** commit your changes after making any code modifications.
- Run `git add` and `git commit` immediately after finishing any code edits (e.g., adding a module, fixing a bug, or adjusting styles).
- Commit messages must be clear and descriptive (e.g., `feat: move game entry below settings`, `fix: change avatar color to muted gray-blue`).
- **NEVER** leave uncommitted changes in the working directory.
- **NEVER** add your own name, signature, `Co-authored-by` tag (e.g., `Co-authored-by: Claude`), or any AI attribution to the commit message or author fields.
