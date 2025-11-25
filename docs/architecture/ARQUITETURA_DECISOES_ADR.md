# Decisões de Arquitetura (ADR) — ICARUS v5.0

> **Architecture Decision Records**  
> Documentação de decisões técnicas e suas justificativas

---

## 📋 Índice de Decisões

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| ADR-001 | Escolha do Supabase como Backend-as-a-Service | ✅ Aceito | 2025-01 |
| ADR-002 | React 18 com TypeScript para Frontend | ✅ Aceito | 2025-01 |
| ADR-003 | Arquitetura Multi-Agente para IA | ✅ Aceito | 2025-02 |
| ADR-004 | Row Level Security (RLS) para Autorização | ✅ Aceito | 2025-01 |
| ADR-005 | TailwindCSS + shadcn/ui para Design System | ✅ Aceito | 2025-01 |
| ADR-006 | React Query para Server State Management | ✅ Aceito | 2025-02 |
| ADR-007 | Vite como Build Tool | ✅ Aceito | 2025-01 |
| ADR-008 | MCP (Model Context Protocol) para Orquestração | ✅ Aceito | 2025-02 |
| ADR-009 | GPT Researcher para Pesquisa Externa | ✅ Aceito | 2025-02 |
| ADR-010 | Materialized Views para Relatórios | ✅ Aceito | 2025-03 |

---

## ADR-001: Escolha do Supabase como Backend-as-a-Service

**Status**: ✅ Aceito  
**Data**: Janeiro 2025  
**Decisores**: Arquiteto de Sistema, Tech Lead

### Contexto

Precisávamos de uma solução de backend que oferecesse:
- Banco de dados PostgreSQL gerenciado
- Autenticação e autorização robusta
- APIs REST e GraphQL automáticas
- Storage de arquivos
- Realtime subscriptions
- Facilidade de deploy e escalabilidade

### Decisão

Escolhemos **Supabase** como plataforma Backend-as-a-Service.

### Alternativas Consideradas

1. **Firebase** (Google)
   - ❌ NoSQL (Firestore) - preferimos SQL relacional
   - ❌ Vendor lock-in maior
   - ✅ Bom suporte a realtime
   - ✅ Excelente para mobile

2. **AWS Amplify**
   - ❌ Curva de aprendizado mais íngreme
   - ❌ Custo potencialmente maior
   - ✅ Maior flexibilidade
   - ✅ Integração nativa AWS

3. **Backend Custom (Node.js + Express + PostgreSQL)**
   - ❌ Maior tempo de desenvolvimento
   - ❌ Necessidade de gerenciar infraestrutura
   - ✅ Controle total
   - ✅ Sem vendor lock-in

### Justificativa

**Vantagens do Supabase**:
- ✅ PostgreSQL nativo (SQL relacional)
- ✅ Row Level Security (RLS) nativo
- ✅ PostgREST automático
- ✅ Auth pronto (JWT, OAuth, MFA)
- ✅ Storage S3-compatible
- ✅ Realtime via WebSockets
- ✅ Dashboard de administração
- ✅ CLI robusto para migrações
- ✅ Open-source (pode self-host se necessário)
- ✅ Pricing competitivo

**Desvantagens Aceitáveis**:
- ⚠️ Vendor lock-in moderado (mitigado por ser open-source)
- ⚠️ Menos maduro que Firebase
- ⚠️ Edge Functions ainda em evolução

### Consequências

**Positivas**:
- Time to market reduzido em ~60%
- Foco em regras de negócio, não infraestrutura
- RLS garante segurança por design
- Realtime out-of-the-box

**Negativas**:
- Dependência de terceiro
- Necessidade de plano Pro para escalabilidade
- Limitações em edge functions complexas

**Riscos Mitigados**:
- **Vendor lock-in**: Supabase é open-source, podemos migrar para self-hosted
- **Escalabilidade**: Plano Pro oferece read replicas e autoscaling
- **Custo**: Modelo de pricing previsível baseado em uso

---

## ADR-002: React 18 com TypeScript para Frontend

**Status**: ✅ Aceito  
**Data**: Janeiro 2025  
**Decisores**: Frontend Lead, Arquiteto

### Contexto

Necessitávamos de uma biblioteca/framework frontend que oferecesse:
- Componentização reutilizável
- Type safety
- Ecossistema maduro
- Performance otimizada
- Suporte a SSR (Server-Side Rendering)

