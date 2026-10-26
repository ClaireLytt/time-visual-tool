# PRD: Phantom of the Opera — Scene 1: Paris Opera House

> **Status**: Draft  
> **Author**: Claire  
> **Date**: 2026-10-26  
> **Repo**: `time-visual-tool` (new module, shares Vite + React stack)  
> **Engine**: React Three Fiber (R3F) + drei + Tone.js  

---

## 1. Vision

A first-person, cinematic, music-driven browser 3D experience set in the Paris Opera House (Palais Garnier). The player explores gilded halls, discovers hidden collectibles left by the Phantom, and triggers an escalating atmospheric narrative — culminating in the iconic chandelier drop. No combat, no puzzles — pure exploration and atmosphere.

**Tone**: Gothic romance, 19th-century grandeur, creeping dread.  
**Duration**: 10–15 minutes per playthrough.  
**Platform**: Modern desktop browser (Chrome / Edge, WebGL 2).

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Renderer | React Three Fiber (R3F) | Declarative 3D in existing React + Vite stack |
| 3D Helpers | `@react-three/drei` | OrbitControls → PointerLockControls, useGLTF, Environment, etc. |
| Physics | `@react-three/rapier` | Collision walls, floor, gravity for the player capsule |
| Audio | Tone.js + Web Audio API | Adaptive layered music, spatial ambient audio |
| Styling | Tailwind CSS (existing) | 2D UI overlays (inventory, prompts, menus) |
| Build | Vite (existing) | Fast HMR, asset pipeline |
| State | Zustand | Lightweight game state (inventory, progression, area) |

---

## 3. Domain Glossary

| Term | Definition |
|------|-----------|
| **Scene** | A self-contained narrative chapter. Scene 1 = Paris Opera House. Each scene is one deployable 3D environment. |
| **Area** | A navigable sub-region within a Scene (Grand Foyer, Grand Staircase, Auditorium, Backstage Corridor). Connected via Passages. |
| **Passage** | A connection between Areas — either seamless (same 3D space) or a fade-transition (separate loaded space). |
| **Collectible** | An interactive object the player picks up: letters, sheet music, phantom marks. Stored in Inventory. |
| **Clue** | A non-collectible environmental detail that reacts to interaction (flickering light, whisper) but isn't taken. |
| **Music Cue** | A scored audio event: entering an Area, finding a Collectible, or hitting a Narrative Trigger. |
| **Narrative Trigger** | A condition (area + collectibles + progression) that fires a story beat: lighting change, sound, environmental shift. |
| **Inventory** | The player's collected items, accessed via Tab key as a leather journal UI. |
| **Player State** | Position, rotation, collected items, triggered events, current music layers. Not persisted (no save in v1). |
| **Phantom Presence** | The set of escalating environmental effects (lights, whispers, shadows, roses) conveying the Phantom without showing him. |

---

## 4. Areas

### 4.1 Grand Foyer (Entry Point)

**Architecture**: A vast gilded hall — marble floors, painted ceiling, ornate columns, mirrored walls. Chandeliers (non-interactive, ambient). Modeled as a rectangular hall ~30m × 15m × 12m high.

**Geometry**:
- Floor: procedural marble PBR (white/gray veined, reflective)
- Walls: gilded panels (gold metallic PBR) with mirror sections (reflective plane or cubemap)
- Ceiling: painted fresco (placeholder texture, swappable)
- Columns: cylindrical, Corinthian capital (simplified geometry)
- Furniture: marble busts on pedestals (3–4), velvet benches

**Lighting**:
- Baked ambient: warm golden indirect light
- Real-time: 2 chandelier point lights (warm white, subtle flicker animation), candle sconces on walls

**Ambient Audio**: Footstep echoes on marble, distant ghostly crowd murmur (low volume, spatial)

**Collectibles**:
1. **Christine's Letter** — A sealed envelope tucked behind a marble bust near the east wall. Proximity: dust motes catch golden light within 3m. Interaction: press E → pickup animation (letter lifts and rotates) → full-screen parchment overlay with handwritten text.
2. **Phantom's Wax Seal** — A red skull-stamped wax seal pressed into a wall panel near the entrance to the Staircase. Proximity: candle sconce nearby flickers more intensely within 3m. Interaction: press E → close-up zoom → collectible stored.

