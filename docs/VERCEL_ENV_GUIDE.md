# 🚀 Guia Rápido: Gerenciar Variáveis no Vercel

## ✅ Status Atual

**Todas as variáveis obrigatórias já estão configuradas no Vercel!** 🎉

Variáveis configuradas:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `ML_CLIENT_ID`
- ✅ `ML_CLIENT_SECRET`
- ✅ `ENCRYPTION_KEY`
- ✅ `SUPER_ADMIN_EMAILS` ← **Nova variável já configurada!**

---

## 📋 Como Usar o Script

### Modo Interativo (Recomendado)

```bash
bash scripts/vercel-env.sh
```

Você verá um menu:
```
🔧 MercaFlow - Gerenciador de Variáveis de Ambiente Vercel

Escolha uma opção:
1) Listar todas as variáveis
2) Adicionar/Atualizar SUPER_ADMIN_EMAILS
3) Atualizar variável específica
4) Remover variável
5) Baixar variáveis (pull)
6) Verificar variáveis obrigatórias
0) Sair
```

### Comandos Diretos

```bash
# Ver todas as variáveis
bash scripts/vercel-env.sh list

# Atualizar SUPER_ADMIN_EMAILS
bash scripts/vercel-env.sh add

# Verificar se está tudo ok
bash scripts/vercel-env.sh check
```

---

## 🔄 Atualizar SUPER_ADMIN_EMAILS

Se você precisar adicionar ou remover emails de super admin:

```bash
bash scripts/vercel-env.sh add
```

O script perguntará:
```
Digite os emails de super admin separados por vírgula:
Exemplo: admin@exemplo.com,owner@exemplo.com
```

Digite seus emails (exemplo):
```
seu-email@gmail.com,outro-admin@exemplo.com
```

O script atualizará automaticamente em **todos os ambientes** (production, preview, development).

---

## 🌍 Ambientes Vercel

O Vercel tem 3 ambientes:

1. **Production** - Deploy quando faz push/merge para `main`
2. **Preview** - Deploy automático de PRs e branches
3. **Development** - Quando roda `vercel dev` localmente

**Importante**: O script configura a variável em **todos os 3 ambientes** automaticamente!

---

## 📥 Baixar Variáveis do Vercel

Para sincronizar as variáveis do Vercel com seu `.env.local`:

```bash
bash scripts/vercel-env.sh pull
```

Escolha o ambiente e as variáveis serão baixadas para:
- Production → `.env.production`
- Preview → `.env.preview`
- Development → `.env.development.local`

⚠️ **Não commite esses arquivos!** Eles já estão no `.gitignore`.

---

## 🔍 Verificar Configuração

Para ver se todas as variáveis obrigatórias existem:

```bash
bash scripts/vercel-env.sh check
```

Isso mostrará:
- Lista de variáveis obrigatórias
- Todas as variáveis configuradas no Vercel

---

## 💡 Exemplos de Uso

### Exemplo 1: Ver o que está configurado
```bash
bash scripts/vercel-env.sh list
```

### Exemplo 2: Atualizar emails de super admin
```bash
bash scripts/vercel-env.sh add
# Digite: admin@empresa.com,cto@empresa.com
```

### Exemplo 3: Adicionar nova variável
```bash
bash scripts/vercel-env.sh update
# Nome: NOVA_VARIAVEL
# Valor: seu-valor
# Ambiente: 4 (Todos)
```

### Exemplo 4: Baixar variáveis de produção
```bash
bash scripts/vercel-env.sh pull
# Escolha: 1 (Production)
# Arquivo criado: .env.production
```

---

## 🔐 Segurança

### ✅ Boas Práticas

- ✅ Nunca commite arquivos `.env*` com valores reais
- ✅ Use `SUPER_ADMIN_EMAILS` em vez de hardcode
- ✅ Rotacione `ENCRYPTION_KEY` periodicamente
- ✅ Use emails corporativos para super admins

### ❌ Evite

- ❌ Compartilhar `.env.local` por chat/email
- ❌ Hardcoded credentials no código
- ❌ Usar emails pessoais como super admin em produção
- ❌ Commitar segredos no Git

---

## 🆘 Troubleshooting

### "vercel: command not found"
```bash
npm install -g vercel
vercel login
```

### "Permission denied" ao executar script
```bash
chmod +x scripts/vercel-env.sh
```

### Variável não aparece no Vercel
```bash
# 1. Verificar se existe
vercel env ls

# 2. Se não existir, adicionar
vercel env add NOME_VARIAVEL production
```

### Deploy falhou após adicionar variável
```bash
# Fazer redeploy
vercel --prod

# Ou via GitHub
git commit --allow-empty -m "trigger deploy"
git push
```

---

## 📚 Comandos Vercel CLI Úteis

```bash
# Listar variáveis
vercel env ls

# Adicionar variável
vercel env add NOME_VAR production

# Remover variável
vercel env rm NOME_VAR production

# Pull variáveis
vercel env pull .env.local

# Login
vercel login

# Link projeto
vercel link

# Deploy
vercel --prod
```

---

## 🎯 Próximos Passos

Depois de configurar as variáveis:

1. ✅ Variáveis já configuradas no Vercel
2. 🔄 Fazer deploy: `git push origin main`
3. ✅ Verificar deploy no [Vercel Dashboard](https://vercel.com)
4. 🧪 Testar em produção
5. 📊 Monitorar logs e métricas

---

**Precisa de ajuda?** Consulte:
- [Documentação Vercel CLI](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Script README](scripts/README.md)

---

**Criado por**: Antonio V. Braz  
**Data**: 09/10/2025
