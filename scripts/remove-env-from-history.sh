#!/bin/bash
# Script para remover .env.production do histórico Git
# ATENÇÃO: Isso reescreve o histórico! Use com cuidado.

echo "🚨 REMOVENDO .env.production DO HISTÓRICO GIT"
echo "⚠️  Isso irá reescrever o histórico do repositório"
echo ""

# Backup do repositório
echo "📦 Criando backup..."
cd ..
cp -r mercaflow mercaflow-backup-$(date +%Y%m%d-%H%M%S)
cd mercaflow

# Remover do histórico usando git filter-repo (recomendado)
# Se não tiver instalado: pip install git-filter-repo
echo "🔧 Removendo arquivo do histórico..."

# Método 1: git filter-repo (mais rápido e seguro)
# git filter-repo --path .env.production --invert-paths --force

# Método 2: BFG Repo-Cleaner (alternativa)
# java -jar bfg.jar --delete-files .env.production

# Método 3: git filter-branch (legado, mas funciona)
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production" \
  --prune-empty --tag-name-filter cat -- --all

echo "🧹 Limpando referências antigas..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Histórico limpo!"
echo ""
echo "📤 Para aplicar no GitHub, execute:"
echo "   git push origin --force --all"
echo ""
echo "⚠️  ATENÇÃO: Isso irá sobrescrever o histórico remoto!"
echo "   Avise outros desenvolvedores antes de fazer force push"