**Passage to Grand Staircase**: Seamless — an open archway at the north end of the Foyer. No loading, continuous geometry.

---

### 4.2 Grand Staircase

**Architecture**: The iconic double-return marble staircase. Two flights converge at a landing, then split again upward. Balustrades, statuary, a high vaulted ceiling with painted dome.

**Geometry**:
- Stairs: marble steps (procedural PBR, same as Foyer floor but with gold-veined variant)
- Balustrades: ornate railing with simplified balusters
- Landing: circular platform ~8m diameter
- Ceiling dome: hemisphere with painted texture (placeholder)
- Statuary: 2 angel figures flanking the landing (low-poly placeholder)

**Lighting**:
- Baked ambient: cooler than Foyer (moonlight through high windows)
- Real-time: 1 overhead dome light, 2 wall sconces

**Ambient Audio**: Wind through high windows (subtle), creaking wood from upper floors, echoed footsteps (more reverb than Foyer)

**Collectibles**:
3. **"Angel of Music" Sheet Music** — A page wedged between banister rails on the first landing. Proximity: the page gently flutters (vertex animation). Interaction: press E → pickup → full-screen sheet music display with notation imagery.

**Passages**:
- South: seamless back to Grand Foyer
- Top of stairs: a grand set of doors leading to the Auditorium (fade-to-black transition, ~1.5s)

---

### 4.3 Auditorium

**Architecture**: The main theater — a horseshoe-shaped hall with tiered balconies, red velvet seats, a proscenium stage, and the **grand chandelier** hanging from the center of the domed ceiling.

**Geometry**:
- Seating: rows of red velvet seats (instanced low-poly, ~500 visible seats using instanced mesh)
- Balconies: 3 tiers of box seats, gold-trimmed railings
- Stage: wooden floor with red curtain (cloth simulation or static draped mesh)
- Chandelier: detailed model — crystal pendants (glass PBR, refractive), gold frame, candle lights. **This is the climax prop — highest detail budget.**
- Box 5: the Phantom's box — identifiable by a slight discoloration and a rose on the railing

**Lighting**:
- Baked ambient: dim, warm — as if lit only by the chandelier and stage footlights
- Real-time: chandelier (cluster of 6 point lights, warm yellow), stage footlights (3 spotlights), Box 5 has a slightly cooler light (eerie)

**Ambient Audio**: Deep silence punctuated by occasional seat creaks, chandelier crystal tinkling (spatial, from above), distant echo

**Collectibles**:
4. **Phantom's Demand Letter** — A note pinned to the velvet chair in Box 5. Proximity: the Box 5 light flickers cold blue. Interaction: press E → pickup → parchment overlay with threatening handwritten text.
5. **"Music of the Night" Full Score** — On the conductor's stand in the orchestra pit below the stage. Proximity: faint organ note swells. Interaction: press E → pickup → sheet music overlay.

**Passages**:
- Main doors (rear): fade transition back to top of Grand Staircase
- Side passage (stage left): a narrow door leading to Backstage Corridor (fade transition)

---

### 4.4 Backstage Corridor

**Architecture**: Narrow, darker passage behind the stage. Exposed brick walls, gas lamp sconces, dressing room doors (closed, non-interactive except one). Pipes along the ceiling. The atmosphere shifts — oppressive, claustrophobic.

**Geometry**:
- Corridor: ~3m wide × 20m long × 3m high (tight after the grand spaces)
- Walls: exposed brick PBR (dark red-brown)
- Doors: 4 wooden doors along the left wall (non-interactive, one slightly ajar)
- Pipes: cylindrical meshes along ceiling (copper PBR)
- At the far end: a **locked iron door** with the Phantom's skull seal embossed on it

**Lighting**:
- No baked ambient — entirely real-time: flickering gas lamps (4 point lights, warm orange, animated flicker). Much darker than other areas.
- The locked door: a faint green-tinged light seeps from under it

**Ambient Audio**: Dripping water (spatial, from pipes), distant rats scurrying, muffled organ from far away (filtered low-pass), creaking

