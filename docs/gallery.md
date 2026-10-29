# Gallery Module — Virtual Art Museum

A full-screen immersive virtual art gallery with 5 exhibition rooms, 15 masterpieces,
and 30+ interactive features. Inspired by the [Anthropic harness design article](https://www.anthropic.com/research/harness-design-long-running-apps).

## Quick Start

- **URL**: `#/gallery` or `#/gallery/{room-id}` or `#/gallery/{room-id}/{painting-id}`
- **Entry**: Overview dashboard → GALLERY card, or direct URL
- **Navigation**: Arrow keys, touch swipe, doorway clicks, dot indicators

## Rooms

| Room | ID | Paintings |
|------|----|-----------|
| Dutch Masters | `dutch-masters` | Girl with a Pearl Earring, The Night Watch, The Milkmaid |
| Impressionism | `impressionism` | The Starry Night, Water Lilies, Impression Sunrise |
| Renaissance | `renaissance` | Mona Lisa, The Birth of Venus, The Creation of Adam |
| Modern Art | `modern-art` | Guernica, The Persistence of Memory, Composition II |
| Eastern Art | `eastern-art` | The Great Wave, Shrimp (Qi Baishi), Mount Emei (Zhang Daqian) |

## Features

### Painting Modal (click any painting)
- **AI Narration**: first-person artist quotes with typewriter effect
- **X-ray Composition**: rule-of-thirds grid, golden ratio, diagonal overlay
- **Music**: Web Audio synthesized melody unique to each painting
- **Voice**: Web Speech API reads the painting story aloud
- **Magnifier**: 3x zoom lens on hover
- **Color Palette**: 5 extracted colors with hex codes
- **Data Card**: museum, estimated value, creation duration, incidents
- **Artist Bio**: click artist name for biography popup
- **Favorites**: ☆/★ toggle (localStorage)
- **Notes**: personal text notes per painting (localStorage)
- **Related**: same-artist and same-era painting suggestions

### Tools Menu (⋯ button, bottom-right)
- 🎲 **Random**: jump to a random painting
- 📈 **Timeline**: 500-year interactive timeline (1400–1950)
- 🎯 **Quiz**: guess-the-painting from a cropped clue
- 🧩 **Puzzle**: 3×3 sliding tile puzzle with any painting
- 🌍 **Map**: world map with museum location pins
- 📐 **Compare**: side-by-side painting comparison with stats
- 🎨 **Color Wheel**: HSL color analysis across all rooms
- 🏆 **Achievements**: 6 unlockable achievements

### Visual
- Museum wall (dark blue-gray) + 3D perspective checkered floor
- Gold painting frames with depth bevel
- Doorway navigation between rooms
- Painting-specific CSS animations (Starry Night glow, Water Lilies ripple)
- Staggered entrance animations, hover spotlight effects

## Architecture

```
src/components/gallery/
├── GalleryDashboard.tsx    # main layout + state management
├── GalleryExtras.tsx       # achievements, timeline, quiz
├── GalleryViews.tsx        # world map, comparison, color wheel
├── PuzzleGame.tsx          # 3×3 sliding puzzle
├── PaintingAudio.tsx       # Web Audio melodies + Speech API
├── DailyPainting.tsx       # overview card (daily painting)
└── __tests__/puzzle.test.ts

src/constants/
├── gallery.ts              # 5 rooms, 15 paintings, era stories
├── artists.ts              # 13 artist biographies
├── paintingData.ts         # quotes, museum, value, incidents
└── achievements.ts         # 6 achievement definitions

.claude/agents/
├── gallery-review.md       # orchestrator (launches all 4)
├── review-design.md        # design quality evaluator
├── review-originality.md   # originality evaluator
├── review-craft.md         # craft/engineering evaluator
└── review-functionality.md # functionality evaluator
```

## 4-Agent Review System

Based on the Anthropic article's GAN-style multi-agent evaluation.
Each agent scores independently (1–5), then results are aggregated.

Run: spawn `gallery-review` agent, which launches all 4 in parallel.

## Missing Images

4 paintings could not be downloaded due to Wikimedia rate limiting:
`guernica.jpg`, `persistence-memory.jpg`, `shrimp.jpg`, `mount-emei.jpg`

Run `bash scripts/download-missing-gallery-images.sh` to download them.
