#!/bin/bash

echo "=== Testando MercaFlow API (Vercel) ==="
echo ""

BASE_URL="https://mercaflow.vercel.app"

echo "1. Testando /api/ml/items (sem filtro - TODOS os itens)"
echo "URL: $BASE_URL/api/ml/items?limit=1"
echo ""
curl -s "$BASE_URL/api/ml/items?limit=1" | head -50
echo ""
echo "---"
echo ""

echo "2. Testando /api/ml/items?status=active (apenas ATIVOS)"
echo "URL: $BASE_URL/api/ml/items?status=active&limit=1"
echo ""
curl -s "$BASE_URL/api/ml/items?status=active&limit=1" | head -50
echo ""
echo "---"
echo ""

echo "3. Testando /api/ml/items?status=paused (apenas PAUSADOS)"
echo "URL: $BASE_URL/api/ml/items?status=paused&limit=1"
echo ""
curl -s "$BASE_URL/api/ml/items?status=paused&limit=1" | head -50
echo ""
echo "---"
echo ""

echo "4. Testando /api/ml/items com limite 50 para ver stats"
echo "URL: $BASE_URL/api/ml/items?limit=50"
echo ""
curl -s "$BASE_URL/api/ml/items?limit=50" | grep -E '"paging"|"total"|"limit"|"offset"|"status"' | head -20
echo ""

echo "=== Teste concluído ==="
