# Coding Standards — TimeVisual

Read at review time. For implementation-time rules, see `CLAUDE.md`.

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

## Common TypeScript Pitfalls

### ES Target Compatibility
Project target is **ES2020**. Do NOT use ES2022+ features:
- ❌ `new Error('msg', { cause: err })` — use `Object.assign(new Error('msg'), { cause: err })`
- ❌ `Array.at()`, `Object.hasOwn()` — use bracket access / `hasOwnProperty`

### Motion / Framer Motion Types
- `ease` must be a typed tuple, not a plain array:
  - ❌ `ease: [0.25, 0.1, 0.25, 1]`
  - ✅ `ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]`

### React Hook Imports
- Every hook you use (`useState`, `useMemo`, `useCallback`, `useEffect`, `useRef`) **must** be in the import statement.

### Optional vs Nullable Fields
- TypeScript `?:` fields are `T | undefined`, NOT `T | null`. Use `undefined` (or omit the field), never `null`.

### Unused Variables
- `tsconfig` has `noUnusedLocals` and `noUnusedParameters` enabled. Any declared-but-unused variable is a build error.

### ConfirmDialog Props
- The shared `ConfirmDialog` component uses `confirmVariant`, NOT `variant`.

### Removing Props from Types
- When deleting a prop from an interface/type, **also remove it from every call site**. Search all usages with grep before committing.

### String vs Number in Charts
- Firestore/form values are often `string`. Chart libraries (Recharts) expect `number`. Always convert with `Number()` or `parseFloat()` before passing to chart data.

### Windows Shell: gh CLI Body Argument
- `gh pr edit --body @- <<'EOF'` (Bash heredoc) does **NOT** work in Git Bash on Windows — `@-` becomes literal text.
- ✅ Use PowerShell with `$body = @"..."@` variable, then `gh pr edit --body $body`.
