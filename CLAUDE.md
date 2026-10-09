# CLAUDE.md — Project Guidelines for AI Assistants

## Project

TimeVisual — a React 18 + TypeScript + Tailwind + Vite productivity app with Firebase backend.

## Build & Test

- `cmd /c "npm run dev"` — start dev server (auto-opens browser)
- `npx tsc --noEmit` — type-check
- `npx vite build` — production build
- `npm test` — run vitest tests

## Architecture

- Data hooks: `src/hooks/use*Entries.ts` → all use `useFirestore<T>()` from `src/hooks/useFirestore.ts`
- Module wiring: AppShell.tsx (switch), BottomTabBar.tsx (TABS), Header.tsx (icons/titles), OverviewDashboard.tsx (cards)
- Types: `src/types/*.ts`
- i18n: `src/i18n/locales/zh.json` + `en.json`

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