### Decisão

Adotar **React 18 + TypeScript** como stack frontend.

### Alternativas Consideradas

1. **Vue 3 + TypeScript**
   - ✅ Curva de aprendizado mais suave
   - ✅ Composition API poderosa
   - ❌ Ecossistema menor
   - ❌ Menos desenvolvedores no mercado

2. **Angular**
   - ✅ Framework completo (opinionated)
   - ✅ TypeScript nativo
   - ❌ Muito verboso
   - ❌ Curva de aprendizado íngreme

3. **Svelte**
   - ✅ Performance excelente
   - ✅ Menos boilerplate
   - ❌ Ecossistema imaturo
   - ❌ Falta de desenvolvedores

### Justificativa

**Vantagens do React 18**:
- ✅ Maior ecossistema de bibliotecas
- ✅ Comunidade gigante
- ✅ Concurrent rendering (performance)
- ✅ Suspense para data fetching
- ✅ Server Components (futuro)
- ✅ React Query, Zustand, etc.
- ✅ Facilidade de contratar desenvolvedores

**Vantagens do TypeScript**:
- ✅ Type safety reduz bugs em ~40%
- ✅ Melhor DX (autocomplete, refactoring)
- ✅ Documentação viva via tipos
- ✅ Integração nativa com React

### Consequências

**Positivas**:
- Código mais robusto e manutenível
- Melhor experiência de desenvolvedor
- Facilidade de onboarding de novos devs

**Negativas**:
- Curva de aprendizado inicial para TypeScript
- Build time ligeiramente maior

---

## ADR-003: Arquitetura Multi-Agente para IA

**Status**: ✅ Aceito  
**Data**: Fevereiro 2025  
**Decisores**: AI Lead, Arquiteto

### Contexto

Para geração de relatórios inteligentes, precisávamos de:
- Análise de dados internos (DB)
- Pesquisa de benchmarks externos
- Síntese em relatórios executivos
- Escalabilidade para múltiplas requisições

### Decisão

Implementar uma **arquitetura multi-agente** com orquestrador central e 3 agentes especializados:
1. **Agente Dados Internos**: Coleta e análise de dados do PostgreSQL
2. **Agente Benchmark Externo**: Pesquisa com GPT Researcher
3. **Agente Síntese**: Geração de relatórios executivos

### Alternativas Consideradas

1. **Monolítico com LLM único**
   - ❌ Menos modular
   - ❌ Difícil de escalar partes específicas
   - ✅ Mais simples

2. **Funções serverless independentes**
   - ❌ Falta de orquestração
   - ❌ Estado compartilhado complexo
   - ✅ Escalabilidade automática

### Justificativa

**Vantagens**:
- ✅ **Separation of Concerns**: Cada agente tem responsabilidade única
- ✅ **Escalabilidade**: Pode escalar cada agente independentemente
- ✅ **Resiliência**: Falha em um agente não quebra pipeline
- ✅ **Testabilidade**: Fácil testar cada agente isoladamente
- ✅ **Manutenibilidade**: Código modular e organizado

**Implementação**:
```
Orquestrador (MCP)
    ├── AgentInt (Python + LangChain)
    ├── AgentBench (Python + GPT Researcher)
    └── AgentSynth (Python + OpenAI)
```

### Consequências

**Positivas**:
- Pipeline de IA modular e extensível
- Fácil adicionar novos agentes
- Retry logic por agente

**Negativas**:
- Complexidade operacional maior
- Necessidade de orquestração

---

## ADR-004: Row Level Security (RLS) para Autorização

**Status**: ✅ Aceito  
**Data**: Janeiro 2025  
**Decisores**: Arquiteto, Security Lead

### Contexto

Sistema hospitalar multitenancy com dados sensíveis (LGPD, HIPAA-like). Precisávamos de:
- Isolamento de dados por hospital/unidade
- Controle granular de acesso
- Segurança por design (não confiar apenas em application layer)

### Decisão

Implementar **Row Level Security (RLS)** no PostgreSQL para todas as tabelas sensíveis.

### Alternativas Consideradas

1. **Autorização apenas na aplicação**
   - ❌ Single point of failure
   - ❌ Bugs na app podem expor dados
   - ✅ Mais flexível

2. **Schemas separados por tenant**
   - ❌ Dificulta queries cross-tenant (relatórios agregados)
   - ❌ Manutenção de migrações complexa
   - ✅ Isolamento total

