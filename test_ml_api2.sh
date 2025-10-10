#!/bin/bash

echo "=== Testando ML API ==="
echo ""

# Ler SUPABASE_URL e SUPABASE_ANON_KEY do .env.local
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
SUPABASE_ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

echo "Supabase URL: $SUPABASE_URL"
echo ""
echo "Recuperando credenciais..."

# Fazer query para pegar access_token e ml_user_id
TOKEN_DATA=$(curl -s "$SUPABASE_URL/rest/v1/ml_integrations?select=access_token,ml_user_id&status=eq.active&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "Token Data (raw): $TOKEN_DATA"
echo ""

# Extrair usando grep/sed
ACCESS_TOKEN=$(echo "$TOKEN_DATA" | sed 's/.*"access_token":"\([^"]*\)".*/\1/')
ML_USER_ID=$(echo "$TOKEN_DATA" | sed 's/.*"ml_user_id":\([0-9]*\).*/\1/')

echo "ML User ID: $ML_USER_ID"
echo "Access Token: ${ACCESS_TOKEN:0:30}..."
echo ""

if [ -z "$ML_USER_ID" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "ERRO: Não conseguiu recuperar credenciais!"
  exit 1
fi

# Testar API ML - Total de itens
echo "=== 1. Total de itens (sem filtro) ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo ""

# Testar API ML - Itens ativos
echo "=== 2. Itens ATIVOS ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?status=active&limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo ""

# Testar API ML - Itens pausados
echo "=== 3. Itens PAUSADOS ==="
curl -s "https://api.mercadolibre.com/users/$ML_USER_ID/items/search?status=paused&limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo ""

echo "=== Teste concluído ==="
