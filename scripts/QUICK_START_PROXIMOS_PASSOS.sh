#!/usr/bin/env bash

# Menu interativo para orquestrar os proximos passos do Icarus.
# Opcoes principais:
#  1. Verificar estrutura do chatbot
#  2. Validar insumos de CI/CD
#  3. Gerar base da Edge Function ai-tutor-financeiro
#  4. Preparar checklist do dashboard de monitoramento
#  5. Consolidar um resumo rapido dos logs recentes
#  6. Sair

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/backups/proximos-passos"
DOCS_DIR="$ROOT_DIR/docs/proximos-passos"

mkdir -p "$LOG_DIR"
mkdir -p "$DOCS_DIR"

timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

log_name() {
  local prefix="$1"
  echo "$LOG_DIR/${prefix}-$(date +%Y%m%d-%H%M%S).log"
}

pause_menu() {
  # shellcheck disable=SC2034
  read -rp "Pressione ENTER para voltar ao menu..." _ || true
}

require_project_root() {
  if [[ ! -f "$ROOT_DIR/package.json" ]] || [[ ! -d "$ROOT_DIR/.cursor" ]]; then
    echo "Erro: execute este script na raiz do projeto Icarus."
    exit 1
  fi
}

write_doc_header() {
  local target_file="$1"
  local title="$2"
  cat >"$target_file" <<EOF
# $title
Atualizado em $(timestamp)

EOF
}