### Justificativa

**Vantagens do RLS**:
- ✅ **Defense in Depth**: Segurança na camada de dados
- ✅ **Multitenancy nativo**: `hospital_id`, `unidade_id`
- ✅ **Zero-trust**: Mesmo admin app não pode burlar RLS
- ✅ **Performance**: Filtros aplicados no DB (otimizados)
- ✅ **Auditável**: Políticas versionadas com código

**Exemplo de Política**:
```sql
-- Usuários só veem cirurgias do seu hospital
CREATE POLICY cirurgias_hospital_isolation ON cirurgias
  FOR ALL
  USING (
    hospital_id = (
      SELECT hospital_id 
      FROM usuarios 
      WHERE id = auth.uid()
    )
  );
```

### Consequências

**Positivas**:
- Dados protegidos mesmo se app for comprometida
- Compliance facilitado (auditoria de políticas)

**Negativas**:
- Curva de aprendizado para desenvolvedores
- Debugging mais complexo (políticas invisíveis no app)

---

## ADR-005: TailwindCSS + shadcn/ui para Design System

**Status**: ✅ Aceito  
**Data**: Janeiro 2025  
**Decisores**: Frontend Lead, UX Designer

### Contexto

Precisávamos de um design system que oferecesse:
- Componentização consistente
- Customização fácil (tema OraclusX neumórfico)
- Acessibilidade (WCAG 2.1)
- Performance (CSS otimizado)

### Decisão

Adotar **TailwindCSS** como framework de utilidades CSS + **shadcn/ui** como biblioteca de componentes.

### Alternativas Consideradas

1. **Material-UI (MUI)**
   - ❌ Bundle size grande (~350KB)
   - ❌ Difícil customizar tema completamente
   - ✅ Componentes prontos e acessíveis

2. **Chakra UI**
   - ✅ Excelente DX
   - ✅ Acessibilidade nativa
   - ❌ Runtime CSS-in-JS (performance)

3. **Ant Design**
   - ✅ Muitos componentes enterprise
   - ❌ Design opinativo (difícil customizar)
   - ❌ Bundle size grande

### Justificativa

**TailwindCSS**:
- ✅ Utility-first (flexibilidade máxima)
- ✅ PurgeCSS automático (CSS final ~10KB)
- ✅ Design tokens via `tailwind.config.js`
- ✅ JIT compiler (dev experience rápida)

**shadcn/ui**:
- ✅ Componentes copiados para codebase (não dependência)
- ✅ Radix UI primitives (acessibilidade A+)
- ✅ Customização total
- ✅ Zero runtime overhead
- ✅ TypeScript nativo

