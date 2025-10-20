# E2E Testing Script - MercaFlow Analytics & Settings APIs
# Tests full flow with real data
# Run: bash test_e2e_apis.sh (Git Bash/WSL) or use PowerShell equivalent

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "MercaFlow E2E API Testing"
echo "=========================================="
echo ""

# Test 1: Settings API
echo -e "${YELLOW}Test 1: Settings API${NC}"
echo "GET /api/settings - Fetch or create default settings"
curl -s -X GET "${BASE_URL}/api/settings" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "PUT /api/settings - Update settings"
curl -s -X PUT "${BASE_URL}/api/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "ml_sync_frequency": "15min",
    "notification_roi_threshold": 2000,
    "dashboard_compact_mode": true
  }' | jq '.'

echo ""
echo -e "${GREEN}✓ Settings API tests complete${NC}"
echo ""

# Test 2: Elasticity API
echo -e "${YELLOW}Test 2: Elasticity API${NC}"
echo "GET /api/analytics/elasticity?days=30"
curl -s -X GET "${BASE_URL}/api/analytics/elasticity?days=30" \
  -H "Content-Type: application/json" | jq '.elasticity, .optimalPrice, .dataPoints | length'

echo ""
echo -e "${GREEN}✓ Elasticity API test complete${NC}"
echo ""

# Test 3: Forecast API
echo -e "${YELLOW}Test 3: Forecast API${NC}"
echo "GET /api/analytics/forecast?historical_days=30&forecast_days=7"
curl -s -X GET "${BASE_URL}/api/analytics/forecast?historical_days=30&forecast_days=7" \
  -H "Content-Type: application/json" | jq '.trend, .forecast | length, .historical | length'

echo ""
echo -e "${GREEN}✓ Forecast API test complete${NC}"
echo ""

# Test 4: Competitors API
echo -e "${YELLOW}Test 4: Competitors API${NC}"
echo "GET /api/analytics/competitors?limit=5"
curl -s -X GET "${BASE_URL}/api/analytics/competitors?limit=5" \
  -H "Content-Type: application/json" | jq '.competitors | length, .[0].insights'

echo ""
echo -e "${GREEN}✓ Competitors API test complete${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}All E2E tests complete!${NC}"
echo "=========================================="
