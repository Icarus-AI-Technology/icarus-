# Icarus v5.0 - Especificação Técnica do Sistema

Este documento detalha as especificações técnicas e funcionais das atualizações mais recentes do sistema Icarus v5.0, incluindo novos módulos de relatórios, compliance, design system e integrações.

## 1. Dashboards Analíticos
**Localização**: `src/pages/relatorios/DashboardsAnaliticos.tsx`
**Status**: Implementado

Centro de inteligência e análise de dados projetado para fornecer visão consolidada e segmentada da operação.

### Funcionalidades Principais
- **Categorias de Análise**:
  - **Operacional**: Dashboard Executivo, Gestão de Estoque.
  - **Financeiro**: Análise Financeira (Receitas, Despesas, Fluxo de Caixa).
  - **Comercial**: Performance de Vendas (Pipeline, Conversão, Faturamento).
  - **Compliance**: Monitoramento regulatório (integrado ao módulo de Compliance).

### Estrutura dos Dashboards
- **Dashboard Executivo**: Visão consolidada de 12 KPIs estratégicos.
- **Cards Interativos**:
  - Indicadores visuais de categoria (cores e ícones específicos).
  - Contagem de métricas-chave por dashboard.
  - Ações rápidas: Exportar Dados, Configurar Alertas, Agendar Relatório, Compartilhar.

## 2. Compliance & Auditoria Avançado
**Localização**: `src/ComplianceAuditoria.tsx`
**Status**: Implementado (Completo)

Módulo robusto para gestão regulatória, focado em requisitos Abbott, ISO 13485 e ANVISA.

### Destaques do Módulo
- **Score Abbott**: Monitoramento em tempo real com status "Distribuidor Platinum" (Score atual: 98.2%).
- **Navegação em Abas**:
  1. **Dashboard**: Visão geral com Score Global e KPIs.
  2. **Compliance Abbott**: Detalhamento dos 7 requisitos obrigatórios, evidências e ações corretivas.
  3. **Auditorias**: Histórico e gestão de auditorias internas/externas.
  4. **Não Conformidades (NCs)**: Sistema CAPA completo (Ações Corretivas e Preventivas) com classificação de severidade (Crítica, Maior, Menor).
  5. **Treinamentos**: Controle de capacitação e certificações da equipe.
  6. **Agentes IA**: Monitoramento automatizado por 5 agentes inteligentes.

### Integração com IA
- **Agentes Ativos**: 5 agentes monitorando conformidade.
- **Funcionalidades**:
  - Geração de alertas inteligentes baseados em severidade (Crítico, Urgente).
  - Sugestão automática de ações corretivas.
  - Cálculo de taxa de acerto das análises de IA.

## 3. Design System Neumórfico 3D Premium (OraclusX DS)
**Localização**: `src/NeumoShowcase.tsx`
**Status**: Implementado

Nova linguagem visual baseada em Neumorfismo 3D com suporte a temas Claro/Escuro.

### Componentes Implementados
- **Cards**: `CardKpi` (com tendências), `MiniCard` (compactos), `NeomorphicCard` (container padrão).
- **Inputs & Formulários**:
  - Inputs neumórficos com ícones e validação de erro.
  - `NeumoTextarea` com contador de caracteres.
  - `NeumoSearchBar` com tamanhos variáveis (sm, md, lg).
- **Botões**: Variantes (Primary, Secondary, Success, Warning, Danger, Ghost, Neumo) e estados (Loading, Disabled).
- **Feedback Visual**: Badges, Progress Bars com gradientes e animações suaves.

