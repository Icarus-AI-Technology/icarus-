# Plano de Implementação: Fase 3 - Tutores nos 7 Módulos Restantes
## ICARUS v5.0

**Data:** 28 de Outubro de 2025  
**Status:** Planejamento  
**Estimativa:** 6-8 horas

---

## 📋 Contexto

Com a Fase 2 completa (Agentes Especializados + CEO Intelligence), agora vamos expandir os Tutores de IA inline para mais 7 módulos operacionais críticos.

### Módulos da Fase 3:
1. Gestão de Cadastros
2. Financeiro Avançado
3. Faturamento
4. CRM & Vendas
5. Compras & Fornecedores
6. Logística Avançada
7. Consignação Avançada

---

## 🎯 Objetivos

- ✅ Implementar AITutor inline em 7 módulos
- ✅ Integrar com AIOrchestrator existente
- ✅ Criar sugestões contextuais específicas por módulo
- ✅ Garantir <500ms de resposta
- ✅ Manter padrão OraclusX DS

---

## 📐 Arquitetura (Reutilizar Fase 1)

Cada módulo seguirá o padrão já estabelecido:

```typescript
// 1. Importar componente base
import { AITutor, type AISuggestion } from '@/components/shared/AITutor';
import { AIOrchestrator } from '@/services/ai/AIOrchestrator';

// 2. Estado para sugestões
const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

// 3. useEffect para carregar sugestões
useEffect(() => {
  const loadAISuggestions = async () => {
    const suggestions = await AIOrchestrator.getContextualSuggestions(
      'nome_modulo',
      { /* contexto específico */ }
    );
    setAiSuggestions(suggestions);
  };
  loadAISuggestions();
}, [/* dependências */]);

// 4. Renderizar AITutor
<AITutor 
  module="nome_modulo"
  context={{ /* dados contextuais */ }}
  suggestions={aiSuggestions}
  onAction={(action, suggestion) => {
    // Lógica de ação
  }}
/>
```

---

## 📝 Detalhamento por Módulo

### 1. Gestão de Cadastros (`GestãoCadastros.tsx`)

**Arquivo:** `src/components/modules/GestãoCadastros.tsx`

**Sugestões Contextuais:**
- Validação inteligente de CPF/CNPJ/CRM
- Detecção de cadastros duplicados
- Sugestões de autocomplete baseadas em histórico
- Alertas de campos obrigatórios ausentes
- Verificação de dados inconsistentes

**Contexto a passar:**
```typescript
{
  moduleName: 'Gestão de Cadastros',
  currentView: activeTab, // 'pacientes', 'hospitais', 'medicos', etc
  selectedItem: selectedId,
  validationErrors: errors
}
```

**Mock de Sugestões (AIOrchestrator):**
```typescript
cadastros: [
  {
    id: 'cad-1',
    title: 'Duplicata Detectada',
    description: 'Paciente "Maria Silva" já cadastrado com CPF similar.',
    actionLabel: 'Ver Registro',
    severity: 'high'
  },
  {
    id: 'cad-2',
    title: 'Validação CRM',
    description: 'CRM informado não encontrado no sistema. Verificar com conselho.',
    severity: 'medium'
  }
]
```

---

### 2. Financeiro Avançado (`FinanceiroAvancado.tsx`)

**Arquivo:** `src/components/modules/FinanceiroAvancado.tsx`

**Sugestões Contextuais:**
- Score de inadimplência em tempo real
- Alertas de fluxo de caixa crítico (<15 dias)
- Sugestões de conciliação bancária
- Previsão de receitas/despesas
- Alertas de cobranças pendentes

**Contexto a passar:**
```typescript
{
  moduleName: 'Financeiro Avançado',
  currentView: activeTab,
  kpis: {
    fluxoCaixaDias: 10,
    contasAtrasadas: 5,
    inadimplencia: 8.5
  }
}
```

**Mock de Sugestões:**
```typescript
financeiro: [
  {
    id: 'fin-1',
    title: 'Fluxo de Caixa Crítico',
    description: 'Apenas 10 dias de fluxo disponível. Revisar recebíveis urgentemente.',
    actionLabel: 'Ver Recebíveis',
    severity: 'critical'
  },
  {
    id: 'fin-2',
    title: 'Conciliação Pendente',
    description: '15 lançamentos bancários sem conciliação há mais de 7 dias.',
    actionLabel: 'Conciliar Agora',
    severity: 'high'
  }
]
```

---

### 3. Faturamento (`Faturamento.tsx`)

**Arquivo:** `src/components/modules/Faturamento.tsx`

