#!/bin/bash
# Script para gerenciar variáveis de ambiente no Vercel
# Uso: bash scripts/vercel-env.sh [comando]

set -e

echo "🔧 MercaFlow - Gerenciador de Variáveis de Ambiente Vercel"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para listar variáveis
list_vars() {
    echo "📋 Listando variáveis de ambiente..."
    vercel env ls
}

# Função para adicionar SUPER_ADMIN_EMAILS
add_super_admin_emails() {
    echo "➕ Adicionando/Atualizando SUPER_ADMIN_EMAILS..."
    echo ""
    echo -e "${YELLOW}Digite os emails de super admin separados por vírgula:${NC}"
    echo "Exemplo: admin@exemplo.com,owner@exemplo.com"
    read -r emails
    
    if [ -z "$emails" ]; then
        echo -e "${RED}❌ Nenhum email fornecido. Abortando.${NC}"
        exit 1
    fi
    
    echo ""
    echo "📝 Adicionando para Production..."
    echo "$emails" | vercel env add SUPER_ADMIN_EMAILS production
    
    echo "📝 Adicionando para Preview..."
    echo "$emails" | vercel env add SUPER_ADMIN_EMAILS preview
    
    echo "📝 Adicionando para Development..."
    echo "$emails" | vercel env add SUPER_ADMIN_EMAILS development
    
    echo ""
    echo -e "${GREEN}✅ SUPER_ADMIN_EMAILS configurado com sucesso!${NC}"
}

# Função para atualizar variável específica
update_var() {
    echo "🔄 Atualizar variável de ambiente"
    echo ""
    echo "Digite o nome da variável:"
    read -r var_name
    
    echo "Digite o novo valor:"
    read -r var_value
    
    echo ""
    echo "Escolha o ambiente:"
    echo "1) Production"
    echo "2) Preview"
    echo "3) Development"
    echo "4) Todos"
    read -r choice
    
    case $choice in
        1)
            echo "$var_value" | vercel env add "$var_name" production
            ;;
        2)
            echo "$var_value" | vercel env add "$var_name" preview
            ;;
        3)
            echo "$var_value" | vercel env add "$var_name" development
            ;;
        4)
            echo "$var_value" | vercel env add "$var_name" production
            echo "$var_value" | vercel env add "$var_name" preview
            echo "$var_value" | vercel env add "$var_name" development
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}✅ Variável atualizada com sucesso!${NC}"
}

# Função para remover variável
remove_var() {
    echo "🗑️  Remover variável de ambiente"
    echo ""
    echo -e "${RED}ATENÇÃO: Esta ação é irreversível!${NC}"
    echo ""
    echo "Digite o nome da variável a remover:"
    read -r var_name
    
    echo "Digite o ambiente (production/preview/development):"
    read -r env
    
    echo ""
    echo -e "${YELLOW}Tem certeza? (s/n)${NC}"
    read -r confirm
    
    if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        vercel env rm "$var_name" "$env"
        echo -e "${GREEN}✅ Variável removida!${NC}"
    else
        echo "❌ Cancelado"
    fi
}

# Função para pull de variáveis
pull_vars() {
    echo "⬇️  Baixando variáveis de ambiente..."
    echo ""
    echo "Escolha o ambiente:"
    echo "1) Production"
    echo "2) Preview"
    echo "3) Development"
    read -r choice
    
    case $choice in
        1)
            vercel env pull .env.production
            echo -e "${GREEN}✅ Variáveis salvas em .env.production${NC}"
            ;;
        2)
            vercel env pull .env.preview
            echo -e "${GREEN}✅ Variáveis salvas em .env.preview${NC}"
            ;;
        3)
            vercel env pull .env.development.local
            echo -e "${GREEN}✅ Variáveis salvas em .env.development.local${NC}"
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            exit 1
            ;;
    esac
}

# Função para verificar variáveis obrigatórias
check_required() {
    echo "🔍 Verificando variáveis obrigatórias..."
    echo ""
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "ML_CLIENT_ID"
        "ML_CLIENT_SECRET"
        "ENCRYPTION_KEY"
        "SUPER_ADMIN_EMAILS"
    )
    
    echo "Variáveis obrigatórias:"
    for var in "${required_vars[@]}"; do
        echo "  - $var"
    done
    
    echo ""
    echo "Executando: vercel env ls"
    echo ""
    vercel env ls
}

# Menu principal
show_menu() {
    echo ""
    echo "Escolha uma opção:"
    echo "1) Listar todas as variáveis"
    echo "2) Adicionar/Atualizar SUPER_ADMIN_EMAILS"
    echo "3) Atualizar variável específica"
    echo "4) Remover variável"
    echo "5) Baixar variáveis (pull)"
    echo "6) Verificar variáveis obrigatórias"
    echo "0) Sair"
    echo ""
    read -r option
    
    case $option in
        1)
            list_vars
            show_menu
            ;;
        2)
            add_super_admin_emails
            show_menu
            ;;
        3)
            update_var
            show_menu
            ;;
        4)
            remove_var
            show_menu
            ;;
        5)
            pull_vars
            show_menu
            ;;
        6)
            check_required
            show_menu
            ;;
        0)
            echo "👋 Até logo!"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            show_menu
            ;;
    esac
}

# Se receber argumento, executar comando direto
if [ $# -eq 0 ]; then
    show_menu
else
    case $1 in
        list|ls)
            list_vars
            ;;
        add)
            add_super_admin_emails
            ;;
        update)
            update_var
            ;;
        remove|rm)
            remove_var
            ;;
        pull)
            pull_vars
            ;;
        check)
            check_required
            ;;
        *)
            echo -e "${RED}❌ Comando inválido: $1${NC}"
            echo ""
            echo "Comandos disponíveis:"
            echo "  list      - Listar variáveis"
            echo "  add       - Adicionar SUPER_ADMIN_EMAILS"
            echo "  update    - Atualizar variável"
            echo "  remove    - Remover variável"
            echo "  pull      - Baixar variáveis"
            echo "  check     - Verificar obrigatórias"
            exit 1
            ;;
    esac
fi
