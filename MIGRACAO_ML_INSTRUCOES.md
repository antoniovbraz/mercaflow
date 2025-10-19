# 🔄 MIGRAÇÃO DO SCHEMA MERCADO LIVRE - INSTRUÇÕES

## ⚠️ PROBLEMA IDENTIFICADO

**Erro**: `Could not find the table 'public.ml_oauth_states' in the schema cache`

**Causa**: A tabela `ml_oauth_states` (e possivelmente outras tabelas ML) não foram criadas corretamente no banco de dados, apesar de existirem nas migrations.

**Solução**: Recriar todo o schema do Mercado Livre do zero com estrutura otimizada.

---

## 📋 O QUE FOI CRIADO

### 1. Nova Migration Completa

**Arquivo**: `supabase/migrations/20251018210135_recreate_ml_schema_complete.sql`

Esta migration:

- ✅ **Remove TODAS as tabelas antigas** do Mercado Livre (DROP CASCADE)
- ✅ **Recria 8 tabelas principais** com estrutura otimizada
- ✅ **Configura RLS policies** corretamente
- ✅ **Cria índices** para performance
- ✅ **Adiciona triggers** para updated_at automático
- ✅ **Cria funções auxiliares** (cleanup, summary)

### 2. Tabelas Criadas

| Tabela            | Descrição                    | Campos Principais                       |
| ----------------- | ---------------------------- | --------------------------------------- |
| `ml_oauth_states` | OAuth PKCE flow (temporário) | state, code_verifier, expires_at        |
| `ml_integrations` | Conexões ML (principal)      | access_token, refresh_token, ml_user_id |
| `ml_products`     | Produtos sincronizados       | ml_item_id, title, price, status        |
| `ml_orders`       | Pedidos                      | ml_order_id, status, total_amount       |
| `ml_questions`    | Perguntas de compradores     | ml_question_id, text, answer, status    |
| `ml_messages`     | Mensagens pós-venda          | ml_message_id, text, message_type       |
| `ml_webhook_logs` | Logs de webhooks ML          | topic, resource, payload, status        |
| `ml_sync_logs`    | Logs de sincronização        | sync_type, records_processed, status    |

### 3. Documentação de Suporte

- `COMO_APLICAR_MIGRATION_ML.md` - Guia completo de aplicação
- `scripts/apply-ml-migration.ps1` - Script PowerShell auxiliar

---

## 🚀 COMO APLICAR A MIGRATION

### ✅ OPÇÃO 1: Supabase Dashboard (RECOMENDADO)

**Mais fácil e seguro**

1. Acesse o SQL Editor do seu projeto:

   ```
   https://supabase.com/dashboard/project/[SEU-PROJECT-ID]/sql/new
   ```

2. Copie todo o conteúdo do arquivo:

   ```
   supabase/migrations/20251018210135_recreate_ml_schema_complete.sql
   ```

3. Cole no editor SQL

4. Clique em **"Run"** (ou pressione Ctrl+Enter)

5. Aguarde a execução (pode levar 10-30 segundos)

6. Verifique se apareceu mensagem de sucesso:
   ```
   ML Integration schema recreated successfully!
   ```

---

### ⚙️ OPÇÃO 2: Via Supabase CLI

**Se você tiver o projeto linkado**

```bash
# 1. Link o projeto (apenas primeira vez)
npx supabase link --project-ref SEU-PROJECT-REF

# 2. Aplique as migrations
npx supabase db push

# 3. Verifique o status
npx supabase migration list
```

---

### 💻 OPÇÃO 3: Via psql (Linha de Comando)

**Para usuários avançados**

```bash
# 1. Obtenha a connection string no Supabase Dashboard
# Settings > Database > Connection string (Direct connection)

# 2. Execute a migration
psql "postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/20251018210135_recreate_ml_schema_complete.sql
```

---

### 🔧 OPÇÃO 4: Script PowerShell

```powershell
# Execute o script auxiliar
.\scripts\apply-ml-migration.ps1

# Ou com dry-run (apenas mostra o que seria feito)
.\scripts\apply-ml-migration.ps1 -DryRun
```

**Nota**: O script irá guiá-lo para usar a Opção 1, pois a API REST do Supabase não permite execução direta de SQL raw.

---

## ✅ VERIFICAÇÃO PÓS-MIGRATION

### 1. Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'ml_%'
ORDER BY table_name;
```

**Resultado esperado** (8 tabelas):

```
ml_integrations
ml_messages
ml_oauth_states    ← Esta era a que estava faltando!
ml_orders
ml_products
ml_questions
ml_sync_logs
ml_webhook_logs
```

### 2. Verificar RLS Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'ml_%'
ORDER BY tablename, policyname;
```

Deve retornar várias policies (15+).

