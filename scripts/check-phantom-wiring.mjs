#!/usr/bin/env node
/**
 * Structural integrity check for the Phantom game.
 * Verifies that every act's areas, collectibles, and renderer are properly wired.
 *
 * Run: node scripts/check-phantom-wiring.mjs
 * Exit 1 on any broken wiring.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'src/phantom';
const ACTS = [1, 2, 3, 4, 5];
const errors = [];

function read(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf-8');
}

function check(condition, msg) {
  if (!condition) {
    errors.push(msg);
    console.error(`  ❌ ${msg}`);
  } else {
    console.log(`  ✅ ${msg}`);
  }
}

// ── 1. Constants: every act has areas + collectibles exported ──
console.log('\n📋 Constants (core/constants.ts)');
const constants = read('core/constants.ts');

for (const act of ACTS) {
  check(
    constants.includes(`ACT${act}_AREAS`) || constants.includes(`act: ${act}`),
    `Act ${act} areas defined`
  );
  check(
    constants.includes(`ACT${act}_COLLECTIBLES`),
    `Act ${act} collectibles defined`
  );
}

// ── 2. Lookup functions include all acts ──
console.log('\n🔍 Lookup functions');
check(
  ACTS.every(a => constants.includes(`${a}: ACT${a}_AREAS`) || constants.includes(`${a}:`)),
  'AREAS_BY_ACT covers all 5 acts'
);
check(
  ACTS.every(a => constants.includes(`${a}: ACT${a}_COLLECTIBLES`)),
  'COLLECTIBLES_BY_ACT covers all 5 acts'
);

// ── 3. Renderer files exist for acts 2-5 ──
console.log('\n🎨 Renderer files');
const rendererFiles = {
  2: 'renderer-2d/acts/Act2PhantomOfOpera.tsx',
  3: 'renderer-2d/acts/Act3MusicOfNight.tsx',
  4: 'renderer-2d/acts/Act4AllIAskOfYou.tsx',
  5: 'renderer-2d/acts/Act5PointOfNoReturn.tsx',
};
for (const [act, file] of Object.entries(rendererFiles)) {
  try {
    read(file);
    check(true, `Act ${act} renderer exists (${file})`);
  } catch {
    check(false, `Act ${act} renderer MISSING (${file})`);
  }
}

// ── 4. Canvas2D imports all renderers ──
console.log('\n🔌 Canvas2D wiring');
const canvas = read('renderer-2d/Canvas2D.tsx');

// Check that Canvas2D imports either the act renderer or the act's parallax scene
const parallaxFiles = {
  2: 'scenes/act2-parallax',
  3: 'scenes/act3-parallax',
  4: 'scenes/act4-parallax',
  5: 'scenes/act5-parallax',
};
for (const [act, file] of Object.entries(rendererFiles)) {
  const moduleName = file.split('/').pop().replace('.tsx', '');
  const parallaxName = parallaxFiles[act]?.split('/').pop() || '';
  check(
    canvas.includes(moduleName) || canvas.includes(parallaxName),
    `Canvas2D imports Act ${act} renderer or parallax`
  );
}

// ── 5. Area IDs referenced in Canvas2D (only top-level area IDs, not hotspots) ──
console.log('\n🗺️  Area rendering coverage');
let match;
// Known area IDs from the PRD — this is the source of truth
const allAreaIds = [
  'theater-audience', 'theater-stage', 'theater-backstage',
  'dressing-room', 'spiral-stairs', 'underground-tunnel', 'underground-lake',
  'lair', 'rooftop',
  'theater-performance', 'final-lair', 'epilogue',
];

// Act 1 areas are rendered inline in Canvas2D; acts 2-5 dispatch to draw functions
const act1Areas = ['theater-audience', 'theater-stage', 'theater-backstage'];
const dispatchedAreas = allAreaIds.filter(id => !act1Areas.includes(id));

for (const areaId of dispatchedAreas) {
  check(
    canvas.includes(`'${areaId}'`),
    `Area '${areaId}' referenced in Canvas2D`
  );
}

// ── 6. Collectible IDs are findable via getAllCollectibles ──
console.log('\n📦 Collectible wiring');
const collectibleIdRegex = /collectibleId:\s*'([^']+)'/g;
const collectibleIds = [];
while ((match = collectibleIdRegex.exec(constants)) !== null) {
  collectibleIds.push(match[1]);
}
check(collectibleIds.length >= 15, `Total collectibles: ${collectibleIds.length} (expected >= 15, base 15 + secret)`);

// Check ParchmentOverlay uses getAllCollectibles
const parchment = read('ui/ParchmentOverlay.tsx');
check(
  parchment.includes('getAllCollectibles'),
  'ParchmentOverlay uses getAllCollectibles (not act-specific)'
);

// ── 7. Trigger keys in constants are handled in Canvas2D ──
console.log('\n🎯 Trigger wiring');
const triggerRegex = /triggerKey:\s*'([^']+)'/g;
const triggerKeys = [];
while ((match = triggerRegex.exec(constants)) !== null) {
  triggerKeys.push(match[1]);
}
for (const key of triggerKeys) {
  check(
    canvas.includes(`'${key}'`),
    `Trigger '${key}' handled in Canvas2D`
  );
}

// ── 8. No banned colors (hue 235-265) — defers to lint:phantom-colors ──
console.log('\n🎨 Color check: deferred to npm run lint:phantom-colors');

// ── 9. draw-utils shared (no local TAU/srand definitions) ──
console.log('\n🔧 Shared utils');
for (const [act, file] of Object.entries(rendererFiles)) {
  const content = read(file);
  check(
    !content.match(/^const TAU\b/m),
    `Act ${act} does not define local TAU (uses shared)`
  );
  check(
    !content.match(/^function srand\b/m) && !content.match(/^function seededRandom\b/m),
    `Act ${act} does not define local srand/seededRandom (uses shared)`
  );
}

// ── Summary ──
console.log('\n' + '─'.repeat(50));
if (errors.length === 0) {
  console.log('✅ All wiring checks passed.');
  process.exit(0);
} else {
  console.error(`❌ ${errors.length} wiring issue(s) found.`);
  process.exit(1);
}
