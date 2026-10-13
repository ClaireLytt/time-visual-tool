#!/usr/bin/env node
/**
 * ui-audit — automated UI inspection for TimeVisual.
 *
 * Opens the app in a real browser (system Chrome/Edge via playwright-core),
 * walks through every module, and reports:
 *   - console errors / page crashes / failed requests
 *   - touch targets smaller than 40x40px (mobile usability)
 *   - horizontal overflow (page or individual elements)
 *   - banned blue-violet colors (hue 235-265, saturated) per project rules
 *   - buttons/links without an accessible name, images without alt
 *   - duplicate element ids
 * Saves a screenshot per module and a JSON + console report.
 *
 * Usage:
 *   node scripts/ui-audit.mjs                       # audit all modules, mobile viewport
 *   node scripts/ui-audit.mjs --modes diary,time    # only some modules
 *   node scripts/ui-audit.mjs --desktop             # 1280x800 instead of 390x844
 *   node scripts/ui-audit.mjs --url http://localhost:5173/time-visual-tool/
 *   node scripts/ui-audit.mjs --headed              # watch the browser work
 *
 * Requires the dev server to be running (npm run dev); the script will
 * tell you if it isn't.
 *
 * Auth: the app signs in anonymously by itself. If anonymous auth is
 * disabled in Firebase, set UI_AUDIT_EMAIL / UI_AUDIT_PASSWORD and the
 * script logs in through the login form. Otherwise it audits the landing
 * page once and tells you why.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ── CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const getArg = (name, dflt) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : dflt
}
const BASE_URL = getArg('url', 'http://localhost:5173/time-visual-tool/')
const HEADED = args.includes('--headed')
const DESKTOP = args.includes('--desktop')
const OUT_DIR = resolve(getArg('out', 'ui-audit'))
const ALL_MODES = ['overview', 'time', 'finance', 'eating', 'diary', 'sport', 'habit', 'study', 'work', 'podcast', 'youtube', 'ielts']
const MODES = getArg('modes', '') ? getArg('modes', '').split(',').map(s => s.trim()) : ALL_MODES
const MODE_KEY = 'time-visual-mode' // APP_MODE_STORAGE_KEY in src/constants

const VIEWPORT = DESKTOP ? { width: 1280, height: 800 } : { width: 390, height: 844 }
const MIN_TAP = 40 // px, minimum touch target (44 preferred, 40 tolerated)

// ── helpers ─────────────────────────────────────────────────────────────
const findings = [] // { mode, type, severity, detail }
const add = (mode, type, severity, detail) => findings.push({ mode, type, severity, detail })

async function launchBrowser() {
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await chromium.launch({ channel, headless: !HEADED })
    } catch { /* try next */ }
  }
  throw new Error('Neither Chrome nor Edge found. Install one, or `npx playwright install chromium`.')
}

