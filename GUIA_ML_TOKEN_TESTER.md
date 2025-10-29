# 🔑 Guia: Como Obter e Testar Token do Mercado Livre

## Objetivo

Buscar seu token ML descriptografado e testar **todas as APIs do Mercado Livre** diretamente.

---

## 🚀 Método Recomendado: Via API (Mais Fácil)

### **Passo 1: Obter Cookie de Autenticação**

1. **Faça login no MercaFlow:**

   ```
   http://localhost:3000/login
   ou
   https://mercaflow.vercel.app/login
   ```

2. **Abra DevTools (F12)**

3. **Vá para aba "Application" ou "Armazenamento"**

4. **Encontre o cookie `sb-access-token`:**
   - Expanda "Cookies" no menu lateral
   - Clique no seu domínio
   - Copie o **Value** do cookie `sb-access-token`

### **Passo 2: Execute o Script**

```powershell
# Local
.\get_ml_token_api.ps1 -Cookie "SEU_COOKIE_AQUI"

# Produção
.\get_ml_token_api.ps1 -BaseUrl "https://mercaflow.vercel.app" -Cookie "SEU_COOKIE_AQUI"
```

### **Resultado Esperado:**

```
==========================================
MercaFlow - ML Token via API
==========================================

🔍 Step 1: Buscando token via API...

✅ Token obtido com sucesso!

📊 Informações da Integração:
  Integration ID: 21987e57-a90d-4321-8bb3-62e7ab6f0d40
  ML User ID: 669073070
  Status: ✅ Token VÁLIDO (expira em 359 minutos)

🔑 Token de Acesso:
  Preview: TG-67351d82e4b0ca...2c95a10f90
  Tamanho: 191 caracteres

==========================================
🧪 Testando APIs do Mercado Livre
==========================================

Test 1: User Info
  ✅ Status: 200 OK (245ms)
  User ID: 669073070
  Nickname: PEEPERSSHOP

Test 2: Items (Produtos)
  ✅ Status: 200 OK (312ms)
  Total de produtos: 95
  Produtos retornados: 5

Test 3: Orders (Pedidos)
  ✅ Status: 200 OK (298ms)
  Total de pedidos: 1234

Test 4: Questions (Perguntas)
  ✅ Status: 200 OK (189ms)
  Total de perguntas: 42

💾 Token salvo em: ml_token_20251020_235959.txt
```

---

## 📋 Método Alternativo: Via SQL (Avançado)

⚠️ **Nota:** O token no banco está **encriptado**. Use o método via API acima para obter o token descriptografado.

### **Passo 1: Obter Token Encriptado do Supabase**

#### Opção A: Via SQL Editor (Recomendado)

1. **Acesse Supabase:**

   ```
   https://supabase.com/dashboard
   ```

2. **Abra SQL Editor:**

   - Clique no seu projeto
   - Menu lateral: "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL:**

   ```sql
   SELECT
     id as integration_id,
     user_id,
     ml_user_id,
     access_token,
     refresh_token,
     token_expires_at,
     created_at,
     CASE
       WHEN token_expires_at > NOW() THEN '✓ Token válido'
       ELSE '✗ Token expirado'
     END as status
   FROM ml_integrations
   WHERE user_id = (
     SELECT id
     FROM auth.users
     WHERE email = 'peepers.shop@gmail.com'
   )
   ORDER BY created_at DESC
   LIMIT 1;
   ```

4. **Copie o `access_token`:**
   - Será algo como: `APP_USR-123456789-...`

#### Opção B: Via Table Editor

1. **Acesse Supabase:**

   ```
   https://supabase.com/dashboard
   ```

2. **Abra Table Editor:**

   - Menu lateral: "Table Editor"
   - Selecione tabela: `ml_integrations`

3. **Encontre seu registro:**

   - Procure pela linha com seu `user_id`
   - Coluna `access_token`

4. **Copie o token:**
   - Clique duplo no valor
   - Ctrl+C para copiar

---

### **Passo 2: Executar Script de Teste**

```powershell
# Execute o script com seu token
.\test_ml_token.ps1 -AccessToken "APP_USR-SEU-TOKEN-AQUI"
```

---

