#!/usr/bin/env node
/**
 * Custom lint: scan phantom source files for banned blue-violet colors (hue 235-265).
 * Run as: node scripts/lint-phantom-colors.mjs
 * Exit code 1 if violations found.
 *
 * Catches RGB literals like [100, 100, 140] or rgba(100,100,140,...) that fall
 * in the banned hue range per CLAUDE.md color rules.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const PHANTOM_DIR = 'src/phantom';
const EXTENSIONS = ['.ts', '.tsx'];

// RGB to HSL hue
function rgbToHue(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return Math.round(h * 360);
}

function saturation(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

// Patterns to find RGB values
const RGB_ARRAY = /\[(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\]/g;
const RGBA_FUNC = /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/g;

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const regex of [RGB_ARRAY, RGBA_FUNC]) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        const hue = rgbToHue(r, g, b);
        const sat = saturation(r, g, b);
        if (hue >= 235 && hue <= 265 && sat > 0.45) {
          violations.push({
            file: filePath,
            line: i + 1,
            rgb: `[${r},${g},${b}]`,
            hue,
            sat: Math.round(sat * 100),
          });
        }
      }
    }
  }
  return violations;
}

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkDir(full));
    } else if (EXTENSIONS.includes(extname(full))) {
      files.push(full);
    }
  }
  return files;
}

const files = walkDir(PHANTOM_DIR);
const allViolations = files.flatMap(scanFile);

if (allViolations.length > 0) {
  console.error('❌ Banned blue-violet colors found (hue 235-265, saturation >45%):');
  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}  ${v.rgb} (hue=${v.hue}, sat=${v.sat}%)`);
  }
  process.exit(1);
} else {
  console.log('✅ No banned blue-violet colors in phantom module.');
  process.exit(0);
}