option_chatbot() {
  local log_file
  log_file="$(log_name "option1-chatbot")"
  {
    echo "# Verificacao rapida do Chatbot"
    echo "Inicio: $(timestamp)"
    echo
  } >"$log_file"

  local -a required_paths=(
    "src/hooks/useChatbot.ts"
    "src/components/oraclusx-ds/ChatbotWithResearch.tsx"
    "src/components/oraclusx-ds/chatbot/ChatbotWindow.tsx"
    "docs/DOCUMENTACAO_CHATBOT.md"
    "supabase/migrations/20251019_chatbot_navegacao_ptbr.sql"
  )

  echo "Verificando artefatos criticos..." | tee -a "$log_file"
  for path in "${required_paths[@]}"; do
    if [[ -e "$ROOT_DIR/$path" ]]; then
      printf "[ok] %s\n" "$path" | tee -a "$log_file"
    else
      printf "[pendente] %s\n" "$path" | tee -a "$log_file"
    fi
  done

  local checklist_file="$DOCS_DIR/chatbot-status.md"
  write_doc_header "$checklist_file" "Chatbot - Proximos Passos"
  cat >>"$checklist_file" <<EOF
- Registrar integracoes pendentes no arquivo ${log_file#"$ROOT_DIR"/}
- Validar prompts em \`src/hooks/useChatbot.ts\`
- Garantir que a Edge Function de IA esta disponivel (opcao 3 deste menu)
- Revisar documentacao em \`docs/DOCUMENTACAO_CHATBOT.md\`
EOF

  echo
  echo "Relatorio salvo em ${log_file#"$ROOT_DIR"/}"
  echo "Checklist disponivel em ${checklist_file#"$ROOT_DIR"/}"
  pause_menu
}

option_ci_cd() {
  local log_file
  log_file="$(log_name "option2-ci-cd")"
  {
    echo "# Verificacao rapida de CI/CD"
    echo "Inicio: $(timestamp)"
    echo
  } >"$log_file"

  local workflows_dir="$ROOT_DIR/.github/workflows"
  if [[ -d "$workflows_dir" ]]; then
    echo "Workflows encontrados:" | tee -a "$log_file"
    ls "$workflows_dir" | sed 's/^/ - /' | tee -a "$log_file"
    echo >>"$log_file"
    echo "Ocorrencias de 'pnpm' nos workflows:" >>"$log_file"
    rg -n "pnpm" "$workflows_dir" >>"$log_file" || echo "(nenhuma ocorrencia encontrada)" >>"$log_file"
  else
    echo "Diretorio .github/workflows ausente." | tee -a "$log_file"
  fi

  if command -v node >/dev/null 2>&1; then
    local pkg_manager
    pkg_manager="$(node -p "const pkg=require('./package.json'); pkg.packageManager || pkg.engines?.pnpm || 'desconhecido';")"
    echo >>"$log_file"
    echo "packageManager declarado: $pkg_manager" | tee -a "$log_file"
  else
    echo "Node nao encontrado; nao foi possivel validar packageManager." | tee -a "$log_file"
  fi

  local report_file="$DOCS_DIR/ci-cd-status.md"
  write_doc_header "$report_file" "CI/CD - Status rapido"
  cat >>"$report_file" <<EOF
- Logs detalhados: ${log_file#"$ROOT_DIR"/}
- Verificar se todos os workflows usam pnpm
- Validar segredos no GitHub Actions (SUPABASE_*, VERCEL_*)
- Planejar execucao do pipeline local via \`pnpm lint && pnpm test && pnpm build\`
EOF

  echo
  echo "Relatorio salvo em ${log_file#"$ROOT_DIR"/}"
  echo "Resumo em ${report_file#"$ROOT_DIR"/}"
  pause_menu
}

option_edge_function() {
  local log_file
  log_file="$(log_name "option3-edge-function")"
  {
    echo "# Scaffold da Edge Function ai-tutor-financeiro"
    echo "Inicio: $(timestamp)"
    echo
  } >"$log_file"

  local func_dir="$ROOT_DIR/supabase/functions/ai-tutor-financeiro"
  local func_file="$func_dir/index.ts"
  mkdir -p "$func_dir"

  if [[ -f "$func_file" ]]; then
    echo "Arquivo ja existe em ${func_file#"$ROOT_DIR"/}; nenhuma acao realizada." | tee -a "$log_file"
  else
    cat >"$func_file" <<'EOF'
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface TutorRequest {
  prompt?: string;
  context?: Record<string, unknown>;
  healthcheck?: boolean;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return json({ ok: true });
  }

  if (req.method !== "POST") {
    return json({ error: "Use POST /ai-tutor-financeiro" }, 405);
  }

  let payload: TutorRequest = {};
  try {
    payload = await req.json();
  } catch {
    return json({ error: "JSON invalido" }, 400);
  }

  if (payload.healthcheck) {
    return json({
      ok: true,
      anthropicKey: !!Deno.env.get("ANTHROPIC_API_KEY"),
      model: Deno.env.get("ANTHROPIC_FINANCE_MODEL") ?? null,
    });
  }

  const message = payload.prompt ?? "Sem prompt informado.";

  return json({
    ok: true,
    info: "Edge Function placeholder - conecte-se ao provedor Anthropic no proximo passo.",
    prompt: message,
    context: payload.context ?? {},
  });
});
EOF
    echo "Novo arquivo criado em ${func_file#"$ROOT_DIR"/}." | tee -a "$log_file"
  fi

  local readme_file="$func_dir/README.md"
  write_doc_header "$readme_file" "Edge Function ai-tutor-financeiro"
  cat >>"$readme_file" <<EOF
1. Configure as variaveis ANTHROPIC_API_KEY e ANTHROPIC_FINANCE_MODEL no Supabase.
2. Ajuste o corpo da requisicao para incluir prompt, contexto e historico.
3. Atualize o frontend para chamar \`/functions/v1/ai-tutor-financeiro\`.
EOF

  echo
  echo "Detalhes registrados em ${log_file#"$ROOT_DIR"/}"
  echo "Documentacao criada em ${readme_file#"$ROOT_DIR"/}"
  pause_menu
}

option_dashboard() {
  local log_file
  log_file="$(log_name "option4-dashboard")"
  {
    echo "# Checklist rapido do dashboard"
    echo "Inicio: $(timestamp)"
    echo
  } >"$log_file"

  local -a dash_files=(
    "src/pages/Dashboard.tsx"
    "src/components/oraclusx-ds/CardKpi.tsx"
    "docs/DASHBOARD_PRINCIPAL_100_COMPLETO.md"
  )

  for path in "${dash_files[@]}"; do
    if [[ -e "$ROOT_DIR/$path" ]]; then
      printf "[ok] %s\n" "$path" | tee -a "$log_file"
    else
      printf "[pendente] %s\n" "$path" | tee -a "$log_file"
    fi
  done

  local doc_file="$DOCS_DIR/dashboard-checklist.md"
  write_doc_header "$doc_file" "Dashboard - Setup rapido"
  cat >>"$doc_file" <<EOF
- Validar KPIs principais no arquivo \`src/pages/Dashboard.tsx\`
- Garantir consistencia visual usando HeroUI + Tailwind v4
- Revisar documentacao: docs/DASHBOARD_PRINCIPAL_100_COMPLETO.md
- Mapear endpoints necessarios para monitoramento em tempo real
EOF

  echo
  echo "Log salvo em ${log_file#"$ROOT_DIR"/}"
  echo "Checklist atualizado em ${doc_file#"$ROOT_DIR"/}"
  pause_menu
}

option_digest() {
  local log_file
  log_file="$(log_name "option5-digest")"
  {
    echo "# Resumo dos ultimos logs"
    echo "Inicio: $(timestamp)"
    echo
  } >"$log_file"

  local digest_file="$DOCS_DIR/status-digest.md"
  write_doc_header "$digest_file" "Resumo rapido - Proximos passos"

  echo "Ultimos relatorios:" >>"$digest_file"
  ls -1t "$LOG_DIR"/*.log 2>/dev/null | head -n 8 | sed "s|$ROOT_DIR/| - |" >>"$digest_file" || echo " - Nenhum log disponivel" >>"$digest_file"

  echo "Resumo consolidado em ${digest_file#"$ROOT_DIR"/}" | tee -a "$log_file"
  pause_menu
}

show_menu() {
  cat <<'EOF'
==========================================
   QUICK START - PROXIMOS PASSOS (v1)
==========================================
1) Criar/verificar estrutura do chatbot
2) Configurar checklist de CI/CD
3) Criar Edge Function ai-tutor-financeiro
4) Preparar checklist do dashboard
5) Gerar resumo rapido dos logs
6) Sair
EOF
  read -rp "Escolha uma opcao [1-6]: " choice
  echo
  case "$choice" in
    1) option_chatbot ;;
    2) option_ci_cd ;;
    3) option_edge_function ;;
    4) option_dashboard ;;
    5) option_digest ;;
    6) echo "Encerrando..."; exit 0 ;;
    *) echo "Opcao invalida."; pause_menu ;;
  esac
}

require_project_root

while true; do
  show_menu
done

