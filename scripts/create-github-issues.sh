#!/usr/bin/env bash

set -euo pipefail

detect_repo() {
  if git config --get remote.origin.url >/dev/null 2>&1; then
    git config --get remote.origin.url | sed -E 's#(.*github.com[:/])([^/]+/[^/.]+)(\.git)?#\2#'
  else
    echo "user/repo"
  fi
}

REPO_SLUG=${REPO_SLUG:-"$(detect_repo)"}

issues=()
issues+=("title=CI/CD: aplicar pnpm + secret gate|labels=ci,infra|body=- [ ] Migrar workflows para pnpm\n- [ ] Validar segredos obrigatórios (Supabase/Vercel)\n- [ ] Registrar checklist em docs/proximos-passos/ci-cd-status.md")
issues+=("title=CI/CD: pipeline local lint+test+build|labels=ci,quality|body=- [ ] Executar pnpm lint\n- [ ] Executar pnpm test\n- [ ] Executar pnpm build e anexar logs ao PR")
issues+=("title=Sprint Planning: consolidar escopo da Sprint 1|labels=planning,product|body=- [ ] Revisar documentos de roteiro (ARQUIVOS_PROXIMOS_PASSOS.txt)\n- [ ] Atualizar documento de planejamento com prioridades\n- [ ] Definir Definition of Done e owners")
issues+=("title=Dashboard API: endpoint /api/dashboard/kpis|labels=backend,dashboard|body=- [ ] Implementar rota REST com métricas principais\n- [ ] Adicionar testes unitários\n- [ ] Documentar contrato em docs/proximos-passos/dashboard-endpoints.md")
issues+=("title=Dashboard API: distribuição geográfica e séries históricas|labels=backend,dashboard|body=- [ ] Criar /api/dashboard/distribuicao-especialidades\n- [ ] Criar /api/dashboard/faturamento-mensal e indicadores anuais\n- [ ] Expor payload mockado no frontend")
issues+=("title=Chatbot + Edge Function: garantir disponibilidade|labels=ai,edge-functions|body=- [ ] Validar estrutura do chatbot (useChatbot.ts e docs)\n- [ ] Confirmar scaffold da Edge Function ai-tutor-financeiro\n- [ ] Definir variáveis ANTHROPIC_* no Supabase")

create_with_cli() {
  echo "🔧 GitHub CLI encontrado. Criando issues em ${REPO_SLUG}..."
  for definition in "${issues[@]}"; do
    IFS='|' read -r title_part labels_part body_part <<<"$definition"
    title=${title_part#title=}
    labels=${labels_part#labels=}
    body=${body_part#body=}
    echo "➡️  $title"
    gh issue create --repo "$REPO_SLUG" --title "$title" --body "$body" --label "$labels"
  done
}

print_manual() {
  echo "⚠️  GitHub CLI (gh) não encontrado. Gere os issues manualmente usando os dados abaixo:\n"
  echo "Repositorio alvo: ${REPO_SLUG}" && echo
  for definition in "${issues[@]}"; do
    IFS='|' read -r title_part labels_part body_part <<<"$definition"
    title=${title_part#title=}
    labels=${labels_part#labels=}
    body=${body_part#body=}
    echo "### $title"
    echo "Labels: $labels"
    echo -e "Corpo:\n$body\n"
  done
}

if command -v gh >/dev/null 2>&1; then
  create_with_cli || print_manual
else
  print_manual
fi
