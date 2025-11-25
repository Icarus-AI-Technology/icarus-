# 🤖 ARQUITETURA DE TUTORES IA — ICARUS v5.0

**Data:** 2025-10-20  
**Equipe:** AGENTE_EQUIPE_ECONOMIA_AI_TUTORES  
**Versão:** 1.0.0

---

## 🎯 OBJETIVO

Implementar **Tutores IA contextualizados** em todos os 58 módulos do ICARUS, com foco em:
- **Onboarding** guiado por função
- **Validação inteligente** (ANVISA, CFM, LGPD)
- **Certificação de usuários** por papel
- **Economia de custos** (Ollama local + RAG)
- **Compliance** (dados sensíveis não saem do perímetro)

---

## 🏗️ ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INTERFACE                       │
│  (Chat Widget, Tooltips Inteligentes, Guided Tours)         │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  ROTEADOR DE CONTEXTO                        │
│  • Identifica módulo ativo (Cirurgias, Estoque, etc.)       │
│  • Carrega policies específicas (ANVISA, LGPD)              │
│  • Aplica guardrails (não responde tópicos médicos)         │
└────────────────┬────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────┐         ┌─────▼──────┐
│  OLLAMA   │         │  RAG       │
│  (Local)  │         │  (Hybrid)  │
│           │         │            │
│ • Llama 3 │         │ • PG Vector│
│ • Mistral │         │ • Meilisearch│
│ • Fallback│         │ • Embeddings│
└───────────┘         └────────────┘
      │                     │
      └──────────┬──────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  BASE DE CONHECIMENTO                        │
│  • Manuais OPME (rastreabilidade, lotes, ANVISA)            │
│  • POPs/SOPs (Separação Kit, Faturamento, Compras)          │
│  • Políticas LGPD (minimização, anonimização)               │
│  • Checklists Qualidade (ISO 9001, 27001)                   │
│  • Documentação de processos internos                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 COMPONENTES

### 1. **Motor de IA (Ollama Local)**

**Modelos Recomendados:**
- **Llama 3.1 8B** (geral, rápido, 8GB VRAM)
- **Mistral 7B** (alternativa leve, 6GB VRAM)
- **Phi-3** (edge, 4GB VRAM, para tooltips rápidos)

**Vantagens:**
- ✅ **Zero custo** de API
- ✅ **Baixa latência** (<500ms)
- ✅ **Privacidade** (LGPD compliant)
- ✅ **Offline-ready**

**Fallback:**
- Se Ollama falhar ou query muito complexa → OpenAI/Claude (rate limited)

**Configuração:**
```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelos
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull phi3:mini

# Iniciar servidor
ollama serve
```

**API Endpoint:**
```typescript
// /src/lib/services/ai/ollama-service.ts
const OLLAMA_API = 'http://localhost:11434/api/generate';

async function ask(prompt: string, context: string[]) {
  const response = await fetch(OLLAMA_API, {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3.1:8b',
      prompt: buildPrompt(prompt, context),
      stream: false,
      options: {
        temperature: 0.3, // Baixa variação (foco em precisão)
        top_p: 0.9
      }
    })
  });
  
  return response.json();
}
```

---

### 2. **RAG (Retrieval-Augmented Generation)**

**Fluxo:**
1. Usuário pergunta: _"Como validar lote ANVISA?"_
2. **Embeddings** da pergunta (sentence-transformers local)
3. **Busca vetorial** no PostgreSQL (pgvector) + Meilisearch (texto)
4. **Top 5 chunks** relevantes (SOPs, manuais ANVISA)
5. **Contexto + pergunta** → Ollama
6. **Resposta** com **citations** (links para SOP/manual)

**Tabela PostgreSQL:**
```sql
CREATE TABLE conhecimento_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria TEXT NOT NULL, -- 'ANVISA', 'LGPD', 'POP', 'SOP'
  modulo TEXT, -- 'cirurgias', 'estoque', 'faturamento'
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  embedding VECTOR(768), -- Embeddings (all-MiniLM-L6-v2)
  metadata JSONB, -- { fonte: 'Manual ANVISA 2024', pagina: 42 }
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índice HNSW para busca vetorial rápida
CREATE INDEX idx_conhecimento_embedding ON conhecimento_base 
USING hnsw (embedding vector_cosine_ops);

-- Índice GIN para busca full-text
CREATE INDEX idx_conhecimento_busca ON conhecimento_base 
USING GIN (to_tsvector('portuguese', conteudo));
```

**Meilisearch (busca textual):**
```javascript
// /tools/ai/reindex-docs.js
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({ host: 'http://localhost:7700' });

await client.index('conhecimento').addDocuments([
  {
    id: '1',
    categoria: 'ANVISA',
    titulo: 'Rastreabilidade de Lotes OPME',
    conteudo: 'Todos os lotes devem conter: número ANVISA, lote, série...',
    modulo: 'estoque'
  }
]);
```

