<#
.SYNOPSIS
    Get ML Token via MercaFlow API and test ML endpoints
    
.DESCRIPTION
    Fetches decrypted ML access token from MercaFlow API and tests Mercado Livre endpoints.
    Requires authentication cookie from browser.
    
.PARAMETER BaseUrl
    MercaFlow base URL (default: http://localhost:3000)
    
.PARAMETER Cookie
    Authentication cookie from browser (sb-access-token)
    
.EXAMPLE
    .\get_ml_token_api.ps1
    
.EXAMPLE
    .\get_ml_token_api.ps1 -BaseUrl "https://mercaflow.vercel.app"
#>

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Cookie = ""
)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MercaFlow - ML Token via API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get cookie if not provided
if ([string]::IsNullOrEmpty($Cookie)) {
    Write-Host "📋 Como obter o cookie de autenticação:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Abra o navegador e faça login em:" -ForegroundColor White
    Write-Host "   $BaseUrl/login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Pressione F12 para abrir DevTools" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Vá para a aba 'Application' ou 'Armazenamento'" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Procure por 'Cookies' → seu domínio" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Copie o valor do cookie 'sb-access-token'" -ForegroundColor White
    Write-Host ""
    Write-Host "6. Execute novamente:" -ForegroundColor White
    Write-Host "   .\get_ml_token_api.ps1 -Cookie 'VALOR_DO_COOKIE'" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host "🔍 Step 1: Buscando token via API..." -ForegroundColor Green
Write-Host ""

try {
    # Call debug-token API
    $apiUrl = "$BaseUrl/api/ml/debug-token"
    
    Write-Host "  URL: $apiUrl" -ForegroundColor Gray
    Write-Host "  Cookie: $($Cookie.Substring(0, [Math]::Min(50, $Cookie.Length)))..." -ForegroundColor Gray
    Write-Host ""
    
    $headers = @{
        'Cookie' = "sb-access-token=$Cookie"
    }
    
    $response = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers $headers -ErrorAction Stop
    
    if ($response.success -ne $true) {
        Write-Host "❌ Erro: API retornou falha" -ForegroundColor Red
        Write-Host $response | ConvertTo-Json -Depth 5
        exit 1
    }
    
    Write-Host "✅ Token obtido com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Display integration info
    Write-Host "📊 Informações da Integração:" -ForegroundColor Cyan
    Write-Host "  Integration ID: $($response.integration.id)" -ForegroundColor White
    Write-Host "  ML User ID: $($response.integration.ml_user_id)" -ForegroundColor White
    Write-Host "  Criado em: $($response.integration.created_at)" -ForegroundColor White
    Write-Host "  Atualizado em: $($response.integration.updated_at)" -ForegroundColor White
    Write-Host "  Expira em: $($response.integration.expires_at)" -ForegroundColor White
    
    if ($response.integration.is_expired) {
        Write-Host "  Status: ❌ Token EXPIRADO" -ForegroundColor Red
        Write-Host ""
        Write-Host "⚠️  Token expirado! Reconecte com ML em:" -ForegroundColor Yellow
        Write-Host "   $BaseUrl/ml/auth" -ForegroundColor Cyan
        exit 1
    } else {
        $expiresIn = $response.integration.expires_in_minutes
        Write-Host "  Status: ✅ Token VÁLIDO (expira em $expiresIn minutos)" -ForegroundColor Green
    }
    
    Write-Host ""
    
    # Display token info
    Write-Host "🔑 Token de Acesso:" -ForegroundColor Cyan
    Write-Host "  Preview: $($response.token.preview)" -ForegroundColor Gray
    Write-Host "  Tamanho: $($response.token.length) caracteres" -ForegroundColor Gray
    Write-Host "  Tipo: $($response.token.token_type)" -ForegroundColor Gray
    Write-Host ""
    
    $accessToken = $response.token.access_token
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🧪 Testando APIs do Mercado Livre" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    # Test 1: User Info
    Write-Host "Test 1: User Info" -ForegroundColor Yellow
    Write-Host "  Endpoint: /users/me" -ForegroundColor Gray
    try {
        $mlHeaders = @{
            'Authorization' = "Bearer $accessToken"
        }
        $userInfo = Invoke-RestMethod -Uri "https://api.mercadolibre.com/users/me" -Method GET -Headers $mlHeaders -ErrorAction Stop
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ✅ Status: 200 OK ($elapsed ms)" -ForegroundColor Green
        Write-Host "  User ID: $($userInfo.id)" -ForegroundColor White
        Write-Host "  Nickname: $($userInfo.nickname)" -ForegroundColor White
        Write-Host "  Email: $($userInfo.email)" -ForegroundColor White
        Write-Host ""
    } catch {
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ❌ Erro: $($_.Exception.Message) ($elapsed ms)" -ForegroundColor Red
        Write-Host ""
    }
    
    $stopwatch.Restart()
    
    # Test 2: Items
    Write-Host "Test 2: Items (Produtos)" -ForegroundColor Yellow
    Write-Host "  Endpoint: /users/me/items/search" -ForegroundColor Gray
    try {
        $items = Invoke-RestMethod -Uri "https://api.mercadolibre.com/users/me/items/search?status=active&limit=5" -Method GET -Headers $mlHeaders -ErrorAction Stop
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ✅ Status: 200 OK ($elapsed ms)" -ForegroundColor Green
        Write-Host "  Total de produtos: $($items.paging.total)" -ForegroundColor White
        Write-Host "  Produtos retornados: $($items.results.Count)" -ForegroundColor White
        if ($items.results.Count -gt 0) {
            Write-Host "  Primeiros IDs: $($items.results[0..[Math]::Min(2, $items.results.Count-1)] -join ', ')" -ForegroundColor Gray
        }
        Write-Host ""
    } catch {
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ❌ Erro: $($_.Exception.Message) ($elapsed ms)" -ForegroundColor Red
        Write-Host ""
    }
    
    $stopwatch.Restart()
    
    # Test 3: Orders
    Write-Host "Test 3: Orders (Pedidos)" -ForegroundColor Yellow
    Write-Host "  Endpoint: /orders/search" -ForegroundColor Gray
    try {
        $orders = Invoke-RestMethod -Uri "https://api.mercadolibre.com/orders/search?seller=me&sort=date_desc&limit=5" -Method GET -Headers $mlHeaders -ErrorAction Stop
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ✅ Status: 200 OK ($elapsed ms)" -ForegroundColor Green
        Write-Host "  Total de pedidos: $($orders.paging.total)" -ForegroundColor White
        Write-Host "  Pedidos retornados: $($orders.results.Count)" -ForegroundColor White
        Write-Host ""
    } catch {
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ❌ Erro: $($_.Exception.Message) ($elapsed ms)" -ForegroundColor Red
        Write-Host ""
    }
    
    $stopwatch.Restart()
    
    # Test 4: Questions
    Write-Host "Test 4: Questions (Perguntas)" -ForegroundColor Yellow
    Write-Host "  Endpoint: /my/received_questions/search" -ForegroundColor Gray
    try {
        $questions = Invoke-RestMethod -Uri "https://api.mercadolibre.com/my/received_questions/search?api_version=4&limit=5" -Method GET -Headers $mlHeaders -ErrorAction Stop
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ✅ Status: 200 OK ($elapsed ms)" -ForegroundColor Green
        Write-Host "  Total de perguntas: $($questions.total)" -ForegroundColor White
        Write-Host "  Perguntas retornadas: $($questions.questions.Count)" -ForegroundColor White
        Write-Host ""
    } catch {
        $elapsed = $stopwatch.ElapsedMilliseconds
        Write-Host "  ❌ Erro: $($_.Exception.Message) ($elapsed ms)" -ForegroundColor Red
        Write-Host ""
    }
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "📋 Comandos CURL para Testes Manuais" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "User Info:" -ForegroundColor Yellow
    Write-Host $response.usage.curl_example -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Items:" -ForegroundColor Yellow
    Write-Host "curl -X GET 'https://api.mercadolibre.com/users/me/items/search?status=active&limit=5' -H 'Authorization: Bearer $accessToken'" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Orders:" -ForegroundColor Yellow
    Write-Host "curl -X GET 'https://api.mercadolibre.com/orders/search?seller=me&sort=date_desc&limit=5' -H 'Authorization: Bearer $accessToken'" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "✅ Testes Completos!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Save token to file for later use
    $tokenFile = "ml_token_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    $accessToken | Out-File -FilePath $tokenFile -Encoding UTF8
    Write-Host "💾 Token salvo em: $tokenFile" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao buscar token:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*Unauthorized*") {
        Write-Host "⚠️  Cookie inválido ou expirado. Faça login novamente." -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*403*" -or $_.Exception.Message -like "*Forbidden*") {
        Write-Host "⚠️  Acesso negado. Endpoint requer role super_admin." -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*404*") {
        Write-Host "⚠️  Integração ML não encontrada. Configure em:" -ForegroundColor Yellow
        Write-Host "   $BaseUrl/ml/auth" -ForegroundColor Cyan
    }
    
    Write-Host ""
    exit 1
}
