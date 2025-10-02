# 🔧 Variáveis de Ambiente Faltantes - Vercel
# Adicione estas variáveis no Vercel Dashboard

# =======================================================
# OBRIGATÓRIAS - ADICIONAR IMEDIATAMENTE
# =======================================================

# NextAuth Configuration (CRÍTICO para autenticação)
NEXTAUTH_URL=https://mercaflow.vercel.app
NEXTAUTH_SECRET=generate_a_very_strong_secret_here_32_chars_minimum

# MercadoLibre API Base (para facilitar requests)
ML_API_BASE_URL=https://api.mercadolibre.com

# Node Environment (para otimizações de produção)
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# =======================================================
# RECOMENDADAS - ADICIONAR PARA FUNCIONALIDADE COMPLETA
# =======================================================

# Webhook Security (se disponível no ML)
ML_WEBHOOK_SECRET=seu_webhook_secret_se_disponivel

# App Metadata
NEXT_PUBLIC_APP_NAME=Merca Flow
NEXT_PUBLIC_APP_VERSION=0.1.0

# =======================================================
# OPCIONAL - PARA MONITORAMENTO E ANALYTICS
# =======================================================

# Error Tracking (Sentry)
# SENTRY_DSN=https://your-sentry-dsn-here

# Analytics (se decidir usar)
# GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
# POSTHOG_KEY=your-posthog-key-here

# Performance Monitoring
# VERCEL_ANALYTICS_ID=automatically_provided_by_vercel

# =======================================================
# INSTRUÇÕES DE CONFIGURAÇÃO
# =======================================================

# 1. NEXTAUTH_SECRET: Gere um secret forte
#    Execute: openssl rand -base64 32
#    Ou use: https://generate-secret.vercel.app/32

# 2. NEXTAUTH_URL: 
#    - Development: http://localhost:3000
#    - Production: https://mercaflow.vercel.app

# 3. Todas as outras variáveis ML_* e SUPABASE_* já estão corretas!

# =======================================================
# VALIDAÇÃO
# =======================================================
# Após adicionar, teste:
# https://mercaflow.vercel.app/api/test
# Deve mostrar todas as configurações como "true"