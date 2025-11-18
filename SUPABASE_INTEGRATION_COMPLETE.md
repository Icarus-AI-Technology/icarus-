# 🗄️ Guia Completo de Integração Supabase

**Sistema:** ICARUS v5.0  
**Data:** 30 de Outubro de 2025  
**Status:** ✅ Guia Consolidado  
**Hooks:** 66 total

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Hooks Implementados](#hooks-implementados)
4. [Padrões de Integração](#padrões-de-integração)
5. [RLS Policies](#rls-policies)
6. [Realtime Subscriptions](#realtime-subscriptions)
7. [Migrations](#migrations)

---

## 🎯 Visão Geral

Todos os **66 hooks** do ICARUS v5.0 seguem um padrão consistente de integração com Supabase:

### Características Padrão:
- ✅ **CRUD Completo** (Create, Read, Update, Delete)
- ✅ **Realtime Subscriptions** (sincronização automática)
- ✅ **Filtros Avançados** (busca, paginação, ordenação)
- ✅ **Loading States** (skeleton UI)
- ✅ **Error Handling** (toasts informativos)
- ✅ **Type Safety** (TypeScript strict)
- ✅ **RLS Policies** (Row Level Security)

---

## ⚙️ Configuração Inicial

### 1. Variáveis de Ambiente

```bash
# .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🔧 Hooks Implementados (66 total)

### Cadastros (8 hooks)

| Hook | Tabela Supabase | Realtime | Validação |
|------|----------------|----------|-----------|
| `useMedicos` | `medicos` | ✅ | CRM + CPF |
| `useHospitais` | `hospitais` | ✅ | CNES + CNPJ |
| `usePacientes` | `pacientes` | ✅ | CPF (LGPD) |
| `useFornecedores` | `fornecedores` | ✅ | CNPJ |
| `useProdutos` | `produtos_opme` | ✅ | Registro ANVISA |
| `useConvenios` | `convenios` | ✅ | Registro ANS |
| `useMedicos` | `equipes_medicas` | ✅ | - |
| `useTransportadoras` | `transportadoras` | ✅ | CNPJ |

### Operacionais (15 hooks)

| Hook | Tabela Supabase | Realtime | IA |
|------|----------------|----------|-----|
| `useCirurgias` | `cirurgias` | ✅ | Previsão demanda |
| `useEstoque` | `estoque` | ✅ | ABC-XYZ, EOQ |
| `useConsignacao` | `remessas_consignacao` | ✅ | - |
| `usePedidos` | `pedidos_compra` | ✅ | - |
| `useRemessas` | `remessas` | ✅ | - |
| `useEntregas` | `entregas` | ✅ | Roteirização |
| `useKits` | `kits_cirurgicos` | ✅ | - |
| `useLotes` | `lotes` | ✅ | - |
| `useReservas` | `reservas` | ✅ | - |
| `useDevolucoes` | `devolucoes` | ✅ | - |
| `useMovimentacoesEstoque` | `movimentacoes_estoque` | ✅ | - |
| `useMateriais` | `materiais` | ✅ | - |
| `useAlertasEstoque` | `alertas_estoque` | ✅ | - |
| `useVisaoEstoque` | `vw_visao_estoque` | ✅ | - |
| `useCotacoesFornecedores` | `cotacoes` | ✅ | - |

### Financeiros (10 hooks)

| Hook | Tabela Supabase | Realtime | IA |
|------|----------------|----------|-----|
| `useContasReceber` | `contas_receber` | ✅ | Score inadimplência |
| `useContasPagar` | `contas_pagar` | ✅ | Workflow aprovação |
| `useFluxoCaixa` | `fluxo_caixa` | ✅ | ARIMA + Monte Carlo |
| `useConciliacaoBancaria` | `conciliacao_bancaria` | ✅ | Fuzzy matching |
| `useCentroCustos` | `centros_custo` | ✅ | - |
| `usePlanejamentoFinanceiro` | `planejamento_financeiro` | ✅ | - |
| `useFaturas` | `faturas` | ✅ | - |
| `useLotesFaturamento` | `lotes_faturamento` | ✅ | Glosas detection |
| `useTransacoes` | `transacoes` | ✅ | - |
| `useInadimplenciaScore` | `vw_inadimplencia` | ❌ | Random Forest |

### CRM & Vendas (5 hooks)

| Hook | Tabela Supabase | Realtime | IA |
|------|----------------|----------|-----|
| `useLeads` | `leads` | ✅ | Lead scoring |
| `useOportunidades` | `oportunidades` | ✅ | Win probability |
| `useContratos` | `contratos` | ✅ | - |
| `usePropostas` | `propostas` | ✅ | - |
| `useNegociacoes` | `negociacoes` | ✅ | - |

### Compliance (5 hooks)

| Hook | Tabela Supabase | Realtime | IA |
|------|----------------|----------|-----|
| `useCompliance` | `compliance_registros` | ✅ | - |
| `useAuditorias` | `auditorias` | ✅ | - |
| `useNaoConformidades` | `nao_conformidades` | ✅ | - |
| `useAcoesCorretivas` | `acoes_corretivas` | ✅ | - |
| `useANVISA` | `certificacoes_anvisa` | ✅ | - |

### Licitações (2 hooks)

| Hook | Tabela Supabase | Realtime |
|------|----------------|----------|
| `useLicitacoes` | `licitacoes` | ✅ |
| `usePropostasLicitacao` | `propostas_licitacao` | ✅ |

### Sistema & Integrações (10 hooks)

| Hook | Função |
|------|--------|
| `useAuth` | Autenticação Supabase |
| `useDashboardData` | Agregação de KPIs |
| `useValidacao` | Validação de dados |
| `useErrorHandler` | Tratamento de erros |
| `useDocumentTitle` | SEO & títulos |
| `useFeatureFlag` | Feature toggles |
| `useActivityTracker` | Analytics de uso |
| `useNotificacoesSistema` | Notificações push |
| `useWorkflowsEngine` | Workflows aprovação |
| `useAPIGatewayMonitor` | Monitoramento APIs |

### Analytics & BI (6 hooks)

| Hook | Função |
|------|--------|
| `useCadastrosKPIs` | KPIs de cadastros |
| `useKPIsGerenciais` | KPIs executivos |
| `useBIDashboardsManager` | Dashboards BI |
| `useRelatoriosCustomizados` | Relatórios personalizados |
| `usePesquisasGPT` | GPT Researcher |
| `useChatbotSessoes` | Sessões chatbot |

### Externos & Integrações (5 hooks)

| Hook | Integração |
|------|------------|
| `usePluggyHook` | Pluggy DDA (Open Banking) |
| `useBrasilAPI` | Brasil API (CNPJs, CEPs) |
| `useGPTResearcher` | GPT Researcher |
| `useIntegracoesExternas` | APIs externas |
| `usePortaisOPME` | Portais OPME externos |

---

## 🎯 Padrões de Integração

### Padrão 1: Hook CRUD Básico

```typescript
// Exemplo: useProdutos.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  registro_anvisa: string;
  // ... outros campos
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // READ
  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produtos_opme')
        .select('*')
        .order('descricao');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      addToast('Erro ao carregar produtos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const createProduto = async (produto: Omit<Produto, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('produtos_opme')
        .insert(produto)
        .select()
        .single();

      if (error) throw error;
      addToast('Produto cadastrado com sucesso!', 'success');
      return data;
    } catch (error) {
      addToast('Erro ao cadastrar produto', 'error');
      throw error;
    }
  };

  // UPDATE
  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    try {
      const { error } = await supabase
        .from('produtos_opme')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      addToast('Produto atualizado!', 'success');
    } catch (error) {
      addToast('Erro ao atualizar produto', 'error');
      throw error;
    }
  };

  // DELETE
  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produtos_opme')
        .delete()
        .eq('id', id);

      if (error) throw error;
      addToast('Produto removido!', 'success');
    } catch (error) {
      addToast('Erro ao remover produto', 'error');
      throw error;
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return {
    produtos,
    loading,
    fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
  };
}
```

### Padrão 2: Hook com Realtime

```typescript
// Exemplo: useCirurgias.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useCirurgias() {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Setup Realtime
  useEffect(() => {
    const realtimeChannel = supabase
      .channel('cirurgias-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cirurgias',
        },
        (payload) => {
          console.log('Cirurgia atualizada:', payload);
          fetchCirurgias(); // Recarrega dados
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // ... resto do hook (CRUD)
}
```

### Padrão 3: Hook com IA

```typescript
// Exemplo: useContasReceber.ts com Score IA
import { ContasReceberAI } from '@/lib/services/ai/ContasReceberAI';

export function useContasReceber() {
  const calcularScoreInadimplencia = async (contaId: string) => {
    try {
      const { data: conta } = await supabase
        .from('contas_receber')
        .select('*')
        .eq('id', contaId)
        .single();

      if (!conta) throw new Error('Conta não encontrada');

      // IA: Score de inadimplência (0-100)
      const score = await ContasReceberAI.calcularScoreInadimplencia({
        diasAtraso: conta.dias_atraso,
        valorTotal: conta.valor_total,
        historicoCliente: conta.cliente_id,
      });

      // Atualizar conta com score
      await supabase
        .from('contas_receber')
        .update({ score_inadimplencia: score.score })
        .eq('id', contaId);

      return score;
    } catch (error) {
      console.error('Erro ao calcular score:', error);
      throw error;
    }
  };

  // ... resto do hook
}
```

---

## 🔒 RLS Policies

### Exemplo: Tabela `cirurgias`

```sql
-- RLS: Habilitar
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT (somente cirurgias do hospital do usuário)
CREATE POLICY "select_cirurgias_hospital"
ON cirurgias FOR SELECT
USING (
  hospital_id IN (
    SELECT hospital_id FROM usuarios
    WHERE user_id = auth.uid()
  )
);

-- Policy: INSERT (somente usuários com permissão)
CREATE POLICY "insert_cirurgias"
ON cirurgias FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'cirurgias_manager')
  )
);

-- Policy: UPDATE (somente criador ou admin)
CREATE POLICY "update_cirurgias"
ON cirurgias FOR UPDATE
USING (
  criado_por = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

📖 **[Ver Todas as Policies](./rbac.md)**

---

## 🔄 Realtime Subscriptions

### Padrão Recomendado

```typescript
useEffect(() => {
  // Subscribe
  const channel = supabase
    .channel('table-name-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',                    // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'table_name',
      },
      (payload) => {
        console.log('Mudança detectada:', payload);
        
        // Atualizar estado local
        if (payload.eventType === 'INSERT') {
          setItems(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setItems(prev => 
            prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => 
            prev.filter(item => item.id !== payload.old.id)
          );
        }
      }
    )
    .subscribe();

  // Cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Hooks com Realtime Ativo (60+)

✅ Todos os hooks de CRUD implementam Realtime por padrão.

---

## 📊 Migrations

### Localização

```
supabase/migrations/
├── 20250101000000_initial_schema.sql
├── 20250102000000_rbac_policies.sql
├── 20250103000000_cirurgias_completo.sql
├── 20250104000000_estoque_completo.sql
├── 20250105000000_financeiro_completo.sql
└── ...
```

### Criar Nova Migration

```bash
# Via CLI Supabase
supabase migration new nome_da_migration

# Executar localmente
supabase db reset

# Deploy produção
supabase db push
```

### Auditoria Automática

```bash
# Rodar auditoria completa
pnpm supabase:audit

# Relatórios salvos em:
.cursor/reports/supabase/
```

📖 **[Ver Supabase Audit Playbook](./SUPABASE_AUDIT_PLAYBOOK.md)**

---

## 🎯 Checklist de Integração

Para cada hook novo:

- [ ] Criar tabela no Supabase
- [ ] Definir RLS policies
- [ ] Implementar CRUD no hook
- [ ] Adicionar Realtime subscription
- [ ] Implementar filtros avançados
- [ ] Adicionar tratamento de erros
- [ ] Criar migration SQL
- [ ] Documentar na API
- [ ] Adicionar testes E2E
- [ ] Rodar auditoria (`pnpm supabase:audit`)

---

## 📚 Recursos Adicionais

### Documentação Oficial
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- 📖 [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- 📖 [Realtime](https://supabase.com/docs/guides/realtime)

### Exemplos Práticos
- 📖 [useContasReceber.ts](../src/hooks/useContasReceber.ts) - CRUD + IA
- 📖 [useFluxoCaixa.ts](../src/hooks/useFluxoCaixa.ts) - CRUD + Previsão
- 📖 [useCirurgias.ts](../src/hooks/useCirurgias.ts) - CRUD + Realtime

---

## 📞 Suporte

Problemas com integração Supabase?

1. Verificar variáveis de ambiente (`.env`)
2. Rodar `pnpm supabase:audit` para diagnosticar
3. Consultar logs do Supabase Dashboard
4. Ver troubleshooting em `docs/troubleshooting/`

---

**Versão:** 1.0.0  
**Data:** 30 de Outubro de 2025  
**Hooks Cobertos:** 66/66 (100%)  
**Status:** ✅ Guia Completo

© 2025 ICARUS v5.0 - Icarus AI Technology  
**Supabase Integration Guide - Complete Coverage** ✨