**Sugestões Contextuais:**
- Predição de glosas antes do envio
- Validação TISS automática
- Sugestões de correção pré-envio
- Alertas de guias incompletas
- Otimização de lotes de faturamento

**Contexto a passar:**
```typescript
{
  moduleName: 'Faturamento',
  currentView: activeTab,
  guiasSelecionadas: selectedGuias.length,
  loteAtual: currentLote,
  validationStatus: 'pending'
}
```

**Mock de Sugestões:**
```typescript
faturamento: [
  {
    id: 'fat-1',
    title: 'Risco de Glosa Detectado',
    description: '3 guias com procedimentos não autorizados. Taxa de glosa prevista: 85%.',
    actionLabel: 'Revisar Guias',
    severity: 'critical'
  },
  {
    id: 'fat-2',
    title: 'Validação TISS',
    description: 'Lote atual passou na validação TISS. Pronto para envio.',
    actionLabel: 'Enviar Lote',
    severity: 'low'
  }
]
```

---

### 4. CRM & Vendas (`CRMVendas.tsx`)

**Arquivo:** `src/components/modules/CRMVendas.tsx`

**Sugestões Contextuais:**
- Lead scoring automático (0-100)
- Próxima melhor ação por lead
- Alertas de follow-up pendentes
- Sugestões de cross-sell/up-sell
- Previsão de conversão

**Contexto a passar:**
```typescript
{
  moduleName: 'CRM & Vendas',
  currentView: activeTab,
  leadSelecionado: selectedLead,
  funil: currentFunnel,
  metaMensal: monthlyTarget
}
```

**Mock de Sugestões:**
```typescript
crm: [
  {
    id: 'crm-1',
    title: 'Lead Quente Identificado',
    description: 'Lead "Hospital São José" com score 92. Contato urgente recomendado.',
    actionLabel: 'Abrir Lead',
    severity: 'high'
  },
  {
    id: 'crm-2',
    title: 'Follow-up Pendente',
    description: '8 leads sem follow-up há mais de 5 dias. Taxa de conversão pode cair 30%.',
    actionLabel: 'Ver Leads',
    severity: 'medium'
  }
]
```

---

### 5. Compras & Fornecedores (`FornecedoresAvancado.tsx`)

**Arquivo:** `src/components/modules/FornecedoresAvancado.tsx`

**Sugestões Contextuais:**
- Comparativo de cotações em tempo real
- Alertas de prazo de entrega
- Sugestões de fornecedores alternativos
- Economia potencial em cotações
- Alertas de SLA de fornecedores

**Contexto a passar:**
```typescript
{
  moduleName: 'Compras & Fornecedores',
  currentView: activeTab,
  cotacaoAtual: currentCotacao,
  fornecedorSelecionado: selectedSupplier,
  urgencia: isUrgent
}
```

**Mock de Sugestões:**
```typescript
compras: [
  {
    id: 'comp-1',
    title: 'Economia Detectada',
    description: 'Fornecedor B oferece mesmo produto 18% mais barato. Economia: R$ 2.450.',
    actionLabel: 'Ver Cotação',
    severity: 'medium'
  },
  {
    id: 'comp-2',
    title: 'Prazo Crítico',
    description: 'Pedido #1234 com data de necessidade em 3 dias. Fornecedor ainda não respondeu.',
    actionLabel: 'Contatar Fornecedor',
    severity: 'critical'
  }
]
```

---

### 6. Logística Avançada (`LogisticaAvancada.tsx`)

**Arquivo:** `src/components/modules/LogisticaAvancada.tsx`

**Sugestões Contextuais:**
- Otimização de rotas em tempo real
- Alertas de atraso previstos
- Sugestão de transportadora ideal
- Consolidação de cargas
- Análise de custo-benefício

**Contexto a passar:**
```typescript
{
  moduleName: 'Logística Avançada',
  currentView: activeTab,
  entregasAtivas: activeDeliveries.length,
  rotaSelecionada: selectedRoute,
  transportadora: currentCarrier
}
```

**Mock de Sugestões:**
```typescript
logistica: [
  {
    id: 'log-1',
    title: 'Rota Não Otimizada',
    description: 'Rota atual: 85km. Rota otimizada: 67km. Economia: R$ 45 e 25min.',
    actionLabel: 'Aplicar Rota',
    severity: 'medium'
  },
  {
    id: 'log-2',
    title: 'Atraso Previsto',
    description: 'Entrega #789 com atraso previsto de 2h devido a trânsito. Cliente será notificado.',
    actionLabel: 'Ver Entrega',
    severity: 'high'
  }
]
```

---

### 7. Consignação Avançada (`ConsignacaoAvancada.tsx`)

**Arquivo:** `src/components/modules/ConsignacaoAvancada.tsx`