// Runs inside the page: all DOM-level checks for the current screen.
function pageChecks({ minTap }) {
  const out = { smallTargets: [], overflow: [], bannedColors: [], a11y: [], dupIds: [] }

  const visible = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return false
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'
  }
  const describe = (el) => {
    const tag = el.tagName.toLowerCase()
    const id = el.id ? `#${el.id}` : ''
    const cls = typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)
    return `${tag}${id}${cls}${text ? ` "${text}"` : ''}`
  }

  // 1. touch targets — functional hit test: an element passes if a tap
  // anywhere in a 44px square centered on it still reaches the element
  // (covers padding, ::after hit-area expansion, and larger parents).
  const scrollX0 = window.scrollX, scrollY0 = window.scrollY
  for (const el of document.querySelectorAll('button, a, [role="button"], input[type="checkbox"], input[type="radio"], select, summary')) {
    if (!visible(el)) continue
    // sr-only / skip links are visually hidden on purpose
    if (el.classList.contains('sr-only') || el.getBoundingClientRect().width <= 2) continue
    let r = el.getBoundingClientRect()
    if (r.width >= minTap && r.height >= minTap) continue
    // bring it into the viewport so elementFromPoint works
    el.scrollIntoView({ block: 'center', behavior: 'instant' })
    r = el.getBoundingClientRect()
    const cx = Math.min(Math.max(r.left + r.width / 2, minTap / 2), window.innerWidth - minTap / 2)
    const cy = Math.min(Math.max(r.top + r.height / 2, minTap / 2), window.innerHeight - minTap / 2)
    const probe = (x, y) => {
      const t = document.elementFromPoint(x, y)
      return {
        ok: !!t && (t === el || el.contains(t) || t.contains(el)),
        // a miss that lands on another control is tolerable for packed
        // groups (WCAG 2.5.8 spacing exception) as long as el >= 24px
        interactive: !!t && !!t.closest('button, a, [role="button"], label'),
      }
    }
    const half = minTap / 2 - 1
    const probes = [probe(cx, cy - half), probe(cx, cy + half), probe(cx - half, cy), probe(cx + half, cy)]
    const allOk = probes.every(p => p.ok)
    const groupException = r.width >= 24 && r.height >= 24 && probes.every(p => p.ok || p.interactive)
    if (!allOk && !groupException) {
      out.smallTargets.push(`${describe(el)} — ${Math.round(r.width)}x${Math.round(r.height)}px effective <${minTap}px`)
    }
  }
  window.scrollTo(scrollX0, scrollY0)

  // 2. horizontal overflow
  const docEl = document.documentElement
  if (docEl.scrollWidth > window.innerWidth + 1) {
    out.overflow.push(`page scrollWidth ${docEl.scrollWidth}px > viewport ${window.innerWidth}px`)
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width > window.innerWidth + 1 || r.right > window.innerWidth + 8) {
        if (visible(el) && !el.querySelector('*')) out.overflow.push(describe(el))
        if (out.overflow.length > 8) break
      }
    }
  }

  // 3. banned blue-violet (hue 235-265, sat > 45%, not near-white/black)
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) return [0, 0, l]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
    return [h, s, l]
  }
  const isBanned = (str) => {
    const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (!m) return false
    if (m[4] !== undefined && parseFloat(m[4]) < 0.3) return false
    const [h, s, l] = rgbToHsl(+m[1], +m[2], +m[3])
    return h >= 235 && h <= 265 && s > 0.45 && l > 0.25 && l < 0.8
  }
  const seen = new Set()
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue
    const cs = getComputedStyle(el)
    for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'backgroundImage']) {
      const v = cs[prop]
      if (!v || v === 'none') continue
      if (isBanned(v)) {
        const key = `${describe(el)}|${prop}`
        if (!seen.has(key)) {
          seen.add(key)
          out.bannedColors.push(`${describe(el)} — ${prop}: ${v.slice(0, 60)}`)
        }
      }
    }
    if (out.bannedColors.length > 10) break
  }

  // 4. accessible names + alt text
  for (const el of document.querySelectorAll('button, a')) {
    if (!visible(el)) continue
    const name = (el.getAttribute('aria-label') || el.title || el.textContent || '').trim()
    if (!name) out.a11y.push(`${describe(el)} — no accessible name`)
  }
  for (const img of document.querySelectorAll('img')) {
    if (visible(img) && !img.alt && img.getAttribute('aria-hidden') !== 'true' && img.getAttribute('role') !== 'presentation') {
      out.a11y.push(`${describe(img)} — missing alt`)
    }
  }

  // 5. duplicate ids
  const ids = {}
  for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1
  for (const [id, n] of Object.entries(ids)) if (n > 1) out.dupIds.push(`#${id} x${n}`)

  return out
}

