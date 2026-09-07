# TimeVisual

Visualize your every day — an open-source personal life tracking and visualization tool.

[中文](./README.md)

**Live Demo:** <https://clairelytt.github.io/time-visual-tool/>

---

## Features

### Time Tracking (TimeVisual)
- Add time entries (activity, duration, weight, category)
- Day/week/month/year donut chart visualization
- Auto-calculated totals and weighted durations
- Custom category management (color, name)
- Data import/export (JSON)

### Finance Tracking (MoneyVisual)
- Income/expense entries with expression input (e.g. `12+8-3`)
- Daily/monthly income & expense charts
- Category breakdown analysis
- Custom finance categories

### Eating Tracker (EatingVisual)
- Track daily meals and calorie intake
- Quick search and auto-fill for common foods
- Daily/monthly calorie charts
- Calorie breakdown analysis

### Diary (DiaryVisual)
- Day/week/month/year diary entries
- Gratitude & feelings tracking
- Goal setting & tracking
- Motivational quotes

### Sport Tracker (SportVisual)
- Track workouts, duration, calories burned
- Multiple sport type categories
- Daily/monthly exercise charts
- Weekly/monthly/yearly reflections
- Year-in-review summary

### User System
- Email registration & login (Firebase Auth)
- Multi-account support with per-user data isolation
- Remember password
- Switch account / Logout
- One-click data migration (localStorage → cloud)

### General
- Dark mode / Light mode / System default
- Chinese & English bilingual (i18next)
- Responsive layout, mobile-friendly
- Delete confirmation dialogs
- Error boundary for crash protection

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Date Utils:** date-fns
- **Routing:** React Router (HashRouter)
- **i18n:** i18next + react-i18next
- **Auth:** Firebase Auth
- **Database:** Cloud Firestore (per-user isolation)
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint + Prettier

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Develop

```bash
git clone https://github.com/ClaireLytt/time-visual-tool.git
cd time-visual-tool
npm install
```

Create a `.env` file with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the dev server:

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Test & Lint

```bash
npm run test
npm run lint
npm run format
```

---

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login, Register, Data Migration
│   ├── dashboard/      # Time tracking dashboard
│   ├── finance/        # Finance dashboard
│   ├── eating/         # Eating tracker dashboard
│   ├── diary/          # Diary dashboard
│   ├── sport/          # Sport tracker dashboard
│   ├── layout/         # Header, AppShell, BottomTabBar
│   └── icons/          # SVG icon components
├── contexts/           # AuthContext
├── hooks/              # useFirestore, useTimeEntries, and other custom hooks
├── i18n/               # i18n config & locale files
├── utils/              # Utility functions
├── firebase.ts         # Firebase initialization
├── App.tsx             # Route config
└── main.tsx            # App entry
```

---

## Completed Issues

| Issue | Description |
|-------|-------------|
| [#1](https://github.com/ClaireLytt/time-visual-tool/issues/1) | Implement time entry form |
| [#3](https://github.com/ClaireLytt/time-visual-tool/issues/3) | Update web link |
| [#5](https://github.com/ClaireLytt/time-visual-tool/issues/5) | Project improvements (dark mode, i18n, error boundary, etc.) |
| [#13](https://github.com/ClaireLytt/time-visual-tool/issues/13) | Enhance bookkeeping feature |
| [#15](https://github.com/ClaireLytt/time-visual-tool/issues/15) | Eating diary |
| [#17](https://github.com/ClaireLytt/time-visual-tool/issues/17) | Diary feature (gratitude, feelings, goals, motivation) |
| [#19](https://github.com/ClaireLytt/time-visual-tool/issues/19) | Sport record |
| [#21](https://github.com/ClaireLytt/time-visual-tool/issues/21) | User account & login (in progress) |

## License

MIT
