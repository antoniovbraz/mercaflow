# TESTE IMEDIATO - Login Manual
# Como obter seu token de autenticação em 30 segundos

Write-Host "=========================================="
Write-Host "GUIA RÁPIDO: Como Obter Seu Token" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""

Write-Host "PASSO 1: Abrir página de login" -ForegroundColor Yellow
Write-Host "Execute:" -ForegroundColor Gray
Write-Host "  start https://mercaflow.vercel.app/login" -ForegroundColor Green
Write-Host ""

Write-Host "PASSO 2: Fazer login" -ForegroundColor Yellow
Write-Host "  Email: peepers.shop@gmail.com" -ForegroundColor Gray
Write-Host "  Senha: vGBg9h2axG8Jt4H" -ForegroundColor Gray
Write-Host ""

Write-Host "PASSO 3: Abrir DevTools" -ForegroundColor Yellow
Write-Host "  Pressione F12" -ForegroundColor Gray
Write-Host ""

Write-Host "PASSO 4: Ir para Cookies" -ForegroundColor Yellow
Write-Host "  1. Clique na aba 'Application' (ou 'Aplicativo')" -ForegroundColor Gray
Write-Host "  2. No menu lateral esquerdo, expanda 'Cookies'" -ForegroundColor Gray
Write-Host "  3. Clique em 'https://mercaflow.vercel.app'" -ForegroundColor Gray
Write-Host ""

Write-Host "PASSO 5: Copiar o token" -ForegroundColor Yellow
Write-Host "  Procure o cookie com nome começando com:" -ForegroundColor Gray
Write-Host "    - 'sb-access-token'" -ForegroundColor Green
Write-Host "    - ou similar do Supabase" -ForegroundColor Gray
Write-Host ""
Write-Host "  Clique duas vezes no VALOR do cookie" -ForegroundColor Gray
Write-Host "  Copie (Ctrl+C)" -ForegroundColor Gray
Write-Host ""

Write-Host "PASSO 6: Executar teste" -ForegroundColor Yellow
Write-Host "  .\test_with_cookie.ps1 -AccessToken 'COLE_AQUI_O_TOKEN'" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================="
Write-Host "Iniciando navegador..." -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""

# Abrir automaticamente o browser
Start-Process "https://mercaflow.vercel.app/login"

Write-Host "✓ Browser aberto!" -ForegroundColor Green
Write-Host ""
Write-Host "Aguardando você:" -ForegroundColor Yellow
Write-Host "  1. Fazer login" -ForegroundColor Gray
Write-Host "  2. Abrir F12 > Application > Cookies" -ForegroundColor Gray
Write-Host "  3. Copiar o valor de 'sb-access-token'" -ForegroundColor Gray
Write-Host "  4. Voltar aqui e executar:" -ForegroundColor Gray
Write-Host ""
Write-Host "     .\test_with_cookie.ps1 -AccessToken 'SEU_TOKEN'" -ForegroundColor Cyan
Write-Host ""