### 3. Verificar Funções

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%ml%'
ORDER BY routine_name;
```

Deve mostrar:

- `cleanup_expired_ml_oauth_states` (function)
- `get_ml_integration_summary` (function)

---

## 🔄 PRÓXIMOS PASSOS

### 1. Reiniciar o Servidor

```bash
# Pare o servidor se estiver rodando (Ctrl+C)

# Limpe o cache do Next.js
Remove-Item -Recurse -Force .next

# Inicie novamente
npm run dev
```

### 2. Testar OAuth do Mercado Livre

1. Acesse: http://localhost:3000/dashboard/ml

2. Clique em **"Conectar Mercado Livre"**

3. Verifique se o fluxo OAuth inicia sem erros

4. Após autorizar no ML, você deve ser redirecionado de volta

5. Verifique se a integração aparece na tabela `ml_integrations`:
   ```sql
   SELECT id, ml_user_id, ml_nickname, status, created_at
   FROM ml_integrations;
   ```

### 3. Monitorar Logs

Fique atento aos logs do servidor para confirmar que não há mais o erro:

```
❌ ANTES: "Could not find the table 'public.ml_oauth_states'"
✅ DEPOIS: OAuth flow deve completar sem erros
```

---

## 📊 ESTRUTURA OTIMIZADA

### Melhorias Implementadas

1. **Índices Otimizados**

   - Todos os campos de busca têm índices
   - Queries mais rápidas (10-100x em grandes volumes)

2. **RLS Policies Corretas**

   - Segurança multi-tenant garantida
   - Cada usuário vê apenas seus dados
   - Service role pode inserir webhooks

3. **Triggers Automáticos**

   - `updated_at` atualizado automaticamente
   - Menos código, menos bugs

4. **Tipos Corretos**

   - BIGINT para IDs do ML (suportam valores grandes)
   - DECIMAL para valores monetários (precisão exata)
   - TIMESTAMPTZ para datas (com timezone)
   - JSONB para dados flexíveis (com índices)

5. **Constraints Adequados**
   - CHECK constraints para validação
   - UNIQUE constraints para evitar duplicatas
   - ON DELETE CASCADE para limpeza automática

---

## ⚠️ AVISOS IMPORTANTES

### ⚠️ DADOS SERÃO PERDIDOS

**Esta migration apaga todos os dados do Mercado Livre!**

Se você tem:

- ✅ Aplicação nova/desenvolvimento: **PODE EXECUTAR**
- ⚠️ Dados de teste: **Backup opcional**
- ❌ Dados de produção: **FAÇA BACKUP ANTES!**

### Fazer Backup (Produção)

```bash
# Via Supabase Dashboard
# Database > Backups > Create Backup

# Ou via pg_dump
pg_dump "postgresql://..." > backup_before_ml_migration.sql
```

### ⚠️ Executar Apenas Uma Vez

Esta migration é **idempotente** (pode executar várias vezes), mas:

- Cada execução **apaga todos os dados**
- Execute apenas quando necessário

---

## 🐛 TROUBLESHOOTING

### Erro: "permission denied"

**Solução**: Use a OPÇÃO 1 (Dashboard) que executa com permissões corretas.

### Erro: "relation already exists"

**Causa**: Tabelas antigas não foram removidas.

**Solução**: Execute o DROP manualmente:

```sql
DROP TABLE IF EXISTS public.ml_oauth_states CASCADE;
-- Repita para as outras tabelas
```

### Erro: "foreign key constraint"

**Causa**: Ordem incorreta de DROP.

**Solução**: A migration já trata isso com CASCADE, mas se persistir, use:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

⚠️ **CUIDADO**: Isso apaga TUDO no schema public!

### Migration não aparece nas queries

**Causa**: Cache não atualizado.

**Solução**:

1. Reinicie o servidor Next.js
2. No Supabase Dashboard: Settings > API > Reset API Schema Cache

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique os logs** do servidor Next.js
2. **Verifique o SQL Editor** do Supabase (mostra erros detalhados)
3. **Consulte**: `COMO_APLICAR_MIGRATION_ML.md` para instruções detalhadas
4. **Execute**: Query de verificação para confirmar tabelas criadas

---

## ✅ CHECKLIST DE SUCESSO

- [ ] Migration aplicada sem erros
- [ ] 8 tabelas `ml_*` criadas
- [ ] RLS policies configuradas (15+)
- [ ] Funções criadas (2)
- [ ] Servidor reiniciado
- [ ] OAuth inicia sem erro "table not found"
- [ ] Logs limpos (sem erros PGRST205)

**Se todos os itens estiverem OK, a integração ML está pronta! 🎉**

---

**Criado em**: 2025-10-18  
**Versão da Migration**: 20251018210135  
**Schema**: Mercado Livre Integration v2.0 (Complete Rebuild)
