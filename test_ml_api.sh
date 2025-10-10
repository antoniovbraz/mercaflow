#!/bin/bash

echo "=== Testando ML API ==="
echo ""
echo "Recuperando credenciais do Supabase..."

# Ler SUPABASE_URL e SUPABASE_ANON_KEY do .env.local
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2 | tr -d '"')
SUPABASE_ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2 | tr -d '"')

echo "Supabase URL: $SUPABASE_URL"

# Fazer query para pegar access_token e ml_user_id
TOKEN_DATA=$(curl -s "$SUPABASE_URL/rest/v1/ml_integrations?select=access_token,ml_user_id&status=eq.active&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

ACCESS_TOKEN=$(echo $TOKEN_DATA | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
ML_USER_ID=$(echo $TOKEN_DATA | grep -o '"ml_user_id":[0-9]*' | grep -o '[0-9]*')

echo "ML User ID: $ML_USER_ID"
echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Testar API ML - Total de itens
echo "=== 1. Total de itens (sem filtro) ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.paging'
echo ""

# Testar API ML - Itens ativos
echo "=== 2. Itens ATIVOS ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?status=active&limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.paging'
echo ""

# Testar API ML - Itens pausados
echo "=== 3. Itens PAUSADOS ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?status=paused&limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.paging'
echo ""

# Testar API ML - Itens closed
echo "=== 4. Itens CLOSED ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?status=closed&limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.paging'
echo ""

echo "=== Teste concluído ==="