**Collectibles**:
6. **Threatening Note** — Slipped under the ajar dressing room door. Proximity: the door creaks slightly. Interaction: press E → pickup → parchment overlay.
7. **Black-Ribbon Rose** — A single red rose with a black ribbon, on the floor 2m before the locked door. Proximity: strong phantom presence effects (shadow movement, whisper). Interaction: press E → pickup. **This is the final collectible — triggers the climax if all 7 are found.**

**The Locked Door**: Always locked. After the climax event, it creaks open to reveal a spiral staircase descending into darkness. Player cannot enter — camera pushes toward it, then fade to "To be continued…"

---

## 5. Player Controls

| Action | Input | Behavior |
|--------|-------|----------|
| Move | WASD | Cinematic slow walk (~2.5 m/s). No sprint. |
| Look | Mouse (pointer lock) | Smooth mouselook, slight camera sway (sinusoidal, 0.3° amplitude, 2s period) |
| Interact | E | Context-sensitive: pick up collectible, examine clue. Only active when crosshair is on interactable within 2m. |
| Inventory | Tab | Toggle leather journal overlay |
| Pause | Escape | Release pointer lock + show pause menu (Resume / Restart / Controls) |
| Resume | Click on game | Re-engage pointer lock, dismiss pause |

**Player Capsule**: Rapier kinematic capsule collider (0.5m radius, 1.8m height). No jump. Gravity applied. Collision with walls, furniture, railings.

**Camera**: Positioned at capsule top (eye height ~1.7m). No head bob — subtle horizontal sway only.

---

## 6. Interaction System

### 6.1 Detection

- Raycast from camera center, max distance 3m
- Hit test against objects tagged `interactable`
- When ray hits interactable within 2m: show prompt "E — Examine" (or "E — Pick up") below crosshair
- When ray hits interactable between 2m–3m: no prompt, but proximity effects activate

### 6.2 Proximity Effects

When player is within 3m of a collectible (not yet collected):
- **Dust motes**: particle system — small bright points drifting upward in a 1m radius around the object
- **Item-specific cue**: per collectible (see Area descriptions — fluttering page, flickering sconce, creaking door, etc.)

### 6.3 Pickup Flow

1. Player presses E within 2m, looking at collectible
2. Player controls disabled (0.8s)
3. Object lifts off surface, rotates toward camera (tween, 0.6s, ease-out)
4. Crossfade to full-screen overlay (0.2s)
5. Overlay: styled parchment/sheet music, readable text, "Click or press any key to close" prompt
6. On dismiss: item added to inventory, proximity effects cease, object removed from world
7. Music layer check: if collectible count crosses a threshold → new music layer fades in (4s crossfade)
8. If all 7 collected → trigger climax event

---

## 7. Phantom Presence System

Escalating environmental effects based on collectibles found. Never a visible character — always indirect.

### Escalation Tiers

| Tier | Trigger | Effects |
|------|---------|---------|
| **Ambient** | Always (0 collectibles) | Base organ drone per area. Occasional chandelier crystal tinkle. |
| **Stirring** | 1–2 collectibles | Lights in current area flicker briefly every 30–60s (random interval). Distant organ note (non-spatial, filtered). |
| **Watching** | 3–4 collectibles | Add whisper sound effects (spatial, from behind player, ~15s interval). Rose petals appear on ground near uncollected items (particle trail, 5–8 petals, slow drift). |
| **Stalking** | 5–6 collectibles | Add shadow movement: a dark translucent shape darts across peripheral vision (shader overlay, ~20% opacity, 0.3s, triggered when player turns quickly). Gas lamps in Backstage flicker violently. |
| **Climax** | 7 collectibles | Full event sequence (see §8). |

### Implementation Notes

- Flickering lights: animate point light `intensity` with noise function (Perlin, frequency increases with tier)
- Whispers: pool of 4–5 short audio clips, spatialized behind/beside player, random selection
- Rose petals: instanced mesh particles, gravity + slight wind drift, spawn near uncollected items only
- Shadow: screen-space post-processing effect — dark radial gradient that sweeps from edge to center over 0.3s, only triggers on rapid camera rotation (delta > 90°/s)

---

## 8. Climax Event: The Chandelier Drop

Triggered immediately when the 7th collectible is picked up and its overlay is dismissed.

### Sequence (total ~25s)

