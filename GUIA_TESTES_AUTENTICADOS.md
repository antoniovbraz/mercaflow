# 🔐 Guia: Testando Endpoints Autenticados

## MercaFlow - Testing Authenticated APIs

**Data:** 2025-01-22  
**Ambiente:** Produção (https://mercaflow.vercel.app)

---

## 📋 Visão Geral

Existem **3 métodos principais** para testar endpoints que requerem autenticação:

1. ✅ **Script Automático com Login** (RECOMENDADO)
2. ⚙️ **Captura Manual de Cookie do Browser**
3. 🔧 **Supabase Service Role** (apenas para testes internos)

---

## Método 1: Script Automático com Login ⭐ RECOMENDADO

### Como Usar:

```powershell
# Criar usuário de teste primeiro (via interface web ou Supabase)
# Depois executar:

.\test_e2e_authenticated.ps1 -Email "seu-email@example.com" -Password "sua-senha"
```

### Exemplo Real:

```powershell
# 1. Criar usuário de teste em: https://mercaflow.vercel.app/register
#    Email: teste@mercaflow.com
#    Password: TesteMercaFlow2025!

# 2. Confirmar email (verificar inbox)

# 3. Executar testes
.\test_e2e_authenticated.ps1 -Email "teste@mercaflow.com" -Password "TesteMercaFlow2025!"
```

### O que o Script Faz:

1. **Login Automático:**

   - Faz POST para `/auth/login`
   - Captura cookies de sessão Supabase
   - Persiste cookies em `$session`

2. **Testa APIs Protegidas:**

   - GET `/api/settings` - Configurações do usuário
   - GET `/api/analytics/elasticity` - Análise de elasticidade
   - GET `/api/analytics/forecast` - Previsões
   - GET `/api/analytics/competitors` - Concorrentes
   - GET `/api/dashboard/kpis` - KPIs do dashboard
   - PUT `/api/settings` - Atualização de configurações

3. **Testa Páginas Protegidas:**

   - `/dashboard` - Dashboard principal
   - `/dashboard/configuracoes` - Configurações
   - `/produtos` - Gerenciamento de produtos

4. **Mostra Métricas:**
   - Tempo de resposta de cada API
   - Quantidade de dados retornados
   - Taxa de sucesso geral

### Saída Esperada:

```
==========================================
MercaFlow Authenticated E2E Tests
==========================================

Step 1: Authenticating...
  Email: teste@mercaflow.com

  ✓ Login successful!
  Session Cookies:
    - sb-access-token: eyJhbGciOiJIUzI1NiI...
    - sb-refresh-token: v1.1234567890abcd...

Step 2: Testing Protected APIs...

  ✓ User Settings API: 245ms
    Data received: 5 fields
  ✓ Price Elasticity API: 312ms
    Data received: 10 items
  ✓ Forecast API: 298ms
    Data received: 7 items
  ✓ Competitors API: 267ms
    Data received: 5 items
  ✓ Dashboard KPIs API: 289ms
    Data received: 8 fields

Step 3: Testing Settings Update...

  ✓ Settings Update: 198ms
    Updated: True

Step 4: Testing Dashboard Pages...

  ✓ /dashboard: Accessible
  ✓ /dashboard/configuracoes: Accessible
  ✓ /produtos: Accessible

==========================================
Test Summary
==========================================

Total Tests: 9
Passed: 9
Failed: 0
Success Rate: 100%

Performance Breakdown:
  User Settings API: 245ms
  Price Elasticity API: 312ms
  Forecast API: 298ms
  Competitors API: 267ms
  Dashboard KPIs API: 289ms

==========================================
All Authenticated Tests Passed!
==========================================
```

---

## Método 2: Captura Manual de Cookie do Browser

### Passo a Passo:

#### 1. Login no Browser

```
1. Abra https://mercaflow.vercel.app/login
2. Faça login com suas credenciais
3. Abra DevTools (F12)
4. Vá para Application > Cookies
5. Copie os cookies:
   - sb-access-token
   - sb-refresh-token
```

#### 2. Use os Cookies no Script

Crie um script personalizado:

```powershell
# test_with_manual_cookie.ps1

$BaseUrl = "https://mercaflow.vercel.app"

# COLE SEUS COOKIES AQUI (copie do browser)
$accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$refreshToken = "v1.1234567890abcdef..."

# Criar sessão com cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$domain = "mercaflow.vercel.app"

# Adicionar cookies manualmente
$cookie1 = New-Object System.Net.Cookie
$cookie1.Name = "sb-access-token"
$cookie1.Value = $accessToken
$cookie1.Domain = $domain
$session.Cookies.Add($cookie1)

$cookie2 = New-Object System.Net.Cookie
$cookie2.Name = "sb-refresh-token"
$cookie2.Value = $refreshToken
$cookie2.Domain = $domain
$session.Cookies.Add($cookie2)

# Testar API
try {
    $response = Invoke-WebRequest `
        -Uri "$BaseUrl/api/settings" `
        -Method GET `
        -WebSession $session

    Write-Host "✓ API funcionando!" -ForegroundColor Green
    Write-Host "Dados: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
}
```

### Executar:

```powershell
.\test_with_manual_cookie.ps1
```

---

## Método 3: Supabase Service Role (Testes Internos)

⚠️ **ATENÇÃO:** Use apenas para testes internos! Nunca exponha service role key.

### Criar Script de Teste Interno:

```powershell
# test_with_service_role.ps1
# APENAS PARA DESENVOLVIMENTO LOCAL

