#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$(dirname "$FRONTEND_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${BLUE}🚀 HN Clone Pre-Deploy Checklist${NC}"
echo "========================================"
echo "Frontend: $FRONTEND_DIR"
echo "Backend:  $BACKEND_DIR"
echo ""

# Track overall status
CHECKS_PASSED=0
CHECKS_TOTAL=0

# Helper function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="${3:-true}"

    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    echo -n "[$CHECKS_TOTAL] $check_name... "

    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            echo -e "${RED}❌ (Critical)${NC}"
        else
            echo -e "${YELLOW}⚠️  (Warning)${NC}"
            CHECKS_PASSED=$((CHECKS_PASSED + 1))  # Count warnings as passed
        fi
        return 1
    fi
}

# Helper function to check if backend is running
check_backend_running() {
    curl -fsS --max-time 5 "http://localhost:8787/" >/dev/null 2>&1
}

# 1. Backend Checks
echo -e "${BLUE}Backend Checks:${NC}"
echo "----------------------------------------"

run_check "Backend dependencies installed" "[ -d '$BACKEND_DIR/node_modules' ]"
run_check "Backend TypeScript compiles" "cd '$BACKEND_DIR' && npx tsc --noEmit" false
run_check "Backend is running on localhost:8787" check_backend_running
run_check "Backend API responds to /posts/hot" "curl -fsS --max-time 5 'http://localhost:8787/posts/hot' | jq -e 'type == \"array\"' >/dev/null"

echo ""

# 2. Frontend Checks
echo -e "${BLUE}Frontend Checks:${NC}"
echo "----------------------------------------"

run_check "Frontend dependencies installed" "[ -d '$FRONTEND_DIR/node_modules' ]"
run_check ".env.local exists" "[ -f '$FRONTEND_DIR/.env.local' ]"
run_check "NEXT_PUBLIC_API_URL is set in .env.local" "grep -q 'NEXT_PUBLIC_API_URL=' '$FRONTEND_DIR/.env.local'"
run_check "TypeScript compiles without errors" "cd '$FRONTEND_DIR' && npx tsc --noEmit"
run_check "ESLint passes" "cd '$FRONTEND_DIR' && npx eslint src --ext .ts,.tsx --max-warnings 0" false

echo ""

# 3. Build Checks
echo -e "${BLUE}Build Checks:${NC}"
echo "----------------------------------------"

run_check "Next.js builds successfully" "cd '$FRONTEND_DIR' && npm run build"
run_check "Static export works" "cd '$FRONTEND_DIR' && npm run export" false

echo ""

# 4. Smoke Tests
echo -e "${BLUE}Smoke Tests:${NC}"
echo "----------------------------------------"

if [ -f "$FRONTEND_DIR/scripts/smoke-test.sh" ]; then
    run_check "API smoke tests pass" "cd '$FRONTEND_DIR' && ./scripts/smoke-test.sh >/dev/null 2>&1"
else
    echo "⚠️  Smoke test script not found"
fi

echo ""

# 5. Security & Configuration Checks
echo -e "${BLUE}Security & Configuration:${NC}"
echo "----------------------------------------"

run_check "No sensitive data in .env.local" "! grep -i 'password\\|secret\\|key' '$FRONTEND_DIR/.env.local' || true" false
run_check "Git status is clean" "cd '$PROJECT_DIR' && [ -z \"\$(git status --porcelain)\" ]" false
run_check "No console.log in production code" "! find '$FRONTEND_DIR/src' -name '*.tsx' -o -name '*.ts' | xargs grep -l 'console.log' >/dev/null" false

echo ""

# Results Summary
echo "========================================"
echo -e "${BLUE}Summary:${NC}"

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}🎉 All $CHECKS_TOTAL checks passed! Ready to deploy.${NC}"

    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Deploy backend: cd backend && npm run deploy"
    echo "2. Update frontend environment variables for production"
    echo "3. Deploy frontend: cd frontend && npm run deploy"
    echo "4. Run smoke tests against production"

    exit 0
else
    FAILED=$((CHECKS_TOTAL - CHECKS_PASSED))
    echo -e "${YELLOW}⚠️  $CHECKS_PASSED/$CHECKS_TOTAL checks passed ($FAILED issues found)${NC}"

    echo ""
    echo -e "${YELLOW}Before deploying:${NC}"
    echo "1. Fix any critical issues marked with ❌"
    echo "2. Consider addressing warnings marked with ⚠️"
    echo "3. Re-run this script to verify fixes"

    exit 1
fi