| Time | Event |
|------|-------|
| 0.0s | All lights cut to black (0.3s fade). Silence — all audio stops. |
| 0.5s | A single organ chord (low C, fortissimo) hits. Sustained. |
| 1.0s | Player controls locked. Camera begins slow auto-pan upward toward chandelier (if in Auditorium) or toward ceiling (if elsewhere). |
| 2.0s | The chandelier begins to sway. Crystal tinkling grows loud. Chains creak. |
| 4.0s | Full orchestral layer (Layer 5) erupts — timpani roll + full strings + choir. |
| 5.0s | Chandelier chain snaps (particle burst — sparks). Chandelier drops. |
| 5.5s | Impact: screen shake (camera displacement, dampened spring, 1s). Crash sound. Crystal shatter particles. Dust cloud (volumetric particle). |
| 7.0s | Phantom's laugh — a deep, reverberant laugh echoing through the space. 3s duration. |
| 10.0s | Music subsides to a solo organ, melancholic. Lights slowly return to half intensity. |
| 12.0s | If player is not in Backstage: a text prompt appears — "The passage behind the stage…" (guiding player to Backstage). Player controls restored. |
| 12.0s | If player is in Backstage: the locked door creaks open. Green light spills out. Camera auto-pushes toward the doorway. |
| 18.0s | Camera reaches the doorway threshold. A spiral staircase descending into darkness is visible. |
| 22.0s | Fade to black. |
| 24.0s | Title card: "To be continued…" in serif font over black. Organ fades. |
| 28.0s | Return to main menu (or reload option). |

### If player is NOT in the Auditorium when the 7th collectible is found:
- The chandelier crash is heard as a distant boom + screen shake (reduced intensity)
- The player sees dust particles fall from the ceiling
- The guiding text prompt leads them to the Backstage Corridor
- When they enter the Auditorium (optional), they see the fallen chandelier on the ground, wreckage, dust still settling

---

## 9. Adaptive Music System

Built on Tone.js. Five concurrent audio layers, mixed in real-time.

### Layer Architecture

```
┌──────────────────────────────────────────────────┐
│                  Master Output                    │
│  ┌──────────┬──────────┬────────┬───────┬──────┐ │
│  │ Layer 1  │ Layer 2  │Layer 3 │Layer 4│Layer5│ │
│  │  Organ   │ Strings  │  Harp  │ Choir │ Full │ │
│  │  (base)  │          │        │       │      │ │
│  └──────────┴──────────┴────────┴───────┴──────┘ │
│       ↑           ↑         ↑        ↑       ↑   │
│    always     1 found   3 found  5 found  climax │
└──────────────────────────────────────────────────┘
```

### Per-Area Base Variations

The organ base layer has a different loop per Area:
- **Grand Foyer**: warm, major-key, stately (C major, legato)
- **Grand Staircase**: transitional, rising motif (ascending C → G)
- **Auditorium**: mysterious, minor-key (A minor, tremolo)
- **Backstage Corridor**: dissonant, sparse (tritone intervals, long decay)

Crossfade between area loops: 3s linear crossfade on area transition.

### Layer Activation

