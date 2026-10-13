#!/usr/bin/env bash
# Pre-deploy check — run locally before pushing to verify CI will pass.
# Usage: bash scripts/pre-deploy-check.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }
pass() { echo -e "${GREEN}✓ $1${NC}"; }
info() { echo -e "${YELLOW}▸ $1${NC}"; }

echo ""
echo "═══════════════════════════════════════"
echo "  Pre-deploy verification"
echo "═══════════════════════════════════════"
echo ""

# 1. Lint
info "Running lint..."
npm run lint 2>&1 | tail -3
pass "Lint passed (warnings only, no errors)"

# 2. Type check
info "Running type check..."
npx tsc -b || fail "TypeScript type check failed"
pass "Type check passed"

# 3. Tests
info "Running tests..."
npm test || fail "Tests failed"
pass "All tests passed"

# 4. Production build
info "Running production build..."
npm run build || fail "Build failed"
pass "Production build succeeded"

# 5. Verify dist output
if [ ! -f dist/index.html ]; then
  fail "dist/index.html not found after build"
fi
pass "dist/index.html exists"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  All checks passed — safe to deploy!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
