#!/bin/bash
# Script de Limpeza do MercaFlow
# Remove arquivos obsoletos e organiza estrutura do projeto

echo "🧹 Iniciando limpeza do MercaFlow..."
echo ""

# Criar diretório para arquivos de debug se não existir
mkdir -p scripts/debug

echo "📁 Movendo arquivos SQL de debug..."

# Lista de arquivos SQL obsoletos no root
sql_files=(
  "analyze_columns.sql"
  "analyze_database_schema.sql"
  "analyze_supabase.sql"
  "analyze_tables.sql"
  "backup_before_reset.sql"
  "check_my_user.sql"
  "check_rls_policies.sql"
  "clean_supabase_safe.sql"
  "clean_supabase.sql"
  "cleanup_duplicate_policies.sql"
  "complete_reset.sql"
  "debug_auth_complete.sql"
  "debug_user_access.sql"
  "diagnose_ml_tables.sql"
  "diagnose_role_problem.sql"
  "final_ml_test.sql"
  "fix_missing_profiles.sql"
  "fix_profile_access.sql"
  "fix_rls_policies.sql"
  "fix-super-admin-direct.sql"
  "fix-super-admin.sql"
  "force_session_refresh.sql"
  "promote_super_admin_final.sql"
  "promote-super-admin.sql"
  "recreate_tables.sql"
  "remove_functions.sql"
  "schema_analysis.sql"
  "simple_reset.sql"
  "test_after_fix.sql"
  "test_roles_final.sql"
  "ultra_simple_fix.sql"
  "verify_super_admin.sql"
)

# Mover arquivos SQL
for file in "${sql_files[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" scripts/debug/
    echo "  ✅ Movido: $file"
  fi
done

echo ""
echo "📁 Movendo arquivos TypeScript de debug..."

# Arquivos TypeScript obsoletos
ts_files=(
  "debug_ml_integration.ts"
  "promote-user.ts"
  "test-super-admin-config.ts"
)

# Mover arquivos TS
for file in "${ts_files[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" scripts/debug/
    echo "  ✅ Movido: $file"
  fi
done

echo ""
echo "📁 Movendo arquivos Markdown de análise..."

# Arquivos MD de análise (manter no root por enquanto, mas listar)
md_files=(
  "ANALISE_LACUNAS_TABELAS.md"
  "ANALISE_RBAC_SUPABASE.md"
  "ANALISE_TABELAS_FINAL.md"
  "CORRECAO_CALLBACK_ML.md"
  "DEPLOY_VERCEL_FIX.md"
  "RBAC_TRADICIONAL.md"
)

for file in "${md_files[@]}"; do
  if [ -f "$file" ]; then
    mv "$file" scripts/debug/
    echo "  ✅ Movido: $file"
  fi
done

echo ""
echo "📝 Atualizando .gitignore..."

# Adicionar ao .gitignore se ainda não existir
if ! grep -q "scripts/debug/" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Debug scripts (não commitar)" >> .gitignore
  echo "scripts/debug/" >> .gitignore
  echo "  ✅ Adicionado scripts/debug/ ao .gitignore"
else
  echo "  ℹ️  scripts/debug/ já está no .gitignore"
fi

echo ""
echo "📝 Criando README no diretório de debug..."

cat > scripts/debug/README.md << 'EOF'
# Scripts de Debug e Análise

Este diretório contém scripts SQL e TypeScript utilizados durante o desenvolvimento e debugging do MercaFlow.

## ⚠️ Importante

**Estes arquivos NÃO devem ser usados em produção!**

Eles foram criados para:
- Debugging de problemas específicos
- Análise de dados durante desenvolvimento
- Testes manuais de funcionalidades
- Correções pontuais de schema

## 📁 Conteúdo

### Scripts SQL
- `analyze_*.sql` - Scripts de análise de schema e dados
- `check_*.sql` - Verificação de configurações e permissões
- `debug_*.sql` - Scripts de debugging
- `fix_*.sql` - Correções aplicadas durante desenvolvimento
- `test_*.sql` - Testes manuais

### Scripts TypeScript
- `debug_*.ts` - Debugging de integrações
- `promote-user.ts` - Promoção manual de usuários
- `test-*.ts` - Testes de configuração

### Documentos de Análise
- `ANALISE_*.md` - Documentos de análise técnica
- `CORRECAO_*.md` - Registros de correções aplicadas
- `DEPLOY_*.md` - Notas sobre deploys e fixes

## 🚀 Uso

Estes scripts são apenas para referência. Para alterações no banco de dados, sempre:

1. Crie uma migration adequada em `supabase/migrations/`
2. Teste localmente
3. Aplique via `npx supabase db push`

## 🗑️ Limpeza

Este diretório pode ser limpo periodicamente. Os arquivos aqui são históricos e não afetam o funcionamento da aplicação.
EOF

echo "  ✅ README criado em scripts/debug/"

echo ""
echo "✨ Limpeza concluída!"
echo ""
echo "📊 Resumo:"
echo "  - Arquivos SQL movidos: ${#sql_files[@]}"
echo "  - Arquivos TS movidos: ${#ts_files[@]}"
echo "  - Arquivos MD movidos: ${#md_files[@]}"
echo "  - Total: $((${#sql_files[@]} + ${#ts_files[@]} + ${#md_files[@]})) arquivos"
echo ""
echo "📁 Todos os arquivos foram movidos para: scripts/debug/"
echo ""
echo "🎯 Próximos passos recomendados:"
echo "  1. Revise os arquivos em scripts/debug/"
echo "  2. Delete os que não são mais necessários"
echo "  3. Faça commit das mudanças"
echo ""