Each layer above Layer 1 starts at volume 0 (muted). When the collectible threshold is crossed:
1. Target layer volume ramps from 0 to 1 over 4 seconds (exponential ramp)
2. A one-shot "sting" plays simultaneously (a short musical accent matching the layer's instrument)
3. Layer stays active for the rest of the session

### Audio Format

- Placeholder: synthesized via Tone.js (Synth, PolySynth, AMSynth for organ, FMSynth for strings)
- Production: `.ogg` loops (fallback `.mp3`), loaded via Tone.js `Player`
- All loops: 8-bar, 120 BPM, seamless loop points
- Spatial ambient sounds: `PositionalAudio` (Three.js built-in) attached to world positions

---

## 10. UI Overlays (2D, Tailwind)

All 2D UI is rendered as HTML overlays on top of the R3F canvas, styled with Tailwind. Pointer events pass through to canvas except when overlays are active.

### 10.1 Crosshair

- Center screen, always visible during gameplay
- Thin white cross, 20px arms, 1px stroke, 50% opacity
- No animation

### 10.2 Interaction Prompt

- Appears below crosshair when looking at interactable within 2m
- Text: `[E] Pick up` or `[E] Examine`
- Style: white text, 14px, slight text-shadow for readability, fade-in 0.2s

### 10.3 Collectible Overlay (Parchment)

- Full-screen semi-transparent black backdrop (80% opacity)
- Centered parchment card: max 600px wide, aged paper background (CSS gradient — no image needed), torn-edge border effect (CSS clip-path)
- Title: collectible name in serif font (Playfair Display from Google Fonts)
- Body: handwritten-style text (Caveat from Google Fonts) for letters; for sheet music, a placeholder SVG staff with notes
- Footer: "Click anywhere to close" — 12px, 50% opacity
- Entry animation: scale 0.9 → 1.0, opacity 0 → 1, 0.3s ease-out

### 10.4 Inventory Journal

- Toggle with Tab
- Full-screen overlay, same backdrop as parchment
- A leather-textured book (CSS gradient: dark brown, subtle grain via repeating-linear-gradient)
- Left page: list of collected items (name + icon + "Found in [Area]"). Uncollected items shown as "???"
- Right page: selected item's full content (same as parchment view)
- Collectible count: "3 / 7" at bottom of left page
- Entry animation: book "opens" — rotateY 3D transform, 0.4s

### 10.5 Pause Menu

- Centered card on dark backdrop
- Three buttons stacked: **Resume** / **Restart** / **Controls**
- Controls sub-screen: key binding table
- Style: matches parchment aesthetic (aged paper, serif headings)

### 10.6 Loading Screen (Curtain Rise)

- Full-screen red (#8B1A1A, muted Morandi red) background
- Title: "The Phantom of the Opera" in gold serif (Playfair Display)
- Subtitle: "Scene I — The Paris Opera House"
- Progress: thin gold line at bottom, width = load percentage
- When loading completes: the red splits vertically from center (CSS clip-path animation, 2s ease-in-out), revealing the 3D scene behind it
- Curtain halves slide off-screen left and right
- After curtains clear: pointer lock engages, gameplay begins

### 10.7 End Card

- Fade-in from black (1s)
- "To be continued…" — Playfair Display, gold (#C5A55A), centered
- Below: "Scene II — The Labyrinth Below" (teaser, 60% opacity)
- Below that: "Play Again" button
- Subtle particle effect: golden dust motes drifting upward

---

## 11. File Structure

```
src/
├── phantom/                          # All game code isolated here
│   ├── PhantomGame.tsx               # Top-level component: canvas + overlays
│   ├── store.ts                      # Zustand store: player state, inventory, progression
│   ├── constants.ts                  # Collectible definitions, area configs, music configs
│   ├── types.ts                      # TypeScript types: Area, Collectible, PhantomTier, etc.
│   │
│   ├── scene/
│   │   ├── Scene1.tsx                # Top-level 3D scene: loads areas, lighting, player
│   │   ├── Player.tsx                # First-person controller: capsule + camera + pointer lock
│   │   ├── areas/
│   │   │   ├── GrandFoyer.tsx        # Foyer geometry, materials, lights, collectibles
│   │   │   ├── GrandStaircase.tsx    # Staircase geometry
│   │   │   ├── Auditorium.tsx        # Auditorium + chandelier
│   │   │   └── BackstageCorridor.tsx # Corridor + locked door
│   │   ├── objects/
│   │   │   ├── Collectible.tsx       # Generic collectible component (proximity, pickup)
│   │   │   ├── Chandelier.tsx        # The chandelier (animated, destructible for climax)
│   │   │   ├── LockedDoor.tsx        # The door that opens post-climax
│   │   │   └── GasLamp.tsx           # Flickering lamp component
│   │   └── effects/
│   │       ├── PhantomPresence.tsx   # Escalating environmental effects controller
│   │       ├── DustMotes.tsx         # Proximity particle system
│   │       ├── RosePetals.tsx        # Petal particle trail
│   │       ├── ShadowDart.tsx        # Peripheral shadow post-effect
│   │       └── ClimaxSequence.tsx    # Chandelier drop orchestrator
│   │
│   ├── audio/
│   │   ├── MusicEngine.ts           # Tone.js adaptive layer system
│   │   ├── AmbientAudio.tsx          # Per-area environmental sounds (R3F PositionalAudio)
│   │   └── sfx.ts                    # One-shot sound effects (pickup, crash, whisper, laugh)
│   │
│   └── ui/
│       ├── Crosshair.tsx             # Minimal crosshair overlay
│       ├── InteractionPrompt.tsx     # "[E] Pick up" contextual prompt
│       ├── ParchmentOverlay.tsx      # Full-screen collectible reader
│       ├── InventoryJournal.tsx      # Tab-toggled journal
│       ├── PauseMenu.tsx             # ESC menu
│       ├── LoadingCurtain.tsx        # Red curtain loading screen
│       └── EndCard.tsx               # "To be continued" end screen
│
├── components/
│   └── layout/
│       └── AppShell.tsx              # Add 'phantom' mode routing
│
public/
└── phantom/
    ├── audio/                        # Production audio files (later)
    ├── models/                       # GLTF models (later)
    └── textures/                     # PBR texture maps (later)
```

---

## 12. Performance Budget

| Metric | Target |
|--------|--------|
| Initial load | < 8s on 50 Mbps |
| Frame rate | 60 FPS on GTX 1060 / M1 Mac |
| Draw calls | < 200 per frame |
| Triangle count | < 500K total scene |
| Texture memory | < 256 MB |
| Audio memory | < 50 MB |
| JS bundle (game code) | < 500 KB gzipped |

### Optimization Strategies
- Instanced meshes for repeated geometry (seats, balusters, candles)
- LOD for distant objects (drei `<Detailed>`)
- Frustum culling (R3F default)
- Texture atlasing for PBR materials
- Audio: lazy-load layers on first interaction (avoid autoplay policy issues)
- Code-split `phantom/` module (dynamic import in AppShell)

---

## 13. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC1 | Player spawns in Grand Foyer in first-person view with pointer lock | Manual: load game, verify camera position and pointer lock |
| AC2 | WASD moves player at cinematic speed with subtle camera sway | Manual: walk around, verify speed feels slow/deliberate |
| AC3 | All 4 areas are reachable via their passages | Manual: navigate Foyer → Staircase → Auditorium → Backstage |
| AC4 | Proximity particles appear within 3m of uncollected collectibles | Manual: approach each collectible, verify dust motes |
| AC5 | Pressing E within 2m picks up collectible and shows parchment overlay | Manual: collect all 7, verify each overlay |
| AC6 | Inventory journal (Tab) shows collected items with "Found in [Area]" | Manual: press Tab, verify all entries |
| AC7 | Organ base layer plays on game start, varies by area | Listen: walk between areas, verify crossfade |
| AC8 | Music layers activate at 1, 3, 5, and 7 collectibles | Listen: collect items, verify new instruments fade in |
| AC9 | Phantom presence escalates per tier table (§7) | Manual: progress through tiers, verify each effect |
| AC10 | Collecting all 7 triggers chandelier climax sequence | Manual: collect all, verify sequence plays per §8 |
| AC11 | After climax, Backstage locked door opens revealing staircase | Manual: go to Backstage post-climax, verify door |
| AC12 | End card displays "To be continued…" with play-again option | Manual: let sequence finish, verify end card |
| AC13 | Loading screen shows red curtain that parts on load complete | Manual: hard refresh, verify curtain animation |
| AC14 | ESC opens pause menu, click resumes with pointer lock | Manual: press ESC, verify menu, click resume |
| AC15 | 60 FPS on target hardware (GTX 1060 equivalent) | DevTools: performance tab, verify frame times < 16.7ms |

---

## 14. Out of Scope (v1)

- Mobile / touch controls
- Save / resume functionality
- Voice acting or recorded dialogue
- Multiplayer
- AI-generated textures (GPT image)
- Scene 2 (the labyrinth) — only teased
- VR / WebXR support
- Leaderboards or achievements
- Localization (English only for game content)

---

## 15. Open Risks

| Risk | Mitigation |
|------|-----------|
| Procedural PBR may not look "cinematic" enough | Design modular material system — swap in authored textures without code changes |
| Tone.js synthesized audio may feel cheap | Layer reverb + delay effects; design swap-in architecture for real recordings |
| 500K triangle budget may be tight for Auditorium seats | Use instanced mesh aggressively; LOD at distance |
| Pointer lock UX friction (browser prompts) | Show instruction overlay before first lock; re-prompt gracefully |
| Web Audio autoplay policy | Require user click on "Enter" button before starting audio context |