## 🎯 O Que o Script Testa

O script `test_ml_token.ps1` testa **5 APIs principais** do Mercado Livre:

### 1. **User Info** (`/users/me`)

Informações do usuário autenticado:

- ID do usuário ML
- Nickname
- Email
- País
- Reputação

### 2. **Items/Produtos** (`/users/me/items/search`)

Lista seus produtos:

- Primeiros 5 produtos ativos
- ID, título, preço
- Status (active, paused, closed)
- Total de produtos

### 3. **Orders/Pedidos** (`/orders/search`)

Últimos pedidos:

- 5 pedidos mais recentes
- Status do pedido
- Valor total
- Data de criação

### 4. **Questions/Perguntas** (`/my/received_questions/search`)

Perguntas recebidas:

- 5 perguntas mais recentes
- Status (answered, unanswered)
- Texto da pergunta
- Item relacionado

### 5. **Notifications** (`/myfeeds`)

Notificações do sistema:

- Últimas notificações
- Tipo de evento
- Tópico

---

## 📊 Saída Esperada

```
==========================================
MercaFlow - ML Token & API Tester
==========================================

Step 2: Testando APIs do Mercado Livre...

Token: APP_USR-123456789-...

Testando: User Info
  Endpoint: https://api.mercadolibre.com/users/me
  Descrição: Informações do usuário autenticado
  ✓ Status: 200 OK
  ✓ Tempo: 245ms

  User ID: 123456789
  Nickname: PEEPERSSHOP
  Preview: {"id":123456789,"nickname":"PEEPERSSHOP","registration_date":"2020-01-01T00:00:00...

Testando: Items (Produtos)
  Endpoint: https://api.mercadolibre.com/users/me/items/search?status=active&limit=5
  Descrição: Primeiros 5 produtos ativos
  ✓ Status: 200 OK
  ✓ Tempo: 312ms

  Dados retornados: 5 items
  Total disponível: 95
  Preview: {"results":["MLB2015713558","MLB1984568597","MLB2015719431"],"paging":{"total":95...

Testando: Orders (Pedidos)
  Endpoint: https://api.mercadolibre.com/orders/search?seller=me&sort=date_desc&limit=5
  Descrição: Últimos 5 pedidos
  ✓ Status: 200 OK
  ✓ Tempo: 298ms

  Dados retornados: 5 items
  Total disponível: 1234
  Preview: {"results":[{"id":12345678,"status":"paid","date_created":"2025-10-20T...

==========================================
Resumo dos Testes
==========================================

Total de Testes: 5
Sucessos: 5
Falhas: 0
Taxa de Sucesso: 100%

Deseja salvar as respostas completas em arquivo? (s/n): s

✓ Respostas salvas em: ml_api_responses_20251020_235959.json

==========================================
Comandos CURL para Testes Manuais
==========================================

User Info:
curl -X GET 'https://api.mercadolibre.com/users/me' \
  -H 'Authorization: Bearer APP_USR-123456789-...'

Items (Produtos):
curl -X GET 'https://api.mercadolibre.com/users/me/items/search?status=active&limit=5' \
  -H 'Authorization: Bearer APP_USR-123456789-...'

==========================================
Testes Completos!
==========================================
```

---

## 🔧 Troubleshooting

### **Erro: "401 Unauthorized"**

**Problema:** Token expirado ou inválido

**Solução:**

```sql
-- Verifique se o token expirou
SELECT
  token_expires_at,
  CASE
    WHEN token_expires_at > NOW() THEN 'Válido'
    ELSE 'Expirado'
  END as status
FROM ml_integrations
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com');
```

Se expirado:

1. Vá para `/ml/auth` na aplicação
2. Reconecte com Mercado Livre
3. Token será renovado automaticamente

### **Erro: "No token found"**

**Problema:** Integração ML não configurada

**Solução:**

```
1. Acesse: https://mercaflow.vercel.app/ml/auth
2. Clique "Conectar com Mercado Livre"
3. Autorize a aplicação
4. Token será salvo automaticamente
```

### **Erro: "Network timeout"**

**Problema:** API do ML lenta ou indisponível

**Solução:**

- Tente novamente em alguns segundos
- Verifique status: https://status.mercadolibre.com/

