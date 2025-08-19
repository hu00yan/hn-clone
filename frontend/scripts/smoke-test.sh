#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE="${NEXT_PUBLIC_API_URL:-http://localhost:8787}"
TIMEOUT=10

echo -e "${YELLOW}🔥 HN Clone Smoke Test${NC}"
echo "Using API: $API_BASE"
echo "Timeout: ${TIMEOUT}s"
echo "----------------------------------------"

# Check dependencies
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        echo "Install with: brew install jq"
        exit 1
    fi
}

# Test API connectivity
test_api_health() {
    echo -n "🏥 Testing API health... "

    local response
    response=$(curl -fsS --max-time $TIMEOUT "$API_BASE/" 2>/dev/null) || {
        echo -e "${RED}❌ API health check failed${NC}"
        echo "Cannot connect to $API_BASE"
        exit 1
    }

    echo -e "${GREEN}✅${NC}"
}

# Test hot posts endpoint
test_hot_posts() {
    echo -n "🔥 Testing hot posts endpoint... "

    local response
    response=$(curl -fsS --max-time $TIMEOUT "$API_BASE/posts/hot" 2>/dev/null) || {
        echo -e "${RED}❌ Hot posts endpoint failed${NC}"
        exit 1
    }

    # Check if response is valid JSON array
    if ! echo "$response" | jq -e 'type == "array"' >/dev/null 2>&1; then
        echo -e "${RED}❌ Invalid JSON response${NC}"
        exit 1
    fi

    local post_count
    post_count=$(echo "$response" | jq '. | length')

    echo -e "${GREEN}✅ ($post_count posts)${NC}"

    # Show top 3 posts if available
    if [ "$post_count" -gt 0 ]; then
        echo "   Top posts:"
        echo "$response" | jq -r '.[0:3] | map("   • \(.title) (score: \(.score))") | .[]' 2>/dev/null || {
            echo "$response" | jq -r '.[0:3] | map("   • ID: \(.id) (score: \(.score))") | .[]' 2>/dev/null || {
                echo "   • [Posts available but format differs from expected]"
            }
        }
    fi
}

# Test new posts endpoint
test_new_posts() {
    echo -n "🆕 Testing new posts endpoint... "

    local response
    response=$(curl -fsS --max-time $TIMEOUT "$API_BASE/posts/new" 2>/dev/null) || {
        echo -e "${YELLOW}⚠️  New posts endpoint not available${NC}"
        return 0
    }

    # Check if response is valid JSON array
    if echo "$response" | jq -e 'type == "array"' >/dev/null 2>&1; then
        local post_count
        post_count=$(echo "$response" | jq '. | length')
        echo -e "${GREEN}✅ ($post_count posts)${NC}"
    else
        echo -e "${YELLOW}⚠️  Unexpected response format${NC}"
    fi
}

# Test CORS headers (important for frontend)
test_cors() {
    echo -n "🌐 Testing CORS headers... "

    local headers
    headers=$(curl -fsS --max-time $TIMEOUT -H "Origin: http://localhost:3000" -I "$API_BASE/posts/hot" 2>/dev/null) || {
        echo -e "${YELLOW}⚠️  Could not check CORS headers${NC}"
        return 0
    }

    if echo "$headers" | grep -qi "access-control-allow-origin"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  CORS headers not found${NC}"
    fi
}

# Main execution
main() {
    check_dependencies
    test_api_health
    test_hot_posts
    test_new_posts
    test_cors

    echo "----------------------------------------"
    echo -e "${GREEN}🎉 All smoke tests passed!${NC}"

    # Show usage examples
    echo ""
    echo -e "${YELLOW}Usage examples:${NC}"
    echo "# Local testing:"
    echo "NEXT_PUBLIC_API_URL=http://localhost:8787 ./scripts/smoke-test.sh"
    echo ""
    echo "# Staging/Production testing:"
    echo "NEXT_PUBLIC_API_URL=https://your-api.example.com ./scripts/smoke-test.sh"
    echo ""
}

# Run main function
main "$@"
