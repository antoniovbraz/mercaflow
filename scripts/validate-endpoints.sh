#!/bin/bash
# Script de validação dos endpoints de debug
# Day 1 - Validação de segurança

echo "🔍 Validando proteção dos endpoints de debug..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador
PASSED=0
FAILED=0

# Função para testar endpoint
test_endpoint() {
  local url=$1
  local name=$2
  
  echo -n "Testing $name... "
  
  # Faz request com curl (simulando produção)
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  
  # Se for 403 (Forbidden) ou 404 (Not Found em produção) = OK
  # Se for 200 = FALHA (endpoint exposto)
  if [ "$response" = "403" ] || [ "$response" = "404" ] || [ "$response" = "307" ]; then
    echo -e "${GREEN}✅ PROTEGIDO${NC} (HTTP $response)"
    ((PASSED++))
  elif [ "$response" = "200" ]; then
    echo -e "${RED}❌ EXPOSTO${NC} (HTTP $response)"
    ((FAILED++))
  else
    echo -e "${YELLOW}⚠️  DESCONHECIDO${NC} (HTTP $response)"
  fi
}

# Se URL base foi passada como argumento, usa ela
# Senão, usa localhost (para teste local)
BASE_URL="${1:-http://localhost:3000}"

echo "Base URL: $BASE_URL"
echo ""

# Testar endpoints de debug (pages)
echo "📄 Testando Pages de Debug:"
test_endpoint "$BASE_URL/debug-user" "debug-user"
test_endpoint "$BASE_URL/debug-roles" "debug-roles"
test_endpoint "$BASE_URL/test-db" "test-db"
test_endpoint "$BASE_URL/test-role" "test-role"

echo ""
echo "🔌 Testando API Routes de Debug:"
test_endpoint "$BASE_URL/api/debug-ml" "api/debug-ml"
test_endpoint "$BASE_URL/api/debug/create-role" "api/debug/create-role"
test_endpoint "$BASE_URL/api/debug/create-profile" "api/debug/create-profile"
test_endpoint "$BASE_URL/api/debug/ml-api-test" "api/debug/ml-api-test"
test_endpoint "$BASE_URL/api/debug/ml-integration" "api/debug/ml-integration"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resultado:"
echo -e "  ${GREEN}✅ Protegidos: $PASSED${NC}"
echo -e "  ${RED}❌ Expostos: $FAILED${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 Todos os endpoints de debug estão protegidos!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  ATENÇÃO: $FAILED endpoint(s) ainda exposto(s)!${NC}"
  exit 1
fi
