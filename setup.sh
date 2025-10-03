#!/bin/bash

# Script de inicialização do Merca Flow
# Execute este script após clonar o repositório

echo "🚀 Inicializando Merca Flow..."
echo "=================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Verificar se .env.example existe
if [ ! -f ".env.example" ]; then
    echo "❌ Arquivo .env.example não encontrado"
    exit 1
fi

# Criar .env.local se não existir
if [ ! -f ".env.local" ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado"
    echo "⚠️  IMPORTANTE: Preencha as variáveis em .env.local antes de continuar"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Verificar TypeScript
echo "🔍 Verificando configuração TypeScript..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "⚠️  Avisos de TypeScript encontrados (normal em setup inicial)"
else
    echo "✅ TypeScript configurado corretamente"
fi

# Instruções finais
echo ""
echo "🎉 Setup inicial completo!"
echo "=================================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Preencha as variáveis em .env.local"
echo "2. Configure sua aplicação no Mercado Livre DevCenter"
echo "3. Configure seu projeto no Supabase"
echo "4. Execute: npm run dev"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "- README.md - Guia completo"
echo "- PRIMEIROS_PASSOS.md - Setup detalhado"
echo "- CHECKLIST_VALIDACAO.md - Validação final"
echo ""
echo "🆘 PRECISA DE AJUDA?"
echo "- Consulte os arquivos de documentação"
echo "- Verifique o status em: http://localhost:3000/api/test"
echo ""
echo "✨ Bom desenvolvimento!"