// ── main ────────────────────────────────────────────────────────────────
async function main() {
  // dev server reachable?
  try {
    await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) })
  } catch {
    console.error(`✗ Dev server not reachable at ${BASE_URL}\n  Start it first:  npm run dev`)
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const browser = await launchBrowser()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ...(DESKTOP ? {} : { isMobile: true, hasTouch: true, deviceScaleFactor: 3 }),
  })
  const page = await context.newPage()

  let currentMode = 'boot'
  page.on('console', (msg) => {
    if (msg.type() === 'error') add(currentMode, 'console', 'error', msg.text().slice(0, 200))
  })
  page.on('pageerror', (err) => add(currentMode, 'pageerror', 'error', String(err).slice(0, 200)))
  page.on('requestfailed', (req) => {
    const url = req.url()
    // Firestore long-polling aborts are routine noise
    if (/google|firestore|firebase/.test(url) && req.failure()?.errorText === 'net::ERR_ABORTED') return
    add(currentMode, 'requestfailed', 'warn', `${req.failure()?.errorText} ${url.slice(0, 120)}`)
  })

  console.log(`▶ Auditing ${BASE_URL}#/app  (${VIEWPORT.width}x${VIEWPORT.height}${DESKTOP ? '' : ' mobile'})\n`)

  // ── reach the authenticated app ──
  currentMode = 'auth'
  await page.goto(`${BASE_URL}#/app`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(2000)
  let inApp = await page.locator('#main-content').count() > 0

  if (!inApp && process.env.UI_AUDIT_EMAIL && process.env.UI_AUDIT_PASSWORD) {
    // anonymous auth unavailable — try the login form
    await page.goto(`${BASE_URL}#/login`, { waitUntil: 'networkidle' }).catch(() => {})
    await page.fill('input[type="email"]', process.env.UI_AUDIT_EMAIL).catch(() => {})
    await page.fill('input[type="password"]', process.env.UI_AUDIT_PASSWORD).catch(() => {})
    await page.click('button[type="submit"]').catch(() => {})
    // HashRouter: URL becomes .../#/app — wait for the app shell instead of the URL
    await page.waitForSelector('#main-content', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(1500)
    inApp = await page.locator('#main-content').count() > 0
  }

  const modesToRun = inApp ? MODES : ['landing']
  if (!inApp) {
    console.log('  ⚠ Could not reach /app (anonymous auth rejected and no UI_AUDIT_EMAIL/PASSWORD set).')
    console.log('    Auditing the landing page only.\n')
  }

  for (const mode of modesToRun) {
    currentMode = mode
    process.stdout.write(`  ${mode.padEnd(10)}`)
    try {
      if (mode !== 'landing') {
        await page.evaluate((m) => localStorage.setItem('time-visual-mode', JSON.stringify(m)), mode)
        await page.goto(`${BASE_URL}#/app`, { waitUntil: 'domcontentloaded' })
        await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
      } else {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' }).catch(() => {})
      }
      await page.waitForTimeout(1500) // data cache fill + animations settle

      const res = await page.evaluate(pageChecks, { minTap: MIN_TAP })
      for (const d of res.smallTargets) add(mode, 'small-target', 'warn', d)
      for (const d of res.overflow) add(mode, 'overflow', 'error', d)
      for (const d of res.bannedColors) add(mode, 'banned-color', 'error', d)
      for (const d of res.a11y) add(mode, 'a11y', 'warn', d)
      for (const d of res.dupIds) add(mode, 'dup-id', 'warn', d)

      await page.screenshot({ path: resolve(OUT_DIR, `${mode}.png`), fullPage: true })
      const n = findings.filter(f => f.mode === mode).length
      console.log(n === 0 ? '✓ clean' : `⚠ ${n} finding(s)`)
    } catch (e) {
      add(mode, 'audit-crash', 'error', String(e).slice(0, 200))
      console.log('✗ crashed')
    }
  }

  await browser.close()

  // ── report ──
  writeFileSync(resolve(OUT_DIR, 'report.json'), JSON.stringify({ url: BASE_URL, viewport: VIEWPORT, date: new Date().toISOString(), findings }, null, 2))

  const errors = findings.filter(f => f.severity === 'error')
  const warns = findings.filter(f => f.severity === 'warn')
  console.log(`\n═══ ${errors.length} error(s), ${warns.length} warning(s) ═══`)
  for (const f of [...errors, ...warns]) {
    console.log(`  [${f.severity === 'error' ? '✗' : '⚠'}] ${f.mode} / ${f.type}: ${f.detail}`)
  }
  console.log(`\nScreenshots + report.json → ${OUT_DIR}`)
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
