# IeltsVisual

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Demo-Live-blue)](https://ielts-visual.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://typescriptlang.org)

A clean, offline-first IELTS study tracker with built-in analytics, spaced repetition review, and AI-powered weekly reports.

![screenshot](.github/screenshot.png)

## ✨ Features

- 📝 **Practice Recording** — Log listening, reading, writing, and speaking sessions with scores, duration, and error tags
- 📊 **Analytics Dashboard** — Error distribution charts, score trend lines, subject radar, and per-question-type breakdown
- 🧠 **SM-2 Spaced Repetition** — Review mistakes and vocabulary on an adaptive schedule (forget → 1d, hard → 3d, easy → 7d)
- 📖 **Vocabulary System** — Collect words with phonetics and examples; flip-card review with completion reports
- 📅 **Weekly Report** — Auto-generated study recap with progress tracking, streak counter, and AI-powered insights
- 📋 **JSON Import** — Paste AI-organized study notes as structured JSON; validation, dedup, and selective import
- 🔍 **Knowledge Base** — Browse, filter, and edit all mistakes and expressions; inline editing with expandable cards
- ⏱ **Practice Timer** — Built-in stopwatch that auto-fills duration into the recording form
- 📱 **PWA** — Installable, works offline, standalone fullscreen mode

## 🚀 Quick Start

**Online Demo:** [https://ielts-visual.vercel.app](https://ielts-visual.vercel.app)

**Local Development:**

```bash
git clone https://github.com/ClaireLytt/time-visual-tool.git
cd time-visual-tool
npm install
npm run dev
```

**Environment Variables (optional):**

| Variable | Description |
|----------|-------------|
| Firebase config | Already configured in `src/firebase.ts` for the demo project |
| `ielts-ai-api-key` | Set in browser `localStorage` to enable AI weekly reports (OpenAI API key) |

To enable AI-generated weekly reports, open the browser console and run:
```js
localStorage.setItem('ielts-ai-api-key', 'sk-...')
```

## 📱 PWA Installation

1. Open the app in Chrome / Edge / Safari
2. Click "Install" in the address bar (or "Add to Home Screen" on mobile)
3. The app works offline after first load

## 📂 Project Structure

```
src/
├── components/
│   └── ielts/
│       ├── IeltsDashboard.tsx    # Main dashboard with tab navigation
│       ├── HomeView.tsx          # Home: stats, heatmap, review queue
│       ├── RecordView.tsx        # Practice recording with timer
│       ├── SessionList.tsx       # Compact session list with batch ops
│       ├── ImportView.tsx        # JSON import with validation
│       ├── KnowledgeView.tsx     # Mistake/expression knowledge base
│       ├── StatsView.tsx         # Analytics: charts, radar, rankings
│       ├── WeeklyView.tsx        # Weekly report with AI generation
│       ├── VocabView.tsx         # Vocabulary management
│       ├── VocabReviewSession.tsx # Flip-card vocabulary review
│       ├── MistakeReviewSession.tsx # Mistake review with SM-2
│       ├── sm2.ts                # SM-2 spaced repetition algorithm
│       ├── hooks.ts              # Firestore data hooks
│       ├── types.ts              # TypeScript type definitions
│       └── ...
├── hooks/
│   └── useFirestore.ts           # Generic Firestore hook with cache
├── firebase.ts                   # Firebase configuration
└── i18n/locales/                 # Chinese and English translations
```

## 🗺️ Roadmap

- [ ] Export weekly report as PDF with charts
- [ ] Reading passage practice with built-in timer and question types
- [ ] Multi-device sync with user accounts

## 🤝 Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

[MIT](LICENSE)

---

[中文文档](README.zh-CN.md)
