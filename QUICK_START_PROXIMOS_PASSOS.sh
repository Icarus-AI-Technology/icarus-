#!/bin/bash
# QUICK START - Próximos Passos Agentes ICARUS
# Execute este script para começar a implementação das próximas fases

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║        🚀 QUICK START - Próximos Passos Agentes ICARUS            ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Escolha o que você quer fazer:${NC}"
echo ""
echo "1. 🤖 Criar estrutura para integração com chatbot"
echo "2. 🔧 Configurar CI/CD (GitHub Actions)"
echo "3. 🎓 Criar primeira Edge Function de IA"
echo "4. 📊 Setup dashboard de agentes"
echo "5. 📚 Ver documentação completa"
echo "6. ✅ Executar todos os checks"
echo ""

read -p "Digite sua escolha (1-6): " choice

case $choice in
  1)
    echo -e "\n${GREEN}🤖 Criando estrutura para integração com chatbot...${NC}\n"
    
    # Criar diretórios
    mkdir -p src/lib/agents
    mkdir -p src/components/ChatAgent
    
    # Criar orchestrator.ts
    cat > src/lib/agents/orchestrator.ts << 'EOF'
// src/lib/agents/orchestrator.ts
// Orquestrador de agentes ICARUS

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type AgentCommand = {
  agent: 'IA-Validator' | 'Contador' | 'Advogado' | 'Gestao' | 'Tutor';
  action: string;
  params?: Record<string, any>;
};

export type AgentResponse = {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
};

/**
 * Orquestrador principal de agentes
 * Roteia comandos do chatbot para os scripts apropriados
 */
export class AgentOrchestrator {
  private static agentScripts = {
    'IA-Validator': {
      'validar-topologia': 'node tools/ia/ia-validator.js',
      'auditar-edge-functions': 'node tools/ia/check-edge-functions.js',
      'corrigir-configs': 'node tools/ia/auto-fix-configs.js',
    },
    'Contador': {
      'check-fiscal-erp': 'node tools/compliance/fiscal/check-erp-fiscal.js',
      'list-obrigacoes': 'node tools/compliance/fiscal/list-obrigacoes.js',
      'simular-lucro-real': 'node tools/finance/simulador-lucro-real.js',
    },
    'Advogado': {
      'check-compliance-erp': 'node tools/compliance/legal/check-erp-legal.js',
      'monitor-regulatorio': 'node tools/compliance/legal/monitor-regulatorio.js',
    },
    'Gestao': {
      'mapear-kpis': 'node tools/analytics/map-kpis-executivos.js',
      'auditar-modulos': 'node tools/audit/auditar-modulos.js',
    },
    'Tutor': {
      'diagnosticar': 'node tools/tutor/diagnosticar-sistema.js',
      'classificar-gaps': 'node tools/tutor/classificar-gaps.js',
      'parecer-compliance': 'node tools/tutor/parecer-compliance.js',
    },
  };

  /**
   * Executa comando de agente
   */
  static async executeCommand(command: AgentCommand): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      const scripts = this.agentScripts[command.agent];
      if (!scripts) {
        return {
          success: false,
          error: `Agente "${command.agent}" não encontrado`,
        };
      }

      const script = scripts[command.action as keyof typeof scripts];
      if (!script) {
        return {
          success: false,
          error: `Ação "${command.action}" não encontrada para agente "${command.agent}"`,
        };
      }

      const { stdout, stderr } = await execAsync(script);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: stdout,
        executionTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Lista comandos disponíveis para um agente
   */
  static getAvailableCommands(agent: AgentCommand['agent']): string[] {
    const scripts = this.agentScripts[agent];
    return scripts ? Object.keys(scripts) : [];
  }