---

### 3. **Roteador de Contexto**

**Guardrails (Segurança):**
```typescript
// /src/lib/services/ai/tutor-router.ts

const FORBIDDEN_TOPICS = [
  'diagnóstico médico',
  'prescrição de medicamentos',
  'tratamento de doenças',
  'conduta clínica'
];

function applyGuardrails(query: string): { allowed: boolean; reason?: string } {
  const lowerQuery = query.toLowerCase();
  
  for (const topic of FORBIDDEN_TOPICS) {
    if (lowerQuery.includes(topic)) {
      return {
        allowed: false,
        reason: `O ICARUS é um sistema de **distribuição OPME**, não fornecemos orientações clínicas. Consulte um médico.`
      };
    }
  }
  
  return { allowed: true };
}
```

**Roteamento por Módulo:**
```typescript
const MODULE_CONTEXTS = {
  cirurgias: {
    collections: ['POP_separacao_kit', 'ANVISA_rastreabilidade', 'checklist_cirurgia'],
    systemPrompt: 'Você é um assistente especializado em gestão de cirurgias OPME...'
  },
  estoque: {
    collections: ['ANVISA_produtos', 'POP_recebimento', 'validade_lotes'],
    systemPrompt: 'Você auxilia na gestão de estoque de materiais médicos...'
  },
  faturamento: {
    collections: ['POP_faturamento', 'tabela_TUSS', 'glosas_comuns'],
    systemPrompt: 'Você ajuda no processo de faturamento hospitalar...'
  }
};

function getContextForModule(moduleName: string): ModuleContext {
  return MODULE_CONTEXTS[moduleName] || MODULE_CONTEXTS.default;
}
```

---

### 4. **Sistema de Certificação**

**Tabela de Certificações:**
```sql
CREATE TABLE certificacoes_usuario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  papel TEXT NOT NULL, -- 'separacao_kit', 'faturamento', 'compras'
  modulo TEXT NOT NULL,
  status TEXT NOT NULL, -- 'em_progresso', 'aprovado', 'reprovado'
  pontuacao INTEGER,
  tentativas INTEGER DEFAULT 0,
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_conclusao TIMESTAMPTZ,
  validade_ate TIMESTAMPTZ, -- Revalidação anual
  evidencias JSONB, -- { prova_id: '...', respostas: [...] }
  certificado_url TEXT,
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);
```

**Fluxo de Certificação:**
1. Usuário inicia trilha para **Separação de Kit**
2. Assiste vídeos/lê materiais (registrado)
3. Realiza prova de 10 questões (casos reais)
4. Pontuação ≥70% → **Certificado emitido** (PDF + badge no perfil)
5. Validade: 12 meses → notificação para revalidar

**Exemplo de Questão:**
```json
{
  "tipo": "multipla_escolha",
  "pergunta": "Ao receber um implante ortopédico sem número de lote visível, você deve:",
  "opcoes": [
    "A) Aceitar e registrar 'lote não informado'",
    "B) Recusar o recebimento e notificar o fornecedor",
    "C) Aceitar, mas marcar como 'pendente'",
    "D) Consultar a nota fiscal para o lote"
  ],
  "resposta_correta": "B",
  "justificativa": "Conforme RDC 16/2013 da ANVISA, produtos OPME SEM rastreabilidade não podem ser aceitos.",
  "referencia": "Manual ANVISA 2024, pág. 18"
}
```

---

### 5. **Interface de Usuário**

**Chat Widget (Global):**
```tsx
// /src/components/tutores/TutorChatWidget.tsx

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTutor } from '@/hooks/useTutor';

export function TutorChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { ask, messages, loading } = useTutor();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Tutor IA - {getCurrentModule()}</h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Pergunte algo..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  ask(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

**Tooltips Inteligentes:**
```tsx
// /src/components/tutores/SmartTooltip.tsx

export function SmartTooltip({ field }: { field: string }) {
  const { getFieldHelp } = useTutor();
  
  return (
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="w-4 h-4 text-gray-400" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{getFieldHelp(field)}</p>
        <a href="#" className="text-xs text-indigo-600">Ver mais detalhes</a>
      </TooltipContent>
    </Tooltip>
  );
}
```

---

## 📊 MÉTRICAS E MONITORAMENTO

**Logs de Uso:**
```sql
CREATE TABLE tutor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES auth.users(id),
  modulo TEXT NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  tokens_usados INTEGER,
  latencia_ms INTEGER,
  modelo TEXT, -- 'ollama_llama3', 'openai_gpt4'
  satisfacao INTEGER, -- 1-5 estrelas (feedback do usuário)
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

**KPIs:**
- **Taxa de uso** do Tutor por módulo
- **Tempo médio de resolução** (com vs sem Tutor)
- **Taxa de certificação** por papel
- **Satisfação média** (1-5 estrelas)
- **Economia de tokens** (Ollama vs API)