**Sugestões Contextuais:**
- Alertas de conferência obrigatória
- ROI por hospital/material
- Sugestões de rotatividade
- Materiais de baixo giro
- Previsão de vencimento

**Contexto a passar:**
```typescript
{
  moduleName: 'Consignação Avançada',
  currentView: activeTab,
  hospitalSelecionado: selectedHospital,
  materiaisConsignados: consignedMaterials.length,
  ultimaConferencia: lastCheckDate
}
```

**Mock de Sugestões:**
```typescript
consignacao: [
  {
    id: 'cons-1',
    title: 'Conferência Obrigatória',
    description: 'Hospital "São Lucas" sem conferência há 15 dias. Risco de perda de materiais.',
    actionLabel: 'Agendar Conferência',
    severity: 'critical'
  },
  {
    id: 'cons-2',
    title: 'Material de Baixo Giro',
    description: 'Prótese XYZ há 60 dias sem movimentação. ROI negativo. Considere devolução.',
    actionLabel: 'Ver Material',
    severity: 'medium'
  }
]
```

---

## 🔄 Atualizar AIOrchestrator

Adicionar casos no switch do `AIOrchestrator.getContextualSuggestions`:

```typescript
// src/services/ai/AIOrchestrator.ts

export class AIOrchestrator {
  static async getContextualSuggestions(
    module: string,
    context: Record<string, any>
  ): Promise<AISuggestion[]> {
    console.log(`[AIOrchestrator] Getting suggestions for module: ${module}`);

    const mockSuggestions: Record<string, AISuggestion[]> = {
      dashboard: [/* já existe */],
      cirurgias: [/* já existe */],
      estoque: [/* já existe */],
      
      // NOVOS MÓDULOS FASE 3
      cadastros: [/* mock acima */],
      financeiro: [/* mock acima */],
      faturamento: [/* mock acima */],
      crm: [/* mock acima */],
      compras: [/* mock acima */],
      logistica: [/* mock acima */],
      consignacao: [/* mock acima */]
    };

    return mockSuggestions[module] || [];
  }
}
```

---

## 📊 Cronograma de Implementação

| Módulo | Estimativa | Prioridade | Complexidade |
|--------|-----------|-----------|--------------|
| 1. Cadastros | 1h | Alta | Baixa |
| 2. Financeiro | 1.5h | Crítica | Média |
| 3. Faturamento | 1.5h | Crítica | Média |
| 4. CRM | 1h | Alta | Baixa |
| 5. Compras | 1h | Média | Baixa |
| 6. Logística | 1h | Alta | Média |
| 7. Consignação | 1h | Alta | Baixa |
| **Total** | **8h** | - | - |

---

## ✅ Checklist por Módulo

Para cada módulo, seguir:

- [ ] Localizar arquivo do componente
- [ ] Importar AITutor e AIOrchestrator
- [ ] Adicionar estado `aiSuggestions`
- [ ] Implementar `useEffect` com carregamento
- [ ] Definir contexto específico
- [ ] Renderizar AITutor no layout
- [ ] Adicionar mocks no AIOrchestrator
- [ ] Testar visualmente no módulo
- [ ] Verificar performance (<500ms)
- [ ] Documentar no PROGRESSO

---

## 🎯 Critérios de Sucesso

- ✅ 7 módulos com tutores inline funcionais
- ✅ Sugestões contextuais relevantes
- ✅ Tempo de resposta <500ms
- ✅ UI consistente com OraclusX DS
- ✅ Sem erros no console
- ✅ Feedback visual de carregamento

---

## 📚 Referências

- **Fase 1 (Pilotos):** `PROGRESSO_AI_TUTORS_AGENTS.md`
- **Componente Base:** `src/components/shared/AITutor.tsx`
- **Orchestrator:** `src/services/ai/AIOrchestrator.ts`
- **Design System:** `ORACLUSX_DS_COMPLETO.md`

---

## 🚀 Próximos Passos (Após Fase 3)

### Fase 4: Expansão Completa (40h)
- Implementar tutores nos 48 módulos restantes
- Criar templates automatizados
- Sistema de sugestões dinâmicas (não-mock)

### Fase 5: IA de Segunda Geração (20h)
- Integrar com modelos de ML (TensorFlow.js)
- Reinforcement learning baseado em feedback
- Predições contextuais avançadas

### Fase 6: Feedback Loop (10h)
- Sistema de avaliação de sugestões (👍👎)
- Métricas de eficácia por módulo
- Ajuste automático de modelos

---

**Plano Fase 3 v1.0.0** - ICARUS v5.0  
Última atualização: 28/10/2025

