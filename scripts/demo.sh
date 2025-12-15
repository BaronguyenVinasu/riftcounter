#!/bin/bash

# RiftCounter Demo Script
# This script demonstrates the main API endpoints

API_URL="${API_URL:-http://localhost:3001}"

echo "================================"
echo "RiftCounter API Demo"
echo "================================"
echo ""

# Check if server is running
echo "Checking server health..."
HEALTH=$(curl -s "${API_URL}/health")
if [ -z "$HEALTH" ]; then
  echo "❌ Server is not running. Please start with 'npm run dev'"
  exit 1
fi
echo "✅ Server is healthy: $HEALTH"
echo ""

# Get champions list
echo "================================"
echo "1. Fetching champion list..."
echo "================================"
curl -s "${API_URL}/api/champions?limit=5" | jq '.data[] | {id, name, roles}'
echo ""

# Search for a champion
echo "================================"
echo "2. Searching for 'yas'..."
echo "================================"
curl -s "${API_URL}/api/champions/search?q=yas" | jq '.data[] | {id, name}'
echo ""

# Get specific champion
echo "================================"
echo "3. Fetching Yasuo details..."
echo "================================"
curl -s "${API_URL}/api/champions/yasuo" | jq '.champion | {id, name, roles, mobilityScore, ccScore}'
echo ""

# Get builds for a champion
echo "================================"
echo "4. Fetching Yasuo builds..."
echo "================================"
curl -s "${API_URL}/api/champions/yasuo/builds" | jq '.builds[] | {name, type, items, confidence}'
echo ""

# Main analysis endpoint
echo "================================"
echo "5. Analyzing enemy team..."
echo "================================"
echo "Request: Enemy team = [Jinx, Lee Sin, Lux, Nautilus, Seraphine], Lane = bot"
echo ""

curl -s -X POST "${API_URL}/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "enemies": ["Jinx", "Lee Sin", "Lux", "Nautilus", "Seraphine"],
    "lane": "bot",
    "options": {
      "preferCounters": true,
      "maxCounters": 3
    }
  }' | jq '{
    laneEnemy: .laneEnemy.displayName,
    confidence: .confidence,
    uncertainty: .uncertainty,
    counters: [.counters[] | {champion: .champion.displayName, confidence, reason}],
    tactics: [.tactics[] | {title, phase, stepsCount: (.steps | length)}],
    builds: [.builds[] | {type, itemCount: (.items | length), confidence}]
  }'

echo ""
echo "================================"
echo "6. Getting data sources status..."
echo "================================"
curl -s "${API_URL}/api/sources" | jq '{
  patchVersion,
  dataFreshness,
  uncertaintyLevel,
  sources: [.sources[] | {name, status, reliability}]
}'

echo ""
echo "================================"
echo "Demo complete!"
echo "================================"
