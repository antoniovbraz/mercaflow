# 🚨 SEGURANÇA: Remoção de .env.production do Git

## ⚠️ ATENÇÃO - LEIA ANTES DE EXECUTAR

O arquivo `.env.production` foi **commitado acidentalmente** no repositório Git e precisa ser removido do histórico completo.

## 🔒 Status Atual

✅ **Ações já realizadas**:

- `.env.production` removido do índice Git (`git rm --cached`)
- Commit de remoção criado
- `.gitignore` já estava configurado corretamente

❌ **Pendente - CRÍTICO**:

- Limpar histórico Git (arquivo ainda está em commits antigos)
- Force push para GitHub (sobrescrever histórico remoto)
- **ROTAR TODAS AS CREDENCIAIS** expostas

---

## 🚨 AÇÃO IMEDIATA NECESSÁRIA

### 1. ROTAR CREDENCIAIS (PRIORIDADE MÁXIMA)

**Antes de limpar o Git**, você precisa **invalidar e regenerar** todas as credenciais que estavam em `.env.production`:

#### Supabase

1. Acesse: https://app.supabase.com/project/_/settings/api
2. Clique em "Reset database password"
3. Regenere `SUPABASE_SERVICE_ROLE_KEY`:
   - Settings > API > Service Role Key
   - Click "Reset" (se disponível) ou use o existente apenas em local
4. Atualize `.env.local` com novas credenciais

#### Mercado Livre

1. Acesse: https://developers.mercadolibre.com.br/
2. Applications > Seu App > Edit
3. Clique em "Regenerate Secret Key"
4. Atualize `ML_CLIENT_SECRET` em `.env.local`

#### Upstash Redis

1. Acesse: https://console.upstash.com/
2. Seu Database > Details
3. Click "Rotate Token" (ou crie novo token)
4. Atualize `UPSTASH_REDIS_REST_TOKEN`

#### OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Revoke a chave exposta
3. Crie nova chave
4. Atualize `OPENAI_API_KEY`

#### Sentry

1. Acesse: https://sentry.io/settings/
2. Auth Tokens > Revoke token exposto
3. Crie novo token
4. Atualize `SENTRY_AUTH_TOKEN`

#### Encryption Keys

1. Gere novas chaves:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Atualize `ENCRYPTION_KEY` e `ML_TOKEN_ENCRYPTION_KEY`

---

### 2. Limpar Histórico Git

**ATENÇÃO**: Isso irá reescrever o históório. Outros desenvolvedores precisarão re-clonar.

#### Opção A: Usando PowerShell (Windows)

```powershell
# 1. Backup do repo
cd C:\Work\microsaas
Copy-Item -Recurse mercaflow "mercaflow-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
cd mercaflow

# 2. Remover do histórico
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.production" --prune-empty --tag-name-filter cat -- --all

# 3. Limpar referências
Remove-Item -Recurse -Force .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Verificar que foi removido
git log --all --full-history -- .env.production
# (não deve mostrar nada)

# 5. Force push para GitHub
git push origin --force --all
git push origin --force --tags
```

#### Opção B: Usando Git Bash (recomendado)

```bash
# Execute o script fornecido
bash scripts/remove-env-from-history.sh
```

#### Opção C: Método Moderno (git-filter-repo)

Se tiver Python instalado:

```powershell
# Instalar git-filter-repo
pip install git-filter-repo

# Remover arquivo
git filter-repo --path .env.production --invert-paths --force

# Push
git push origin --force --all
```

---

### 3. Verificações Pós-Limpeza

```powershell
# 1. Verificar que arquivo foi removido do histórico
git log --all --full-history -- .env.production
# Deve retornar vazio

# 2. Verificar que não está no Git
git ls-files | Select-String "\.env\.production"
# Não deve aparecer

# 3. Verificar que ainda existe localmente
Test-Path .env.production
# Deve retornar True (arquivo local preservado)

# 4. Verificar .gitignore
cat .gitignore | Select-String "\.env"
# Deve mostrar .env.production na lista
```

---

## 📋 Checklist de Segurança

- [ ] **PASSO 1**: Rotar TODAS as credenciais listadas acima
- [ ] **PASSO 2**: Limpar histórico Git local
- [ ] **PASSO 3**: Force push para GitHub
- [ ] **PASSO 4**: Verificar no GitHub que histórico foi limpo
- [ ] **PASSO 5**: Avisar outros desenvolvedores para re-clonar
- [ ] **PASSO 6**: Atualizar `.env.local` com novas credenciais
- [ ] **PASSO 7**: Testar aplicação com novas credenciais
- [ ] **PASSO 8**: Monitorar logs para atividades suspeitas

---

## 🔐 Prevenção Futura

### Adicionar pre-commit hook

Crie `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Prevenir commit de arquivos .env

if git diff --cached --name-only | grep -E '\.env$|\.env\..*$' | grep -v '\.env\.example$'; then
  echo "❌ ERRO: Tentativa de commit de arquivo .env detectada!"
  echo "Arquivos bloqueados:"
  git diff --cached --name-only | grep -E '\.env$|\.env\..*$' | grep -v '\.env\.example$'
  echo ""
  echo "Use 'git reset HEAD <arquivo>' para remover do staging"
  exit 1
fi
```

Tornar executável:

```powershell
# No Git Bash
chmod +x .git/hooks/pre-commit
```

### Usar git-secrets (GitHub)

```powershell
# Instalar git-secrets
git secrets --install
git secrets --register-aws
```

---

## 📞 Em Caso de Emergência

Se suspeitar que credenciais foram usadas maliciosamente:

1. **Supabase**: Pause o projeto temporariamente
2. **ML**: Desative o aplicativo temporariamente
3. **Vercel**: Pause o deployment
4. **Monitore**: Sentry, logs do Supabase, logs do Vercel
5. **Contate**: Suporte das plataformas se necessário

---

## ✅ Status

- [x] `.env.production` removido do índice Git
- [x] Commit de remoção criado
- [ ] **Histórico Git limpo** ← FAZER AGORA
- [ ] **Credenciais rotacionadas** ← FAZER AGORA
- [ ] Force push para GitHub
- [ ] Verificação de segurança concluída

---

**Criado**: 18 de Outubro de 2025  
**Prioridade**: 🚨 **CRÍTICA - EXECUTAR IMEDIATAMENTE**
