# Contributing to IeltsVisual

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_NAME/time-visual-tool.git`
3. Create a branch: `git checkout -b feat/your-feature`
4. Install dependencies: `npm install`
5. Start dev server: `npm run dev`

## Before Submitting

- Run `npx tsc --noEmit` — no type errors
- Run `npx vite build` — production build passes
- Test your changes in the browser

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ielts): add vocabulary export button
fix(timer): correct pause duration calculation
docs: update README with PWA instructions
```

Prefixes: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code Style

- TypeScript strict mode
- Follow existing patterns (see `CLAUDE.md` for architecture notes)
- Use `useCallback`/`useMemo` for expensive computations
- No blocking loading spinners in dashboard components
- All user-facing strings in `src/i18n/locales/zh.json` and `en.json`

## Filing Issues

**Bug reports:** Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include steps to reproduce, expected vs actual behavior, and a screenshot if possible.

**Feature requests:** Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Explain the motivation and describe the desired behavior.

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Update i18n keys if adding user-facing text
- Add a brief description of what changed and why