**OraclusX Theme**:
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      // Neumorphic palette
      primary: '#2D3748',
      secondary: '#4A5568',
      accent: '#ED8936',
      // ...
    },
    boxShadow: {
      'neomorph-inset': 'inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #fff',
      'neomorph': '3px 3px 6px #b8b9be, -3px -3px 6px #fff',
    }
  }
}
```

### Consequências

**Positivas**:
- Design consistente em todo o app
- Performance excelente (CSS mínimo)
- Fácil criar novos componentes

**Negativas**:
- HTML mais verboso (muitas classes)
- Necessidade de padronizar uso

---

## ADR-006: React Query para Server State Management

**Status**: ✅ Aceito  
**Data**: Fevereiro 2025  
**Decisores**: Frontend Lead

### Contexto

Gerenciamento de estado server-side (dados do backend) requer:
- Caching inteligente
- Revalidação automática
- Optimistic updates
- Retry logic
- Prefetching

### Decisão

Adotar **React Query (TanStack Query)** para gerenciamento de server state.

### Alternativas Consideradas

1. **Redux Toolkit Query (RTK Query)**
   - ✅ Integração com Redux
   - ❌ Mais verboso
   - ❌ Necessidade de Redux global

2. **SWR (Vercel)**
   - ✅ Mais leve
   - ❌ Menos features (sem mutations avançadas)
   - ✅ Simples de usar

3. **Apollo Client** (para GraphQL)
   - ✅ Excelente para GraphQL
   - ❌ Overkill para REST
   - ❌ Bundle size grande

### Justificativa

**Vantagens React Query**:
- ✅ **Caching automático**: Reduz requests em ~70%
- ✅ **Stale-while-revalidate**: UX instantânea
- ✅ **Optimistic updates**: UI responsiva
- ✅ **Prefetching**: Dados prontos antes de precisar
- ✅ **DevTools**: Inspeção de queries em tempo real
- ✅ **TypeScript**: Inferência de tipos automática
- ✅ **Offline support**: Sync quando voltar online

**Exemplo**:
```typescript
// Hook customizado
export function useCirurgias(unidadeId: string) {
  return useQuery({
    queryKey: ['cirurgias', unidadeId],
    queryFn: () => supabase
      .from('cirurgias')
      .select('*, medico(*), materiais(*)')
      .eq('unidade_id', unidadeId),
    staleTime: 5 * 60 * 1000, // 5 min
    cacheTime: 10 * 60 * 1000, // 10 min
  });
}
```

### Consequências

**Positivas**:
- Redução de código boilerplate
- UX melhorada (loading states automáticos)
- Performance (menos requests)

**Negativas**:
- Curva de aprendizado inicial
- Necessidade de pensar em cache keys

---

## ADR-007: Vite como Build Tool

**Status**: ✅ Aceito  
**Data**: Janeiro 2025  
**Decisores**: Frontend Lead

### Contexão

Build tool para desenvolvimento e produção que oferecesse:
- HMR (Hot Module Replacement) instantâneo
- Build de produção otimizado
- Suporte a TypeScript, JSX, CSS
- Plugin ecosystem

### Decisão

Adotar **Vite** como build tool.

### Alternativas Consideradas

1. **Create React App (CRA)**
   - ❌ HMR lento (Webpack)
   - ❌ Build time longo
   - ❌ Sem manutenção ativa
   - ✅ Zero config

2. **Next.js**
   - ✅ SSR/SSG built-in
   - ✅ File-based routing
   - ❌ Overkill para SPA
   - ❌ Vendor lock-in Vercel

3. **Webpack (manual)**
   - ✅ Controle total
   - ❌ Configuração complexa
   - ❌ HMR mais lento

### Justificativa

**Vantagens Vite**:
- ✅ **Dev server instantâneo**: ESM nativo
- ✅ **HMR < 50ms**: Mesmo em apps grandes
- ✅ **Build otimizado**: Rollup + esbuild
- ✅ **Plugin ecosystem**: Compatível com Rollup
- ✅ **Zero config**: Funciona out-of-the-box
- ✅ **TypeScript**: Suporte nativo (esbuild)

**Benchmarks**:
```
Dev server startup:
- Vite: ~300ms
- CRA: ~15s
- Next.js: ~5s

