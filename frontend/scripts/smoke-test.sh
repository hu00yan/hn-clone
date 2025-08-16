#!/usr/bin/env bash
set -euo pipefail

API_BASE="${NEXT_PUBLIC_API_URL:-http://localhost:8787}"
echo "Using API: $API_BASE"

echo "Hot posts (top 3):"
curl -fsS "$API_BASE/posts/hot" | jq '.[0:3] | map({id,title,score})' || {
  echo "API check failed"; exit 1;
}

echo "Smoke test passed."
