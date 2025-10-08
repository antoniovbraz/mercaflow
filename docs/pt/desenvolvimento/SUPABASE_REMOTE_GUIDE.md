# 📖 GUIA SUPABASE - TRABALHO REMOTO (SEM DOCKER)

## 🎯 CONFIGURAÇÃO INICIAL (Uma vez só)

### 1. Conectar ao Projeto Remoto
```bash
npx supabase link --project-ref pnzbnciiokgiadkfgrcn
```

### 2. Verificar Conexão
```bash
npx supabase projects list
```

## 🔧 COMANDOS PRINCIPAIS (Sempre Remotos)

### Migrações
```bash
# Aplicar migrações ao banco remoto
npx supabase db push

# Criar nova migração
npx supabase migration new nome_da_migracao

# Ver histórico de migrações
npx supabase migration list
```

### Gerenciamento de Schema
```bash
# Resetar banco remoto (CUIDADO!)
npx supabase db reset

# Fazer backup do schema atual
npx supabase db dump --schema-only > backup.sql
```

### Edge Functions (Se necessário)
```bash
# Deploy functions
npx supabase functions deploy

# Ver logs das functions
npx supabase functions logs
```

## ❌ COMANDOS QUE NÃO USAMOS (Requerem Docker)

```bash
# ❌ NÃO usar - requer Docker
npx supabase start
npx supabase status
npx supabase db diff
npx supabase test
```

## ✅ FLUXO DE TRABALHO RECOMENDADO

### 1. Fazer Mudanças no Schema
```bash
# Criar nova migração
npx supabase migration new add_nova_feature

# Editar o arquivo SQL gerado
# Aplicar ao remoto
npx supabase db push
```

### 2. Desenvolvimento
```bash
# Trabalhar diretamente contra produção
# Usar environment variables (.env.local)
# Testar mudanças na aplicação
```

### 3. Deploy
```bash
# Git add/commit/push
# Vercel faz deploy automático
# Migrações já aplicadas via db push
```

## 🔐 VARIÁVEIS DE AMBIENTE

Sempre usar as de produção:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pnzbnciiokgiadkfgrcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## 🚨 CUIDADOS IMPORTANTES

1. **Backup antes de mudanças grandes**
2. **Testar migrações em desenvolvimento**
3. **Não fazer DROP TABLE sem backup**
4. **Usar transações em SQL complexo**

## 📞 SUPORTE

Se precisar de modo local:
1. Instalar Docker Desktop
2. Usar: `npx supabase start`
3. Desenvolvimento isolado

**RECOMENDAÇÃO**: Manter sempre modo remoto para simplicidade.