$supabaseUrl = "https://seu-projeto.supabase.co"
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY  # Da variável de ambiente

# Testar direct database access
$headers = @{
    "apikey" = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
}

try {
    $response = Invoke-RestMethod `
        -Uri "$supabaseUrl/rest/v1/user_settings?select=*" `
        -Method GET `
        -Headers $headers

    Write-Host "✓ Dados recuperados diretamente do banco" -ForegroundColor Green
    Write-Host "Total de registros: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## 🔧 Troubleshooting

### Problema: "Login failed (Status: 401)"

**Causas:**

- Email/senha incorretos
- Usuário não confirmou email
- Email ainda não verificado

**Solução:**

```powershell
# 1. Verificar se email foi confirmado
# 2. Resetar senha se necessário
# 3. Criar novo usuário de teste
```

### Problema: "Session expired" durante testes

**Causa:** Token Supabase expirou (padrão: 1 hora)

**Solução:**

```powershell
# Re-executar script (fará novo login automático)
.\test_e2e_authenticated.ps1 -Email "seu-email" -Password "sua-senha"
```

### Problema: APIs retornam dados vazios

**Causa:** Conta nova sem dados

**Solução:**

```powershell
# 1. Configure integração com Mercado Livre
# 2. Sincronize produtos
# 3. Aguarde coleta de dados (pode levar 24h)
# 4. Re-execute testes
```

### Problema: "CORS error" ao testar do browser

**Causa:** CORS não permite requisições de outros domínios

**Solução:**

```powershell
# Use scripts PowerShell (não sofrem de CORS)
# OU configure CORS no Next.js para ambiente de teste
```

---

## 📊 Comparação dos Métodos

| Método                | Facilidade | Automação | Segurança | Uso Recomendado         |
| --------------------- | ---------- | --------- | --------- | ----------------------- |
| **Script Automático** | 🟢 Fácil   | ✅ Total  | 🟢 Alta   | CI/CD, testes regulares |
| **Cookie Manual**     | 🟡 Médio   | ❌ Manual | 🟡 Média  | Debug pontual           |
| **Service Role**      | 🔴 Difícil | ✅ Total  | 🔴 Baixa  | Testes internos apenas  |

---

## 🚀 Integração com CI/CD

### GitHub Actions Example:

```yaml
# .github/workflows/e2e-authenticated.yml
name: E2E Authenticated Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run Authenticated E2E Tests
        shell: pwsh
        run: |
          .\test_e2e_authenticated.ps1 `
            -Email "${{ secrets.TEST_USER_EMAIL }}" `
            -Password "${{ secrets.TEST_USER_PASSWORD }}"
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

### Configurar Secrets no GitHub:

```
Settings > Secrets and variables > Actions > New repository secret

Nome: TEST_USER_EMAIL
Valor: teste@mercaflow.com

Nome: TEST_USER_PASSWORD
Valor: TesteMercaFlow2025!
```

---

## 📝 Checklist de Preparação

Antes de executar testes autenticados:

- [ ] Criar usuário de teste em produção
- [ ] Confirmar email do usuário de teste
- [ ] Fazer login manual para verificar credenciais
- [ ] (Opcional) Configurar integração ML e sincronizar dados
- [ ] Executar script de teste autenticado
- [ ] Validar todos os endpoints retornam dados
- [ ] Documentar credenciais de teste (seguro)
- [ ] Configurar secrets no CI/CD (se aplicável)

---

## 🎯 Próximos Passos

1. **Criar Usuário de Teste:**

   ```
   https://mercaflow.vercel.app/register
   Email: teste@mercaflow.com
   Password: TesteMercaFlow2025!
   ```

2. **Confirmar Email:**

   - Verificar inbox
   - Clicar no link de confirmação

3. **Executar Testes:**

   ```powershell
   .\test_e2e_authenticated.ps1 -Email "teste@mercaflow.com" -Password "TesteMercaFlow2025!"
   ```

4. **Validar Resultados:**

   - Verificar 100% de sucesso
   - Revisar métricas de performance
   - Confirmar dados retornados

5. **Integrar com CI/CD:**
   - Configurar GitHub Secrets
   - Adicionar workflow
   - Ativar testes automáticos

---

## 📞 Suporte

**Problemas com autenticação?**

- Verificar logs do Supabase: https://supabase.com/dashboard
- Revisar RLS policies: `supabase/migrations/`
- Testar manualmente no browser primeiro

**Dúvidas sobre os scripts?**

- Ver código fonte: `test_e2e_authenticated.ps1`
- Executar com `-Verbose` para debug
- Verificar documentação do PowerShell

---

**Última atualização:** 2025-01-22  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso
