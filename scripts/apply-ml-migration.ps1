# Script PowerShell para Aplicar Migration do Mercado Livre
# Autor: GitHub Copilot
# Data: 2025-10-18

param(
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceRoleKey,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

# Cores para output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "`n==============================================================================" "Cyan"
Write-ColorOutput "  MERCAFLOW - APLICAR MIGRATION MERCADO LIVRE" "Cyan"
Write-ColorOutput "==============================================================================" "Cyan"

# Verificar se .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-ColorOutput "`n❌ ERRO: Arquivo .env.local não encontrado!" "Red"
    Write-ColorOutput "   Crie o arquivo .env.local com suas credenciais Supabase" "Yellow"
    Write-ColorOutput "   Use .env.example como referência`n" "Yellow"
    exit 1
}

# Carregar variáveis de ambiente do .env.local
Write-ColorOutput "`n📋 Carregando variáveis de ambiente..." "Yellow"

Get-Content .env.local | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

# Usar parâmetros ou variáveis de ambiente
if (-not $SupabaseUrl) {
    $SupabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
}

if (-not $ServiceRoleKey) {
    $ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
}

# Validar credenciais
if (-not $SupabaseUrl -or $SupabaseUrl -eq "your-project-url") {
    Write-ColorOutput "`n❌ ERRO: NEXT_PUBLIC_SUPABASE_URL não configurado!" "Red"
    Write-ColorOutput "   Configure no arquivo .env.local`n" "Yellow"
    exit 1
}

if (-not $ServiceRoleKey -or $ServiceRoleKey -eq "your-service-role-key") {
    Write-ColorOutput "`n❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurado!" "Red"
    Write-ColorOutput "   Configure no arquivo .env.local`n" "Yellow"
    exit 1
}

Write-ColorOutput "✅ Credenciais carregadas" "Green"
Write-ColorOutput "   URL: $SupabaseUrl" "Gray"

# Ler arquivo SQL
$migrationFile = "supabase\migrations\20251018210135_recreate_ml_schema_complete.sql"

if (-not (Test-Path $migrationFile)) {
    Write-ColorOutput "`n❌ ERRO: Arquivo de migration não encontrado!" "Red"
    Write-ColorOutput "   Procurando: $migrationFile`n" "Yellow"
    exit 1
}

Write-ColorOutput "`n📄 Lendo arquivo de migration..." "Yellow"
$sqlContent = Get-Content -Path $migrationFile -Raw

# Contar tabelas que serão criadas
$tableCount = ([regex]::Matches($sqlContent, "CREATE TABLE")).Count
Write-ColorOutput "✅ Migration carregada ($tableCount tabelas serão recriadas)" "Green"

if ($DryRun) {
    Write-ColorOutput "`n⚠️  MODO DRY-RUN - Não será executado no banco" "Yellow"
    Write-ColorOutput "`nO seguinte seria executado:`n" "Gray"
    Write-ColorOutput $sqlContent.Substring(0, [Math]::Min(500, $sqlContent.Length)) "DarkGray"
    Write-ColorOutput "`n... (mais $($sqlContent.Length - 500) caracteres) ...`n" "DarkGray"
    exit 0
}

# Confirmar execução
Write-ColorOutput "`n⚠️  ATENÇÃO: Esta operação irá:" "Yellow"
Write-ColorOutput "   • APAGAR todas as tabelas ml_* existentes" "Red"
Write-ColorOutput "   • PERDER todos os dados do Mercado Livre" "Red"
Write-ColorOutput "   • RECRIAR schema completo do zero" "Green"
Write-ColorOutput "`n   Pressione qualquer tecla para continuar ou Ctrl+C para cancelar..." "White"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Executar migration via REST API
Write-ColorOutput "`n🚀 Executando migration no Supabase..." "Yellow"

try {
    # Endpoint para execução de SQL raw
    $endpoint = "$SupabaseUrl/rest/v1/rpc/exec_sql"
    
    # Headers
    $headers = @{
        "apikey" = $ServiceRoleKey
        "Authorization" = "Bearer $ServiceRoleKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=minimal"
    }
    
    # Body - tentar diferentes abordagens
    Write-ColorOutput "   Tentando executar via REST API..." "Gray"
    
    # Abordagem 1: Usar PostgREST query parameter
    $uri = "$SupabaseUrl/rest/v1/"
    
    # Como o PostgREST não tem endpoint exec_sql por padrão,
    # vamos tentar outra abordagem
    Write-ColorOutput "`n⚠️  AVISO: PostgREST não suporta SQL raw via REST API" "Yellow"
    Write-ColorOutput "   Você precisa executar a migration manualmente via:" "White"
    Write-ColorOutput "`n   OPÇÃO 1 (Recomendado):" "Cyan"
    Write-ColorOutput "   1. Acesse: $SupabaseUrl/project/_/sql/new" "White"
    Write-ColorOutput "   2. Cole o conteúdo de: $migrationFile" "White"
    Write-ColorOutput "   3. Clique em 'Run'" "White"
    
    Write-ColorOutput "`n   OPÇÃO 2 (Via psql):" "Cyan"
    Write-ColorOutput "   1. Obtenha a connection string no Dashboard > Settings > Database" "White"
    Write-ColorOutput "   2. Execute:" "White"
    Write-ColorOutput "      psql 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres' -f $migrationFile" "Gray"
    
    Write-ColorOutput "`n   OPÇÃO 3 (Copiar SQL):" "Cyan"
    Write-ColorOutput "   O conteúdo do SQL foi copiado para a área de transferência (se disponível)" "White"
    
    # Tentar copiar para clipboard
    try {
        $sqlContent | Set-Clipboard
        Write-ColorOutput "   ✅ SQL copiado para área de transferência!" "Green"
    } catch {
        Write-ColorOutput "   ⚠️  Não foi possível copiar automaticamente" "Yellow"
    }
    
} catch {
    Write-ColorOutput "`n❌ ERRO ao executar migration:" "Red"
    Write-ColorOutput "   $($_.Exception.Message)" "Red"
    Write-ColorOutput "`n   Use uma das opções manuais acima`n" "Yellow"
    exit 1
}

Write-ColorOutput "`n==============================================================================" "Cyan"
Write-ColorOutput "  PRÓXIMOS PASSOS" "Cyan"
Write-ColorOutput "==============================================================================" "Cyan"
Write-ColorOutput "1. Execute a migration via Supabase Dashboard (SQL Editor)" "White"
Write-ColorOutput "2. Verifique se as tabelas foram criadas:" "White"
Write-ColorOutput "   SELECT table_name FROM information_schema.tables" "Gray"
Write-ColorOutput "   WHERE table_schema = 'public' AND table_name LIKE 'ml_%'" "Gray"
Write-ColorOutput "3. Reinicie o servidor: npm run dev" "White"
Write-ColorOutput "4. Teste o OAuth: http://localhost:3000/dashboard/ml" "White"
Write-ColorOutput "`n✅ Script concluído`n" "Green"
