# Script para remover console.log/error de código de produção
# MercaFlow - Correção de Qualidade

Write-Host "🔧 Removendo console.log/error de código de produção..." -ForegroundColor Cyan

$files = @(
    "app\forgot-password\page.tsx",
    "app\auth\callback\page.tsx",
    "app\dashboard\webhooks\page.tsx",
    "app\dashboard\components\DashboardStats.tsx",
    "app\login\page.tsx",
    "app\ml\callback\page.tsx",
    "app\update-password\page.tsx",
    "app\produtos\page.tsx",
    "app\pedidos\page.tsx",
    "app\register\page.tsx"
)

$count = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "Processando: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        
        # Remover console.error
        $content = $content -replace "console\.error\([^)]+\)", "// Removed console.error - errors handled by error boundaries"
        
        # Remover console.log
        $content = $content -replace "console\.log\([^)]+\)", "// Removed console.log"
        
        # Remover console.warn
        $content = $content -replace "console\.warn\([^)]+\)", "// Removed console.warn"
        
        if ($content -ne $originalContent) {
            Set-Content $fullPath -Value $content -NoNewline
            $count++
            Write-Host "  ✅ Atualizado" -ForegroundColor Green
        } else {
            Write-Host "  ⏭️  Nenhuma alteração necessária" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  Arquivo não encontrado: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`n✅ Processo concluído! $count arquivo(s) atualizado(s)." -ForegroundColor Green
Write-Host "💡 Os erros agora são tratados por error boundaries e logging server-side." -ForegroundColor Cyan