---

## 💰 ECONOMIA ESTIMADA

| Cenário | Ollama Local | OpenAI GPT-4 | Economia/mês |
|---------|--------------|--------------|--------------|
| **Baixo uso** (1k perguntas/mês) | US$ 0 | US$ 30 | US$ 30 |
| **Médio uso** (10k perguntas/mês) | US$ 0 | US$ 300 | US$ 300 |
| **Alto uso** (50k perguntas/mês) | US$ 0 | US$ 1,500 | US$ 1,500 |

**Economia anual potencial**: US$ 360 - 18k (conforme uso)

**Meta conservadora**: US$ 600-2.5k/ano (conforme mandato)

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### **Fase 1: MVP (Semanas 1-2)**
- [ ] Configurar Ollama local (Llama 3.1 8B)
- [ ] Criar hook `useTutor()` básico
- [ ] Implementar chat widget global
- [ ] Integrar em **1 módulo piloto** (Cirurgias)
- [ ] Ingestão de 5 documentos (POPs críticos)

### **Fase 2: RAG (Semanas 3-4)**
- [ ] Configurar PostgreSQL pgvector
- [ ] Configurar Meilisearch (shadow mode)
- [ ] Implementar pipeline de embeddings
- [ ] Ingerir 50+ documentos (ANVISA, LGPD, SOPs)
- [ ] Sistema de citations (links para fonte)

### **Fase 3: Certificação (Semanas 5-6)**
- [ ] Criar tabela `certificacoes_usuario`
- [ ] Desenvolver 3 trilhas (Separação Kit, Faturamento, Compras)
- [ ] Banco de 100 questões (10 por trilha)
- [ ] Gerador de certificados (PDF)
- [ ] Dashboard de certificações (gestor)

### **Fase 4: Escala (Semanas 7-8)**
- [ ] Expandir para todos os 58 módulos
- [ ] Otimizar performance (cache, lazy load)
- [ ] Monitoramento completo (logs, KPIs)
- [ ] Documentação de uso interno
- [ ] Treinamento de equipe

---

## 🔒 COMPLIANCE E SEGURANÇA

### **LGPD**
- ✅ Dados processados **localmente** (Ollama)
- ✅ Logs anonimizados após 90 dias
- ✅ Usuário pode **deletar histórico** a qualquer momento
- ✅ Opt-out disponível (desabilitar Tutor)

### **ANVISA**
- ✅ Tutor **não substitui** validação humana
- ✅ Respostas com **disclaimer**: _"Esta é uma orientação. Sempre consulte a documentação oficial."_
- ✅ Rastreabilidade de orientações (audit log)

### **ISO 27001**
- ✅ Controle de acesso (apenas usuários autenticados)
- ✅ Criptografia em trânsito (HTTPS)
- ✅ Backup diário da base de conhecimento
- ✅ Versionamento de documentos

---

## 📚 DOCUMENTOS PARA INGESTÃO (Prioridade)

### **Alta Prioridade**
1. ✅ Manual de Boas Práticas OPME (distribuidor)
2. ✅ RDC 16/2013 ANVISA (rastreabilidade)
3. ✅ POP Separação de Kit Cirúrgico
4. ✅ POP Recebimento de Materiais
5. ✅ Checklist Pré-Cirúrgico

### **Média Prioridade**
6. Manual ISO 9001 (Gestão da Qualidade)
7. Política de Privacidade (LGPD)
8. SOP Faturamento Hospitalar
9. Tabela TUSS (ANS)
10. Manual de Glosas Comuns

### **Baixa Prioridade**
11. Treinamentos internos (vídeos transcritos)
12. FAQs existentes
13. Histórico de dúvidas (tickets/e-mails)

---

## 🎯 CRITÉRIOS DE SUCESSO

| Métrica | Meta | Prazo |
|---------|------|-------|
| **Taxa de adoção** | >60% usuários ativos | 90 dias |
| **Satisfação** | ≥4.0/5.0 estrelas | 60 dias |
| **Taxa de certificação** | >80% (funções críticas) | 180 dias |
| **Economia anual** | US$ 600-2.5k | 365 dias |
| **Redução de tickets** | -30% dúvidas operacionais | 120 dias |

---

## 📞 PRÓXIMOS PASSOS

1. **Validar hardware**: Servidor com 16GB+ RAM, GPU opcional (acelera 3-5x)
2. **Instalar Ollama**: `curl -fsSL https://ollama.com/install.sh | sh`
3. **Baixar modelos**: `ollama pull llama3.1:8b`
4. **Criar hook `useTutor()`**: Integração básica
5. **Piloto em Cirurgias**: Validar com 5 usuários reais

---

**© 2025 ICARUS v5.0 - AGENTE_EQUIPE_ECONOMIA_AI_TUTORES**

