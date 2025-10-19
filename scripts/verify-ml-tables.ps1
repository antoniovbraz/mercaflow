# Verificar se as tabelas ML existem no banco remoto
# MercaFlow - Verificação de Migration

Write-Host "`n🔍 Verificando tabelas ML no banco de dados remoto..." -ForegroundColor Cyan

# Carregar variáveis de ambiente
if (Test-Path ".env.local") {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$anonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

if (-not $supabaseUrl -or -not $anonKey) {
    Write-Host "❌ Variáveis de ambiente não encontradas!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Conectando ao Supabase: $supabaseUrl" -ForegroundColor Green

# Query para verificar tabelas
$query = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'ml_%'
ORDER BY table_name
"@

Write-Host "`n📊 Consultando tabelas..." -ForegroundColor Yellow

try {
    # Usar psql se disponível, senão usar API
    $psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue
    
    if ($psqlAvailable) {
        Write-Host "   Usando psql..." -ForegroundColor Gray
        
        # Extrair connection string das variáveis
        $projectRef = ($supabaseUrl -split "//")[1] -replace "\.supabase\.co.*", ""
        
        Write-Host "`n⚠️  Para usar psql, você precisa:" -ForegroundColor Yellow
        Write-Host "   1. Obter a senha do banco no Supabase Dashboard > Settings > Database" -ForegroundColor White
        Write-Host "   2. Executar:" -ForegroundColor White
        Write-Host "      psql 'postgresql://postgres:[PASSWORD]@db.$projectRef.supabase.co:5432/postgres' -c `"$query`"" -ForegroundColor Gray
    } else {
        Write-Host "   psql não disponível, use Supabase Dashboard" -ForegroundColor Gray
    }
    
    Write-Host "`n✅ ALTERNATIVA RECOMENDADA:" -ForegroundColor Green
    Write-Host "   1. Acesse: $supabaseUrl/project/_/editor" -ForegroundColor White
    Write-Host "   2. No SQL Editor, execute:" -ForegroundColor White
    Write-Host ""
    Write-Host $query -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   3. Você deve ver 8 tabelas:" -ForegroundColor White
    Write-Host "      - ml_integrations" -ForegroundColor Gray
    Write-Host "      - ml_messages" -ForegroundColor Gray
    Write-Host "      - ml_oauth_states" -ForegroundColor Gray
    Write-Host "      - ml_orders" -ForegroundColor Gray
    Write-Host "      - ml_products" -ForegroundColor Gray
    Write-Host "      - ml_questions" -ForegroundColor Gray
    Write-Host "      - ml_sync_logs" -ForegroundColor Gray
    Write-Host "      - ml_webhook_logs" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Script concluído`n" -ForegroundColor Green
