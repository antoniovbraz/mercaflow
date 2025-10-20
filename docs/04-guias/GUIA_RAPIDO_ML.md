# ⚡ GUIA RÁPIDO: Corrigir Integração ML em 5 Minutos

## 🎯 Você está aqui porque...

```
❌ ERRO: Could not find the table 'public.ml_oauth_states' in the schema cache
```

**OAuth do Mercado Livre não funciona!**

---

## ✅ SOLUÇÃO EM 3 PASSOS

### 📍 PASSO 1: Acessar Supabase SQL Editor (30 segundos)

1. Abra: https://supabase.com/dashboard
2. Selecione seu projeto **MercaFlow**
3. Clique em **SQL Editor** (ícone de banco de dados no menu lateral)
4. Clique em **"New query"**

### 📍 PASSO 2: Executar Migration (60 segundos)

1. Abra o arquivo:

   ```
   supabase/migrations/20251018210135_recreate_ml_schema_complete.sql
   ```

2. Copie **TODO** o conteúdo (Ctrl+A → Ctrl+C)

3. Cole no SQL Editor do Supabase

4. Clique no botão **"Run"** (ou Ctrl+Enter)

5. Aguarde ~30 segundos

6. Você deve ver:
   ```
   ✅ Success
   NOTICE: ML Integration schema recreated successfully!
   NOTICE: Tables created: ml_oauth_states, ml_integrations, ...
   ```

### 📍 PASSO 3: Reiniciar Servidor (30 segundos)

```powershell
# No terminal do VS Code:

# 1. Parar servidor (se estiver rodando)
Ctrl+C

# 2. Limpar cache
Remove-Item -Recurse -Force .next

# 3. Iniciar novamente
npm run dev
```

---

## ✅ VERIFICAÇÃO (30 segundos)

### Teste 1: Verificar Tabelas

No SQL Editor do Supabase, execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'ml_%'
ORDER BY table_name;
```

**Deve retornar 8 tabelas**:

```
ml_integrations
ml_messages
ml_oauth_states     ← Esta era a que estava faltando!
ml_orders
ml_products
ml_questions
ml_sync_logs
ml_webhook_logs
```

### Teste 2: Testar OAuth

1. Acesse: http://localhost:3000/dashboard/ml

2. Clique em **"Conectar Mercado Livre"**

3. Você deve ser redirecionado para a página de autorização do ML

4. ✅ **Se funcionou**: PROBLEMA RESOLVIDO!

5. ❌ **Se erro**: Veja troubleshooting abaixo

---

## 🎉 PRONTO!

**Tempo total**: ~3-5 minutos

Se seguiu os passos acima, a integração ML agora funciona!

---

## 🐛 TROUBLESHOOTING RÁPIDO

### ❌ Erro: "permission denied" no SQL Editor

**Solução**: Você está usando uma conta com permissões limitadas.

1. Verifique se está logado como **Owner** do projeto
2. Ou use a **Service Role Key** para executar

### ❌ OAuth ainda não funciona

**Checklist**:

- [ ] Migration executada com sucesso? (viu mensagem de sucesso?)
- [ ] 8 tabelas criadas? (executou query de verificação?)
- [ ] Servidor reiniciado? (parou e iniciou `npm run dev`)
- [ ] `.env.local` tem `ML_CLIENT_ID` e `ML_CLIENT_SECRET`?
- [ ] Limpou cache do Next.js? (`Remove-Item -Recurse .next`)

### ❌ Erro: "ML_CLIENT_ID not configured"

**Solução**: Configure as variáveis de ambiente do Mercado Livre.

1. Copie `.env.example` para `.env.local`
2. Registre app no ML: https://developers.mercadolibre.com.br/
3. Preencha:
   ```env
   ML_CLIENT_ID=seu-client-id
   ML_CLIENT_SECRET=seu-client-secret
   ML_REDIRECT_URI=http://localhost:3000/api/ml/auth/callback
   ```

### ❌ Tabelas ainda não aparecem

**Solução**: Cache do Supabase não atualizou.

1. No Supabase Dashboard:
2. Settings → API → **Reset API Schema Cache**
3. Aguarde 30 segundos
4. Reinicie servidor Next.js

---

## 📚 MAIS INFORMAÇÕES

Se precisar de mais detalhes, consulte:

- **MIGRACAO_ML_RESUMO.md** - Resumo executivo completo
- **MIGRACAO_ML_INSTRUCOES.md** - Instruções passo a passo detalhadas
- **COMO_APLICAR_MIGRATION_ML.md** - Opções alternativas de aplicação

---

## 🆘 AINDA COM PROBLEMAS?

### Verificação Completa

Execute no terminal:

```powershell
# 1. Verificar se servidor está rodando
curl http://localhost:3000

# 2. Verificar variáveis de ambiente
Get-Content .env.local | Select-String "ML_"

# 3. Verificar logs do servidor
# (olhe o terminal onde executou npm run dev)
```

### Logs Esperados

**✅ CORRETO (após migration)**:

```
[info] Server started on http://localhost:3000
[info] [ml] / status=200
```

**❌ INCORRETO (antes da migration)**:

```
[error] Failed to store OAuth state: {
  code: 'PGRST205',
  details: null,
  message: "Could not find the table 'public.ml_oauth_states'"
}
```

---

## ⚠️ IMPORTANTE

**Esta migration APAGA todos os dados do Mercado Livre!**

Se você tem:

- ✅ **Aplicação nova**: PODE EXECUTAR sem medo
- ⚠️ **Dados de teste**: Serão perdidos (ok para dev)
- ❌ **Dados de produção**: FAÇA BACKUP primeiro!

Backup via Dashboard:

1. Database → Backups
2. Create Backup
3. Aguarde confirmação
4. Depois execute a migration

---

## ✅ CHECKLIST FINAL

- [ ] Migration aplicada via Supabase SQL Editor
- [ ] 8 tabelas `ml_*` criadas (verificado)
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Cache limpo (`.next` removido)
- [ ] OAuth testado (inicia sem erro)
- [ ] Logs limpos (sem erro PGRST205)

**Se todos os itens OK**: ✅ **MIGRAÇÃO COMPLETA!**

---

**⏱️ Tempo estimado**: 3-5 minutos  
**🔧 Dificuldade**: Fácil (copy/paste)  
**⚠️ Impacto**: Apaga dados ML (ok para dev)  
**✅ Resultado**: OAuth ML 100% funcional
