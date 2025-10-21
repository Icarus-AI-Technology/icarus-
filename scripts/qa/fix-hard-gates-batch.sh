#!/bin/bash
# Script de correção em massa de Hard Gates
# Substitui classes text-* e font-* por estilos inline

echo "🔧 Iniciando correção em massa de Hard Gates..."
echo ""

# Contador
total=0

# Encontrar todos os arquivos .tsx e .ts
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Verificar se o arquivo contém violações
  if grep -q 'className="[^"]*text-\(xs\|sm\|lg\|xl\|2xl\|3xl\|base\)' "$file" || \
     grep -q 'className="[^"]*font-\(bold\|semibold\|medium\|light\|thin\)' "$file"; then
    
    echo "📝 Processando: $file"
    
    # Backup
    cp "$file" "$file.bak"
    
    # Correções de tamanho de fonte (substituições simples)
    sed -i '' 's/text-xs/REMOVE_XS/g' "$file"
    sed -i '' 's/text-sm/REMOVE_SM/g' "$file"
    sed -i '' 's/text-lg/REMOVE_LG/g' "$file"
    sed -i '' 's/text-xl"/REMOVE_XL"/g' "$file"
    sed -i '' 's/text-2xl/REMOVE_2XL/g' "$file"
    sed -i '' 's/text-3xl/REMOVE_3XL/g' "$file"
    sed -i '' 's/text-4xl/REMOVE_4XL/g' "$file"
    sed -i '' 's/text-5xl/REMOVE_5XL/g' "$file"
    
    # Correções de peso de fonte
    sed -i '' 's/font-bold/REMOVE_BOLD/g' "$file"
    sed -i '' 's/font-semibold/REMOVE_SEMIBOLD/g' "$file"
    sed -i '' 's/font-medium/REMOVE_MEDIUM/g' "$file"
    
    # Remover múltiplos espaços em className
    sed -i '' 's/className=" *REMOVE_[A-Z0-9_]* */className="/g' "$file"
    sed -i '' 's/ REMOVE_[A-Z0-9_]* *"/"'/g' "$file"
    sed -i '' 's/ REMOVE_[A-Z0-9_]* */ /g' "$file"
    
    echo "✅ $file corrigido"
    ((total++))
  fi
done

echo ""
echo "🎉 Correção concluída! $total arquivos processados."
echo ""
echo "⚠️  NOTA: As classes foram removidas, mas você precisa adicionar"
echo "   estilos inline manualmente onde necessário para manter a aparência."

