#!/bin/bash
# Script para substituir console.* por logger.*
# Day 3-5 - Logging Implementation

echo "🔄 Substituindo console.* por logger.* em todo o projeto..."
echo ""

# Contador
TOTAL_FILES=0
TOTAL_REPLACEMENTS=0

# Função para substituir console.* em um arquivo
replace_in_file() {
  local file=$1
  local backup="${file}.backup"
  
  # Skip se já tem import do logger
  if grep -q "from '@/utils/logger'" "$file" 2>/dev/null; then
    echo "⏭️  $file já tem logger importado"
    return
  fi
  
  # Fazer backup
  cp "$file" "$backup"
  
  # Contar ocorrências antes
  local before=$(grep -c "console\.\(log\|error\|warn\|info\|debug\)" "$file" 2>/dev/null || echo "0")
  
  if [ "$before" -gt 0 ]; then
    echo "📝 Processing: $file ($before console.* encontrados)"
    
    # Adicionar import do logger no início
    # Encontrar a primeira linha de import
    local first_import=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
    
    if [ -n "$first_import" ]; then
      # Inserir import do logger após o primeiro import
      sed -i "${first_import}a import { logger } from '@/utils/logger'" "$file"
    fi
    
    # Substituir console.log por logger.info (logs informativos)
    sed -i "s/console\.log(/logger.info(/g" "$file"
    
    # Substituir console.error por logger.error (erros)
    sed -i "s/console\.error(/logger.error(/g" "$file"
    
    # Substituir console.warn por logger.warn (warnings)
    sed -i "s/console\.warn(/logger.warn(/g" "$file"
    
    # Substituir console.debug por logger.debug (debug)
    sed -i "s/console\.debug(/logger.debug(/g" "$file"
    
    # Contar após
    local after=$(grep -c "logger\.\(info\|error\|warn\|debug\)" "$file" 2>/dev/null || echo "0")
    
    echo "  ✅ $before console.* → $after logger.* ($file)"
    
    ((TOTAL_FILES++))
    ((TOTAL_REPLACEMENTS+=$before))
    
    # Remover backup
    rm "$backup"
  fi
}

# Processar arquivos TypeScript/TSX no app/
find app/ -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/.next/*" | while read file; do
  replace_in_file "$file"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resultado:"
echo "  Arquivos processados: $TOTAL_FILES"
echo "  Total de substituições: $TOTAL_REPLACEMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Substituição completa!"