  /**
   * Lista todos os agentes disponíveis
   */
  static getAvailableAgents(): AgentCommand['agent'][] {
    return Object.keys(this.agentScripts) as AgentCommand['agent'][];
  }
}
EOF

    echo -e "${GREEN}✅ Estrutura criada!${NC}"
    echo ""
    echo "📂 Arquivos criados:"
    echo "   - src/lib/agents/orchestrator.ts"
    echo ""
    echo "📚 Próximos passos:"
    echo "   1. Integrar orchestrator com seu chatbot"
    echo "   2. Adicionar UI para seleção de agentes"
    echo "   3. Testar comandos: AgentOrchestrator.executeCommand({ agent: 'Tutor', action: 'diagnosticar' })"
    ;;

  2)
    echo -e "\n${GREEN}🔧 Configurando CI/CD (GitHub Actions)...${NC}\n"
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/validate-ia-topology.yml << 'EOF'
name: Validar Topologia IA

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-ia:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Validar Topologia IA (Produção)
        env:
          NODE_ENV: production
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_FUNCTIONS_URL: ${{ secrets.SUPABASE_FUNCTIONS_URL }}
        run: |
          echo "🔍 Validando topologia de IA para produção..."
          node tools/ia/ia-validator.js
      
      - name: Upload Relatório
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: ia-validation-report
          path: .cursor/agents/ia-validator/*.json
      
      - name: Comentar PR com Resultado
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Validação de topologia IA passou! Zero violações detectadas.'
            })
EOF

    echo -e "${GREEN}✅ CI/CD configurado!${NC}"
    echo ""
    echo "📂 Arquivo criado:"
    echo "   - .github/workflows/validate-ia-topology.yml"
    echo ""
    echo "🔑 Configure os secrets no GitHub:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - SUPABASE_FUNCTIONS_URL"
    ;;

  3)
    echo -e "\n${GREEN}🎓 Criando primeira Edge Function de IA...${NC}\n"
    
    # Verificar se Supabase CLI está instalado
    if ! command -v supabase &> /dev/null; then
      echo -e "${YELLOW}⚠️  Supabase CLI não instalado. Instalando...${NC}"
      brew install supabase/tap/supabase
    fi
    
    # Criar Edge Function
    echo "📝 Criando ai-tutor-financeiro..."
    supabase functions new ai-tutor-financeiro
    
    # Criar código da função
    cat > supabase/functions/ai-tutor-financeiro/index.ts << 'EOF'
// supabase/functions/ai-tutor-financeiro/index.ts
// Tutor IA para módulo financeiro - usando OpenAI/Anthropic

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface TutorRequest {
  question: string;
  context?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { question, context }: TutorRequest = await req.json();

    // Contexto do módulo financeiro
    const systemPrompt = `Você é um tutor especializado em gestão financeira de ERPs OPME.
    
Conhecimento:
- Lucro Real e Presumido
- Fluxo de caixa
- Inadimplência
- KPIs financeiros (margem bruta, EBITDA)
- Faturamento OPME
- Integração TISS

Responda de forma clara, objetiva e executável.`;

    // Chamar OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(
      JSON.stringify({
        success: true,
        question,
        answer,
        context,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
EOF

    echo -e "${GREEN}✅ Edge Function criada!${NC}"
    echo ""
    echo "📂 Arquivo criado:"
    echo "   - supabase/functions/ai-tutor-financeiro/index.ts"
    echo ""
    echo "🚀 Para fazer deploy:"
    echo "   supabase functions deploy ai-tutor-financeiro"
    echo ""
    echo "🧪 Para testar:"
    echo '   curl -X POST https://<project>.supabase.co/functions/v1/ai-tutor-financeiro \'
    echo '     -H "Authorization: Bearer <anon-key>" \'
    echo '     -d '"'"'{"question": "Como melhorar o fluxo de caixa?"}'"'"
    ;;

  4)
    echo -e "\n${GREEN}📊 Criando dashboard de agentes...${NC}\n"
    
    mkdir -p src/app/admin/agentes
    
    cat > src/app/admin/agentes/page.tsx << 'EOF'
// src/app/admin/agentes/page.tsx
'use client';

import { useEffect, useState } from 'react';

type AgentStatus = {
  agent: string;
  status: 'active' | 'idle' | 'error';
  lastRun?: string;
  metrics?: Record<string, any>;
};

export default function AgentesPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);

  useEffect(() => {
    // TODO: Fetch real status from API
    setAgents([
      { agent: 'IA-Validator', status: 'active', lastRun: '2 min ago' },
      { agent: 'Contador', status: 'idle', lastRun: '1 hour ago' },
      { agent: 'Advogado', status: 'idle', lastRun: '3 hours ago' },
      { agent: 'Gestão', status: 'active', lastRun: '5 min ago' },
      { agent: 'Tutor', status: 'active', lastRun: '1 min ago' },
    ]);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">🤖 Sistema de Agentes ICARUS</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.agent}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{agent.agent}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : agent.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {agent.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Última execução: {agent.lastRun}
            </p>
            
            <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Executar Agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

    echo -e "${GREEN}✅ Dashboard criado!${NC}"
    echo ""
    echo "📂 Arquivo criado:"
    echo "   - src/app/admin/agentes/page.tsx"
    echo ""
    echo "🌐 Acesse em:"
    echo "   http://localhost:3000/admin/agentes"
    ;;

  5)
    echo -e "\n${GREEN}📚 Abrindo documentação...${NC}\n"
    
    echo "📄 Documentação disponível:"
    echo ""
    echo "1. Quick Start:"
    echo "   cat README_AGENTES.md"
    echo ""
    echo "2. Guia Completo:"
    echo "   cat docs/GUIA_AGENTES_ICARUS.md"
    echo ""
    echo "3. Próximos Passos:"
    echo "   cat PROXIMOS_PASSOS_AGENTES.md"
    echo ""
    echo "4. Índice:"
    echo "   cat INDICE_AGENTES.md"
    ;;

  6)
    echo -e "\n${GREEN}✅ Executando todos os checks...${NC}\n"
    
    echo "1️⃣ Verificando arquivos..."
    ./QUICK_CHECK_AGENTES.sh
    
    echo ""
    echo "2️⃣ Validando topologia IA..."
    NODE_ENV=development node tools/ia/ia-validator.js
    
    echo ""
    echo "3️⃣ Verificando Edge Functions..."
    node tools/ia/check-edge-functions.js
    
    echo ""
    echo -e "${GREEN}✅ Todos os checks completados!${NC}"
    ;;

  *)
    echo -e "${YELLOW}Opção inválida!${NC}"
    exit 1
    ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║                    ✅ Operação Concluída!                          ║"
echo "║                                                                    ║"
echo "║        Para mais detalhes: cat PROXIMOS_PASSOS_AGENTES.md         ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

