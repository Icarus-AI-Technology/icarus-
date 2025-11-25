#!/bin/bash
# Script de limpeza do repositório Icarus
# Remove arquivos desnecessários e organiza a estrutura

set -e

echo "🧹 Iniciando limpeza do repositório Icarus..."

# Criar diretórios de organização se não existirem
mkdir -p docs/archive
mkdir -p docs/audit
mkdir -p docs/guides
mkdir -p docs/architecture
mkdir -p scripts/deprecated

# === ARQUIVOS A REMOVER (temporários, logs, duplicados) ===
echo "🗑️  Removendo arquivos temporários e logs..."

# Logs e outputs
rm -f build-output.log dev-server.log dev-server-restart.log mock-server.log deployment-log.txt 2>/dev/null || true

# Arquivos de debug
rm -f debug-page.png dashboard-bypass-check.png 2>/dev/null || true

# JSONs temporários de auditoria/teste
rm -f axe-contato.json axe-root.json lh-*.json coverage-matrix.json edge-functions-report.json 2>/dev/null || true
rm -f dre_inteligente_*.json meili-*.json architecture_map.json migration-*.json hard-gate-report.md 2>/dev/null || true

# Arquivos de dados de treinamento
rm -f eng.traineddata 2>/dev/null || true

# Figma exports duplicados
rm -f "Neuomorphic Screen Design (Community) (cópia) (1).make" 2>/dev/null || true

# === MOVER DOCUMENTAÇÃO PARA docs/ ===
echo "📁 Organizando documentação..."

# Relatórios de auditoria
for f in AUDIT_*.md AUDITORIA_*.md RELATORIO_*.md; do
    [ -f "$f" ] && mv "$f" docs/audit/ 2>/dev/null || true
done

# Guias e manuais
for f in GUIA_*.md MANUAL*.md QUICK_START*.md INSTALL*.md; do
    [ -f "$f" ] && mv "$f" docs/guides/ 2>/dev/null || true
done

# Arquitetura
for f in ARQUITETURA*.md DIAGRAMAS*.md; do
    [ -f "$f" ] && mv "$f" docs/architecture/ 2>/dev/null || true
done

# Documentação geral - mover para archive
for f in \
    ACESSO_RAPIDO*.md \
    ACOES_IMEDIATAS*.md \
    AGENTE_*.md \
    AGENTES_*.md \
    AI_INTEGRATION*.md \
    ANALISE_*.md \
    APLICAR_*.md \
    ARQUIVOS_*.md \
    ATUALIZACAO_*.md \
    BACKUP_*.md \
    BENCHMARKS_*.md \
    BLOCO_*.md \
    CADASTROS_*.md \
    CHANGELOG.md \
    CHATBOT_*.md \
    CHECKLIST_*.md \
    CI_FIXES*.md \
    CIRURGIAS_*.md \
    CLAUDE_CODE*.md \
    cleanup-report.md \
    COMO_TESTAR*.md \
    COMPATIBILIDADE*.md \
    CONCLUSAO_*.md \
    CONFIGURACAO_*.md \
    CONFIGURAR_*.md \
    CONFIRMACAO_*.md \
    CONQUISTA_*.txt \
    CONTATOS_*.md \
    CORES_*.md \
    CORRECAO_*.md \
    CORRECOES_*.md \
    CREDENCIAIS*.md \
    CYBERPUNK_*.md \
    DASHBOARD_*.md \
    DEPLOY_*.md \
    DEPLOYMENT*.md \
    DESIGN_SYSTEM*.md \
    DEV_PROFILE*.md \
    DIAGNOSTICO*.sql \
    EMPRESA_*.md \
    EMPRESAS_*.md \
    ENV_*.md \
    ESTRATEGIA_*.md \
    EXECUCAO_*.md \
    EXEMPLOS_*.md \
    FASE*.md \
    fe-bd-map.md \
    figma-to-code-map.md \
    FORMULARIOS_*.md \
    FRONTEND_*.md \
    GPT_RESEARCHER*.md \
    icarus-spec.md \
    ICARUS_*.md \
    IMPLEMENTACAO_*.md \
    INDICE_*.md \
    INTEGRACAO_*.md \
    INTEGRAÇÕES_*.md \
    INVENTARIO*.md \
    LGPD*.md \
    LIMPAR_*.md \
    LIMPEZA_*.md \
    LLM_*.md \
    LOGISTICA_*.md \
    MCP_*.md \
    MELHORIAS_*.md \
    META_*.md \
    MIGRACAO_*.md \
    MIGRATION_PLAN.md \
    MILESTONE_*.md \
    MISSAO_*.md \
    MODULO_*.md \
    MODULOS_*.md \
    ORACLUSX_*.md \
    ORQUESTRADOR_*.md \
    PADRONIZACAO_*.md \
    PLUGGY_*.md \
    PROGRESSO_*.md \
    PROXIMOS_*.md \
    README_*.md \
    remediation-plan.md \
    RESUMO_*.md \
    SECURITY_*.md \
    SENTRY_*.md \
    SIDEBAR_*.md \
    sidebar-neomorphic-effects-guide.md \
    STATUS_*.md \
    STORAGE_*.md \
    SUMARIO_*.md \
    SUPABASE_*.md \
    TODAS_*.md \
    ui-routing-report.md \
    UPDATE_*.md \
    ux-decision-log.md \
    VERCEL_*.md \
    404_*.md \
; do
    [ -f "$f" ] && mv "$f" docs/archive/ 2>/dev/null || true
done

# === MOVER SCRIPTS PARA scripts/ ===
echo "📜 Organizando scripts..."

for f in \
    add-vercel-env.sh \
    apply-*.sh \
    create-pr.sh \
    deploy-vercel.sh \
    validate-migrations.sh \
    fix-agents.js \
    bootstrap_icarus_scaffold.py \
    mock-*.py \
; do
    [ -f "$f" ] && mv "$f" scripts/deprecated/ 2>/dev/null || true
done

# === ARQUIVOS .txt DESNECESSÁRIOS ===
echo "📝 Removendo arquivos .txt temporários..."

for f in \
    APLICAR_MIGRATION_AGORA.txt \
    ARQUIVOS_PROXIMOS_PASSOS.txt \
    CONQUISTA_*.txt \
    DEPLOY_READY.txt \
    FRONTEND_SUPABASE_100_COMPLETO.txt \
    MIGRACAO_*.txt \
    DASHBOARD_QUALIDADE_94.txt \
    RESUMO_VISUAL_FASE2.txt \
    AGENTES_ICARUS_SUMMARY.txt \
; do
    rm -f "$f" 2>/dev/null || true
done

# === LIMPAR PASTAS VAZIAS ===
echo "🧹 Removendo pastas vazias..."
find docs -type d -empty -delete 2>/dev/null || true
find scripts -type d -empty -delete 2>/dev/null || true

# === VERIFICAR O QUE RESTOU NA RAIZ ===
echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📊 Arquivos restantes na raiz:"
ls -la *.md 2>/dev/null | wc -l || echo "0 arquivos .md"
ls -la *.txt 2>/dev/null | wc -l || echo "0 arquivos .txt"
ls -la *.sh 2>/dev/null | wc -l || echo "0 arquivos .sh"
ls -la *.json 2>/dev/null | wc -l || echo "0 arquivos .json"

echo ""
echo "📁 Estrutura docs/:"
ls docs/ 2>/dev/null || echo "Pasta docs/ não encontrada"

