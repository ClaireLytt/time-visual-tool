# Adding a New Module — Checklist

1. `src/types/{module}.ts` — types
2. `src/constants/{module}.ts` — constants
3. `src/hooks/use{Module}Entries.ts` — hook (useFirestore)
4. `src/components/{module}/` — Dashboard, Form, Item, List components
5. `src/components/icons.tsx` — add icon
6. `src/i18n/locales/*.json` — add mode + module keys (`{module}App.title`)
7. `src/types/index.ts` — add to `AppMode` union
8. `src/components/layout/AppShell.tsx` — import, MODE_COLORS, validateMode, **preload hook**, switch case
9. `src/components/layout/BottomTabBar.tsx` — add to TABS (if applicable)
10. `src/components/layout/Header.tsx` — icon/title in MODE_CONFIG
11. `src/components/overview/OverviewDashboard.tsx` — add overview card
12. `tailwind.config.js` — add `mode.{module}` color
13. `src/constants/modes.ts` — add to MODE_ACCENT and MODE_SCENE

## Verification

Run `npm run check-modules` — it validates all wiring points and fails on any missing registration.

## Preloading

All module data hooks must be preloaded in `AppShell.tsx` so tab switching is instant.
Add `use{Module}Entries()` to the preload block. Modules without Firestore data (e.g. podcast, gallery) can skip this.