HMR:
- Vite: ~50ms
- CRA: ~3s
```

### Consequências

**Positivas**:
- DX excepcional (feedback instantâneo)
- Build de produção rápido
- Bundle size otimizado

**Negativas**:
- Ainda relativamente novo (menos maduro que Webpack)

---

## ADR-008: MCP (Model Context Protocol) para Orquestração

**Status**: ✅ Aceito  
**Data**: Fevereiro 2025  
**Decisores**: AI Lead, Arquiteto

### Contexto

Orquestração de múltiplos agentes de IA requer:
- Comunicação padronizada
- Context sharing
- Error handling
- Observabilidade

### Decisão

Adotar **Model Context Protocol (MCP)** como protocolo de orquestração.

### Alternativas Consideradas

1. **LangGraph**
   - ✅ Específico para LLM orchestration
   - ❌ Menos flexível para agentes não-LLM
   - ✅ Visualização de grafos

2. **Apache Airflow**
   - ✅ Maduro e robusto
   - ❌ Overhead alto
   - ❌ Não específico para AI

3. **Custom solution**
   - ✅ Controle total
   - ❌ Reinventar a roda
   - ❌ Manutenção complexa

### Justificativa

**Vantagens MCP**:
- ✅ **Protocolo padronizado**: Interop entre agentes
- ✅ **Context propagation**: Histórico de conversação
- ✅ **Tool calling**: Agentes podem chamar ferramentas
- ✅ **Streaming**: Respostas em tempo real
- ✅ **Observabilidade**: Logs estruturados

### Consequências

**Positivas**:
- Pipeline de IA extensível
- Fácil debug de fluxos

**Negativas**:
- Protocolo ainda em evolução

---

## ADR-009: GPT Researcher para Pesquisa Externa

**Status**: ✅ Aceito  
**Data**: Fevereiro 2025  
**Decisores**: AI Lead

### Contexto

Agente de benchmark precisa:
- Pesquisar web por dados atualizados
- Extrair informações estruturadas
- Citar fontes
- Validar credibilidade

### Decisão

Usar **GPT Researcher** como framework de pesquisa.

### Alternativas Consideradas

1. **Custom scraper + LLM**
   - ❌ Difícil manter scrapers atualizados
   - ❌ Problemas de bloqueio (rate limits)
   - ✅ Controle total

2. **SerpAPI + LLM**
   - ✅ APIs estruturadas
   - ❌ Custo por query
   - ❌ Menos contexto

### Justificativa

**Vantagens GPT Researcher**:
- ✅ **Multi-source**: Combina múltiplas fontes
- ✅ **Citations**: Rastreabilidade de dados
- ✅ **Structured output**: JSON, Markdown, PDF
- ✅ **Cost-effective**: Otimiza tokens LLM

### Consequências

**Positivas**:
- Relatórios com dados externos atualizados
- Benchmarks confiáveis

**Negativas**:
- Dependência de APIs externas
- Latência variável

---

## ADR-010: Materialized Views para Relatórios

**Status**: ✅ Aceito  
**Data**: Março 2025  
**Decisores**: DBA, Backend Lead

### Contexto

Relatórios complexos com agregações pesadas (JOIN de 10+ tabelas) causavam:
- Queries > 5s
- Lock de tabelas
- Degradação de performance

### Decisão

Criar **materialized views** para relatórios frequentes, com refresh via `pg_cron`.

### Alternativas Consideradas

1. **Cache em Redis**
   - ✅ Muito rápido
   - ❌ Complexidade operacional
   - ❌ Inconsistência potencial

2. **Queries otimizadas apenas**
   - ❌ Ainda lentas para agregações complexas
   - ✅ Sempre atualizado

### Justificativa

**Vantagens Materialized Views**:
- ✅ **Performance**: Queries < 100ms
- ✅ **Simplicidade**: Apenas SQL
- ✅ **Consistência**: Refresh controlado
- ✅ **Nativo**: Suportado pelo PostgreSQL

**Exemplo**:
```sql
CREATE MATERIALIZED VIEW mv_dashboard_principal AS
SELECT 
  u.id as unidade_id,
  COUNT(DISTINCT c.id) as total_cirurgias,
  SUM(c.valor_total) as receita_total,
  COUNT(DISTINCT cm.material_id) as materiais_utilizados
FROM unidades u
LEFT JOIN cirurgias c ON c.unidade_id = u.id
LEFT JOIN cirurgia_materiais cm ON cm.cirurgia_id = c.id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id;

-- Refresh a cada hora via pg_cron
SELECT cron.schedule(
  'refresh-dashboard',
  '0 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_principal$$
);
```

### Consequências

**Positivas**:
- Dashboards rápidos (< 100ms)
- Menor carga no DB

**Negativas**:
- Dados com delay máximo de 1h
- Storage adicional (~10GB estimado)

---

## Template para Novos ADRs

```markdown
## ADR-XXX: [Título da Decisão]

**Status**: 🔄 Proposto | ✅ Aceito | ❌ Rejeitado | ⚠️ Depreciado  
**Data**: [Mês Ano]  
**Decisores**: [Roles/Nomes]

### Contexto
[Descrever o problema ou necessidade]

### Decisão
[Descrever a decisão tomada]

### Alternativas Consideradas
1. **[Alternativa 1]**
   - ✅ Vantagem
   - ❌ Desvantagem

### Justificativa
[Por que essa decisão foi tomada]

### Consequências
**Positivas**:
- [Lista]

**Negativas**:
- [Lista]

**Riscos**:
- [Lista com mitigações]
```

---

## Processo de Revisão de ADRs

1. **Proposta**: Qualquer membro do time pode propor um ADR
2. **Revisão**: Tech Lead + Arquiteto revisam
3. **Discussão**: Time debate em reunião técnica
4. **Decisão**: Consenso ou voto (maioria)
5. **Documentação**: ADR é adicionado a este arquivo
6. **Implementação**: ADR é referenciado em PRs

---

**Mantido por**: Equipe de Arquitetura ICARUS  
**Última revisão**: 17 de novembro de 2025