### **Erro: "Too many requests (429)"**

**Problema:** Limite de rate do ML excedido

**Solução:**

- Aguarde 1 minuto
- Execute novamente
- O script já tem delay de 500ms entre requisições

---

## 📝 Comandos CURL Diretos

Se preferir testar manualmente via terminal:

```bash
# 1. User Info
curl -X GET 'https://api.mercadolibre.com/users/me' \
  -H 'Authorization: Bearer APP_USR-SEU-TOKEN'

# 2. Produtos
curl -X GET 'https://api.mercadolibre.com/users/me/items/search?status=active&limit=5' \
  -H 'Authorization: Bearer APP_USR-SEU-TOKEN'

# 3. Pedidos
curl -X GET 'https://api.mercadolibre.com/orders/search?seller=me&sort=date_desc&limit=5' \
  -H 'Authorization: Bearer APP_USR-SEU-TOKEN'

# 4. Perguntas
curl -X GET 'https://api.mercadolibre.com/my/received_questions/search?api_version=4&limit=5' \
  -H 'Authorization: Bearer APP_USR-SEU-TOKEN'

# 5. Notificações (substitua YOUR_APP_ID)
curl -X GET 'https://api.mercadolibre.com/myfeeds?app_id=YOUR_APP_ID&limit=5' \
  -H 'Authorization: Bearer APP_USR-SEU-TOKEN'
```

---

## 💾 Salvar Respostas

O script pergunta se você quer salvar as respostas completas em JSON:

```
Deseja salvar as respostas completas em arquivo? (s/n): s
```

Arquivo gerado: `ml_api_responses_YYYYMMDD_HHMMSS.json`

Conteúdo:

```json
[
  {
    "API": "User Info",
    "Status": "PASS",
    "Time": 245,
    "Data": {
      "id": 123456789,
      "nickname": "PEEPERSSHOP",
      ...
    }
  },
  ...
]
```

---

## 🎯 Casos de Uso

### **1. Verificar se Token Está Válido**

```powershell
.\test_ml_token.ps1 -AccessToken "APP_USR-..."
# Se retornar 200 em User Info → Token válido
# Se retornar 401 → Token expirado
```

### **2. Ver Dados Brutos do ML**

```powershell
.\test_ml_token.ps1 -AccessToken "APP_USR-..."
# Responda "s" para salvar
# Abra o arquivo JSON gerado
# Veja dados completos sem processamento
```

### **3. Debugar Integração ML**

```powershell
.\test_ml_token.ps1 -AccessToken "APP_USR-..."
# Veja quais APIs funcionam e quais falham
# Identifique problemas específicos
```

### **4. Gerar Comandos CURL**

```powershell
.\test_ml_token.ps1 -AccessToken "APP_USR-..."
# No final, copia os comandos curl
# Usa em ferramentas como Postman/Insomnia
```

---

## 📚 Recursos Adicionais

**Documentação ML:**

- API Reference: https://developers.mercadolibre.com.br/pt_br/api-docs
- OAuth Guide: https://developers.mercadolibre.com.br/pt_br/autenticacao-e-autorizacao

**Scripts do Projeto:**

- `test_ml_token.ps1` - Testa APIs ML diretamente
- `scripts/get_ml_token.sql` - SQL para buscar token
- `test_e2e_authenticated.ps1` - Testa via aplicação MercaFlow

---

## ✅ Checklist

Antes de executar:

- [ ] Integração ML configurada em `/ml/auth`
- [ ] Token obtido do Supabase
- [ ] Script `test_ml_token.ps1` no diretório do projeto
- [ ] PowerShell aberto no diretório correto

Durante execução:

- [ ] Copiar token do Supabase
- [ ] Executar script com token como parâmetro
- [ ] Verificar sucessos/falhas
- [ ] (Opcional) Salvar respostas em JSON

Após execução:

- [ ] Validar que User Info funcionou (200)
- [ ] Verificar quantidade de produtos retornados
- [ ] Conferir se tem pedidos recentes
- [ ] Usar comandos CURL para testes adicionais

---

**Última atualização:** 2025-10-20  
**Versão:** 1.0.0
