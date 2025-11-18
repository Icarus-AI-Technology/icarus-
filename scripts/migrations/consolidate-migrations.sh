#!/bin/bash

# Consolidar todas as migrações em um único arquivo
MIGRATIONS_DIR="supabase/migrations"
OUTPUT_FILE="supabase/migrations_consolidated.sql"

echo "-- ╔════════════════════════════════════════════════════════════════════════╗" > "$OUTPUT_FILE"
echo "-- ║  ICARUS v5.0 - Migrações Consolidadas Supabase                         ║" >> "$OUTPUT_FILE"
echo "-- ║  Data: $(date +"%Y-%m-%d %H:%M:%S")                                    ║" >> "$OUTPUT_FILE"
echo "-- ╚════════════════════════════════════════════════════════════════════════╝" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Listar e ordenar migrações
mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

total=${#MIGRATION_FILES[@]}
current=0

for migration_file in "${MIGRATION_FILES[@]}"; do
    ((current++))
    migration_name=$(basename "$migration_file")
    
    echo "[$current/$total] Consolidando: $migration_name"
    
    echo "" >> "$OUTPUT_FILE"
    echo "-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
    echo "-- Migração: $migration_name" >> "$OUTPUT_FILE"
    echo "-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    cat "$migration_file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

echo ""
echo "✅ Consolidação concluída!"
echo "📄 Arquivo: $OUTPUT_FILE"
echo "📊 Total: $total migrações"

