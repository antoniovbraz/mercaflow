# MercaFlow - ML API Token Viewer & Tester
# PowerShell script to view ML token and test ML APIs directly
# Run: .\test_ml_token.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$AccessToken = ""
)

$BaseUrl = "https://api.mercadolibre.com"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MercaFlow - ML Token & API Tester" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ====================
# Step 1: Get ML Token from Database
# ====================
if (-not $AccessToken) {
    Write-Host "Step 1: Buscando token do Mercado Livre..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Para obter seu token ML, execute este comando SQL no Supabase:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "SELECT " -ForegroundColor Gray
    Write-Host "  id," -ForegroundColor Gray
    Write-Host "  user_id," -ForegroundColor Gray
    Write-Host "  ml_user_id," -ForegroundColor Gray
    Write-Host "  access_token," -ForegroundColor Gray
    Write-Host "  refresh_token," -ForegroundColor Gray
    Write-Host "  expires_at," -ForegroundColor Gray
    Write-Host "  created_at" -ForegroundColor Gray
    Write-Host "FROM ml_integrations" -ForegroundColor Gray
    Write-Host "WHERE user_id = (SELECT id FROM auth.users WHERE email = 'peepers.shop@gmail.com');" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Ou acesse:" -ForegroundColor Yellow
    Write-Host "  1. https://supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Seu projeto > Table Editor > ml_integrations" -ForegroundColor Gray
    Write-Host "  3. Copie o valor de 'access_token'" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Depois execute:" -ForegroundColor Green
    Write-Host "  .\test_ml_token.ps1 -AccessToken 'APP_USR-...'" -ForegroundColor Cyan
    Write-Host ""
    
    exit 0
}

# ====================
# Step 2: Test ML APIs
# ====================
Write-Host "Step 2: Testando APIs do Mercado Livre..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Token: $($AccessToken.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""

# List of ML API endpoints to test
$mlApis = @(
    @{
        Name = "User Info"
        Url = "$BaseUrl/users/me"
        Description = "Informações do usuário autenticado"
    },
    @{
        Name = "Items (Produtos)"
        Url = "$BaseUrl/users/me/items/search?status=active&limit=5"
        Description = "Primeiros 5 produtos ativos"
    },
    @{
        Name = "Orders (Pedidos)"
        Url = "$BaseUrl/orders/search?seller=me&sort=date_desc&limit=5"
        Description = "Últimos 5 pedidos"
    },
    @{
        Name = "Questions"
        Url = "$BaseUrl/my/received_questions/search?api_version=4&limit=5"
        Description = "Últimas 5 perguntas"
    },
    @{
        Name = "Notifications"
        Url = "$BaseUrl/myfeeds?app_id=YOUR_APP_ID&limit=5"
        Description = "Últimas notificações"
    }
)

$results = @()
$passed = 0
$failed = 0

foreach ($api in $mlApis) {
    Write-Host "Testando: $($api.Name)" -ForegroundColor Cyan
    Write-Host "  Endpoint: $($api.Url)" -ForegroundColor DarkGray
    Write-Host "  Descrição: $($api.Description)" -ForegroundColor DarkGray
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $response = Invoke-RestMethod `
            -Uri $api.Url `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $AccessToken"
            } `
            -TimeoutSec 30
        
        $stopwatch.Stop()
        
        Write-Host "  ✓ Status: 200 OK" -ForegroundColor Green
        Write-Host "  ✓ Tempo: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
        Write-Host ""
        
        # Show sample data
        if ($response.results) {
            Write-Host "  Dados retornados: $($response.results.Count) items" -ForegroundColor Cyan
            if ($response.paging) {
                Write-Host "  Total disponível: $($response.paging.total)" -ForegroundColor Cyan
            }
        } elseif ($response.id) {
            Write-Host "  User ID: $($response.id)" -ForegroundColor Cyan
            if ($response.nickname) {
                Write-Host "  Nickname: $($response.nickname)" -ForegroundColor Cyan
            }
        }
        
        Write-Host "  Preview:" -ForegroundColor DarkGray
        $preview = ($response | ConvertTo-Json -Depth 2 -Compress).Substring(0, [Math]::Min(200, ($response | ConvertTo-Json -Depth 2 -Compress).Length))
        Write-Host "  $preview..." -ForegroundColor DarkGray
        Write-Host ""
        
        $passed++
        $results += @{
            API = $api.Name
            Status = "PASS"
            Time = $stopwatch.ElapsedMilliseconds
            Data = $response
        }
        
    } catch {
        $stopwatch.Stop()
        $statusCode = "Error"
        $errorMsg = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            
            # Try to get error details
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorBody = $reader.ReadToEnd()
                $errorData = $errorBody | ConvertFrom-Json
                $errorMsg = $errorData.message
            } catch {
                # Ignore parse errors
            }
        }
        
        Write-Host "  ✗ Status: $statusCode" -ForegroundColor Red
        Write-Host "  ✗ Erro: $errorMsg" -ForegroundColor Red
        Write-Host ""
        
        $failed++
        $results += @{
            API = $api.Name
            Status = "FAIL"
            Time = $stopwatch.ElapsedMilliseconds
            Error = $errorMsg
        }
    }
    
    Start-Sleep -Milliseconds 500
}

# ====================
# Step 3: Summary
# ====================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Resumo dos Testes" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$total = $passed + $failed
$successRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "Total de Testes: $total" -ForegroundColor Gray
Write-Host "Sucessos: $passed" -ForegroundColor Green
Write-Host "Falhas: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "Taxa de Sucesso: ${successRate}%" -ForegroundColor $(
    if ($successRate -eq 100) { "Green" }
    elseif ($successRate -ge 75) { "Yellow" }
    else { "Red" }
)
Write-Host ""

# ====================
# Step 4: Save Full Response (Optional)
# ====================
Write-Host "Deseja salvar as respostas completas em arquivo? (s/n): " -ForegroundColor Yellow -NoNewline
$save = Read-Host

if ($save -eq "s" -or $save -eq "S") {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "ml_api_responses_$timestamp.json"
    
    $results | ConvertTo-Json -Depth 10 | Out-File $filename
    
    Write-Host ""
    Write-Host "✓ Respostas salvas em: $filename" -ForegroundColor Green
    Write-Host ""
}

# ====================
# Step 5: Generate CURL Commands
# ====================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Comandos CURL para Testes Manuais" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($api in $mlApis) {
    Write-Host "$($api.Name):" -ForegroundColor Yellow
    Write-Host "curl -X GET '$($api.Url)' \" -ForegroundColor Gray
    Write-Host "  -H 'Authorization: Bearer $AccessToken'" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testes Completos!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
