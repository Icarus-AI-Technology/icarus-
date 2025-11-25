# 📐 Índice Master de Arquitetura — ICARUS v5.0 (OraclusX)

> **Centro de Documentação Arquitetural**  
> Navegue por toda a documentação técnica do sistema

---

## 🎯 Guia Rápido

**Você é...** | **Comece por...**
---|---
Novo desenvolvedor | [Visão Geral](#1-visão-geral) → [Diagramas](#2-diagramas-técnicos) → [Quick Start](./QUICK_START.md)
Arquiteto revisando o sistema | [Decisões de Arquitetura](#3-decisões-de-arquitetura-adr) → [Visão Geral](#1-visão-geral)
Product Manager | [Visão Geral](#1-visão-geral) → [Inventário de Módulos](./INVENTARIO_58_MODULOS_COMPLETO.md)
DevOps/SRE | [Deploy](#4-deploy-e-infraestrutura) → [Diagramas de Deployment](#2-diagramas-técnicos)
QA/Tester | [Documentação Técnica](#5-documentação-técnica-completa) → [Testes](#6-qualidade-e-testes)
Stakeholder executivo | [Relatório Executivo](./RELATORIO_EXECUTIVO_100.md) → [Auditoria](#7-auditoria-e-compliance)

---

## 📚 Estrutura da Documentação

```
📐 ARQUITETURA
│
├── 📄 1. Visão Geral (você está aqui)
│   └── Panorama completo do sistema
│
├── 🔷 2. Diagramas Técnicos
│   ├── Sequência
│   ├── Componentes
│   ├── Deployment
│   ├── C4 (Contexto + Container)
│   ├── Classes (Domain Model)
│   ├── Fluxogramas
│   └── ERD
│
├── 📋 3. Decisões de Arquitetura (ADR)
│   └── 10 ADRs documentados
│
├── 🚀 4. Deploy e Infraestrutura
│   ├── Guias de deploy
│   ├── Configuração de ambiente
│   └── Monitoramento
│
├── 📖 5. Documentação Técnica Completa
│   ├── Frontend
│   ├── Backend
│   ├── Database
│   └── Integrações
│
├── ✅ 6. Qualidade e Testes
│   ├── Auditoria de código
│   ├── Testes automatizados
│   └── Performance
│
└── 🔒 7. Segurança e Compliance
    ├── LGPD
    ├── ANVISA
    └── Auditoria
```

---

## 1. Visão Geral

### 📄 [ARQUITETURA_ICARUS_V5_VISAO_GERAL.md](./ARQUITETURA_ICARUS_V5_VISAO_GERAL.md)

**O que você encontrará**:
- 🗺️ Diagrama de arquitetura em alto nível (Mermaid)
- 🧩 Descrição de todos os componentes principais
- 🔄 Fluxos de dados entre componentes
- 💻 Stack tecnológico completo
- 🔐 Segurança e compliance
- 📈 Estratégia de escalabilidade

**Quando usar**:
- Onboarding de novos desenvolvedores
- Apresentações para stakeholders
- Decisões de arquitetura
- Planejamento de novas features

**Tempo de leitura**: 15-20 minutos

---

## 2. Diagramas Técnicos

### 🔷 [ARQUITETURA_DIAGRAMAS_DETALHADOS.md](./ARQUITETURA_DIAGRAMAS_DETALHADOS.md)

**Diagramas incluídos**:

#### 2.1 Diagramas de Sequência
- ✅ Autenticação JWT com RBAC
- ✅ Geração de relatório com pipeline de agentes IA
- ✅ Processo completo de cirurgia
- ✅ Integração com ANVISA/UDI

#### 2.2 Diagramas de Componentes
- ✅ Frontend React (módulos, estado, API layer)
- ✅ Backend Supabase (Auth, API, DB, Storage)
- ✅ Pipeline de Agentes IA

#### 2.3 Diagramas de Deployment
- ✅ Infraestrutura completa (Vercel + Supabase + Cloud Run)
- ✅ Edge network e CDN
- ✅ Integrações externas

#### 2.4 Diagramas C4
- ✅ **Contexto**: Visão externa do sistema
- ✅ **Container**: Componentes internos

#### 2.5 Diagramas de Classes
- ✅ Domain Model (Entidades principais)
- ✅ Relacionamentos entre entidades

#### 2.6 Fluxogramas
- ✅ Processo de cirurgia (end-to-end)
- ✅ Processo de consignação
- ✅ Fluxo de aprovação de compras

#### 2.7 Diagramas de Estados
- ✅ Ciclo de vida da cirurgia
- ✅ Estados de pedido de compra

#### 2.8 ERD (Entity-Relationship Diagram)
- ✅ Modelo de dados simplificado
- ✅ 58 tabelas principais

**Quando usar**:
- Entender fluxos complexos
- Planejar integrações
- Documentar processos
- Code reviews

**Tempo de leitura**: 30-40 minutos

---

## 3. Decisões de Arquitetura (ADR)

### 📋 [ARQUITETURA_DECISOES_ADR.md](./ARQUITETURA_DECISOES_ADR.md)

**ADRs Documentados**:

| # | Decisão | Status | Impacto |
|---|---------|--------|---------|
| ADR-001 | Supabase como BaaS | ✅ Aceito | 🔴 Alto |
| ADR-002 | React 18 + TypeScript | ✅ Aceito | 🔴 Alto |
| ADR-003 | Arquitetura Multi-Agente IA | ✅ Aceito | 🟡 Médio |
| ADR-004 | Row Level Security (RLS) | ✅ Aceito | 🔴 Alto |
| ADR-005 | TailwindCSS + shadcn/ui | ✅ Aceito | 🟡 Médio |
| ADR-006 | React Query | ✅ Aceito | 🟡 Médio |
| ADR-007 | Vite como build tool | ✅ Aceito | 🟢 Baixo |
| ADR-008 | MCP para Orquestração | ✅ Aceito | 🟡 Médio |
| ADR-009 | GPT Researcher | ✅ Aceito | 🟢 Baixo |
| ADR-010 | Materialized Views | ✅ Aceito | 🟡 Médio |

**Estrutura de cada ADR**:
- 📝 Contexto e problema
- ✅ Decisão tomada
- 🔄 Alternativas consideradas
- 📊 Justificativa técnica
- ⚡ Consequências (positivas e negativas)
- ⚠️ Riscos e mitigações

**Quando usar**:
- Entender "por que" decisões foram tomadas
- Propor novas decisões arquiteturais
- Onboarding de arquitetos
- Revisões de arquitetura

**Tempo de leitura**: 25-30 minutos

---

## 4. Deploy e Infraestrutura

### 🚀 Guias de Deploy

| Documento | Descrição | Público |
|-----------|-----------|---------|
| [GUIA_DEPLOY_COMPLETO.md](./GUIA_DEPLOY_COMPLETO.md) | Deploy completo (frontend + backend + DB) | DevOps, Arquiteto |
| [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md) | Deploy específico Vercel | DevOps |
| [QUICK_START.md](./QUICK_START.md) | Setup local para desenvolvimento | Desenvolvedor |
| [QUICK_START_PRODUCTION.md](./QUICK_START_PRODUCTION.md) | Deploy em produção | DevOps |

### 🔧 Configuração de Ambiente

| Documento | Descrição |
|-----------|-----------|
| [VERCEL_ENV_COMPLETO.md](./VERCEL_ENV_COMPLETO.md) | Variáveis de ambiente Vercel |
| [env.example](./env.example) | Template de .env |

### 📊 Monitoramento

- **Supabase Dashboard**: Métricas de DB, Auth, Storage
- **Vercel Analytics**: Performance frontend
- **Logs customizados**: Winston/Pino (em desenvolvimento)

---

## 5. Documentação Técnica Completa

### 📖 Documentação Principal

| Documento | Escopo | Linhas de Código |
|-----------|--------|------------------|
| [DOCUMENTACAO_TECNICA_COMPLETA.md](./DOCUMENTACAO_TECNICA_COMPLETA.md) | Visão geral de tudo | ~50.000 LoC |
| [DOCUMENTACAO_TECNICA_FRONTEND.md](./DOCUMENTACAO_TECNICA_FRONTEND.md) | Frontend React/TS | ~25.000 LoC |
| [DOCUMENTACAO_TECNICA_BD.md](./DOCUMENTACAO_TECNICA_BD.md) | Database PostgreSQL | ~15.000 LoC |
| [DOCUMENTACAO_TECNICA_INTEGRACOES_DEPLOY.md](./DOCUMENTACAO_TECNICA_INTEGRACOES_DEPLOY.md) | Integrações e deploy | ~5.000 LoC |

### 📚 Documentação por Módulo

| Módulo | Documento |
|--------|-----------|
| Dashboard Principal | [DOCUMENTACAO_DASHBOARD_PRINCIPAL_COMPLETA.md](./DOCUMENTACAO_DASHBOARD_PRINCIPAL_COMPLETA.md) |
| Chatbot IA | [DOCUMENTACAO_CHATBOT_ICARUS_COMPLETA.md](./DOCUMENTACAO_CHATBOT_ICARUS_COMPLETA.md) |
| Estoque & Consignação | [DOCUMENTACAO_CONSIGNACAO_AVANCADA_COMPLETA.md](./DOCUMENTACAO_CONSIGNACAO_AVANCADA_COMPLETA.md) |
| Compliance & Auditoria | [DOCUMENTACAO_COMPLIANCE_AUDITORIA_COMPLETA.md](./DOCUMENTACAO_COMPLIANCE_AUDITORIA_COMPLETA.md) |
| Sidebar & Topbar | [DOCUMENTACAO_SIDEBAR_TOPBAR_COMPLETA.md](./DOCUMENTACAO_SIDEBAR_TOPBAR_COMPLETA.md) |

### 🗂️ Inventário Completo

- [INVENTARIO_58_MODULOS_COMPLETO.md](./INVENTARIO_58_MODULOS_COMPLETO.md): Todos os 58 módulos do sistema

---

## 6. Qualidade e Testes

### ✅ Auditoria de Código

| Documento | Score | Status |
|-----------|-------|--------|
| [AUDITORIA_COMPLETA_FINAL.md](./AUDITORIA_COMPLETA_FINAL.md) | 94% | ✅ Excelente |
| [RELATORIO_AUDITORIA_CODIGO.md](./RELATORIO_AUDITORIA_CODIGO.md) | - | Detalhado |
| [RELATORIO_QUALIDADE_94_PORCENTO.md](./RELATORIO_QUALIDADE_94_PORCENTO.md) | 94% | ✅ Aprovado |

### 🧪 Testes

**Cobertura de Testes**: 85% (meta: 90%)

| Tipo | Framework | Status |
|------|-----------|--------|
| Unitários | Vitest | ✅ Implementado |
| Integração | Playwright | ✅ Implementado |
| E2E | Playwright | 🔄 Em progresso |
| Performance | Lighthouse | ✅ Implementado |

**Documentos**:
- [AUDITORIA_AGENTE_08_TESTES_QUALIDADE.md](./AUDITORIA_AGENTE_08_TESTES_QUALIDADE.md)

### 📊 Performance

**Metas**:
- ✅ LCP (Largest Contentful Paint): < 2.5s
- ✅ FID (First Input Delay): < 100ms
- ✅ CLS (Cumulative Layout Shift): < 0.1
- ✅ Tempo de resposta API: < 200ms (p95)

---

## 7. Segurança e Compliance

### 🔒 Segurança

| Aspecto | Implementação | Status |
|---------|---------------|--------|
| Autenticação | JWT + Supabase Auth | ✅ |
| Autorização | Row Level Security (RLS) | ✅ |
| RBAC | 8 roles + políticas granulares | ✅ |
| Criptografia | TLS 1.3 + AES-256 | ✅ |
| MFA | Supabase MFA (opcional) | 🔄 |
| Rate Limiting | Supabase + Vercel | ✅ |
| SQL Injection | Prepared statements + RLS | ✅ |
| XSS | React escape automático | ✅ |

### 📋 Compliance

| Regulamentação | Status | Documento |
|----------------|--------|-----------|
| LGPD | ✅ Compliant | [DOCUMENTACAO_COMPLIANCE_AUDITORIA_COMPLETA.md](./DOCUMENTACAO_COMPLIANCE_AUDITORIA_COMPLETA.md) |
| ANVISA | ✅ Integrado | ADR-009 |
| UDI | ✅ Validação automática | ADR-009 |
| CFM | 🔄 Em validação | - |

### 🔍 Auditoria

**Logs de Auditoria**:
- ✅ Trigger-based (PostgreSQL)
- ✅ Retention: 90 dias
- ✅ Exportação: PDF/Excel
- ✅ Relatórios automáticos

**Documentos**:
- [AUDITORIA_AGENTE_07_SEGURANCA_COMPLIANCE.md](./AUDITORIA_AGENTE_07_SEGURANCA_COMPLIANCE.md)

---

## 8. Relatórios de Progresso

### 📈 Status do Projeto

| Relatório | Data | Status |
|-----------|------|--------|
| [PROJETO_100_PORCENTO_COMPLETO.md](./PROJETO_100_PORCENTO_COMPLETO.md) | 2025-11 | ✅ 100% |
| [RELATORIO_EXECUTIVO_100.md](./RELATORIO_EXECUTIVO_100.md) | 2025-11 | ✅ Final |
| [MILESTONE_50_COMPLETO.md](./MILESTONE_50_COMPLETO.md) | 2025-10 | ✅ Milestone |

### 📊 Auditoria por Agente

| Agente | Escopo | Score | Documento |
|--------|--------|-------|-----------|
| Agente 01 | Design System | 100% | [AUDITORIA_AGENTE_01_DESIGN_SYSTEM.md](./AUDITORIA_AGENTE_01_DESIGN_SYSTEM.md) |
| Agente 02 | Frontend Architecture | 95% | [AUDITORIA_AGENTE_02_FRONTEND_ARCHITECTURE.md](./AUDITORIA_AGENTE_02_FRONTEND_ARCHITECTURE.md) |
| Agente 03 | Backend & Database | 100% | [AUDITORIA_AGENTE_03_BACKEND_100.md](./AUDITORIA_AGENTE_03_BACKEND_100.md) |
| Agente 04 | Integrações APIs | 100% | [AUDITORIA_AGENTE_04_INTEGRACOES_100.md](./AUDITORIA_AGENTE_04_INTEGRACOES_100.md) |
| Agente 05 | Inteligência Artificial | 100% | [AUDITORIA_AGENTE_05_IA_100.md](./AUDITORIA_AGENTE_05_IA_100.md) |
| Agente 06 | Módulos Funcionais | 100% | [AUDIT_AGENTE_06_SCORE_100.md](./AUDIT_AGENTE_06_SCORE_100.md) |
| Agente 07 | Segurança & Compliance | 98% | [AUDITORIA_AGENTE_07_SEGURANCA_COMPLIANCE.md](./AUDITORIA_AGENTE_07_SEGURANCA_COMPLIANCE.md) |
| Agente 08 | Testes & Qualidade | 92% | [AUDITORIA_AGENTE_08_TESTES_QUALIDADE.md](./AUDITORIA_AGENTE_08_TESTES_QUALIDADE.md) |
| Agente 09 | Deploy & DevOps | 96% | [AUDITORIA_AGENTE_09_DEPLOY_DEVOPS.md](./AUDITORIA_AGENTE_09_DEPLOY_DEVOPS.md) |
| Agente 10 | Auditoria Final | 100% | [AUDITORIA_AGENTE_10_FINAL.md](./AUDITORIA_AGENTE_10_FINAL.md) |

**Média geral**: 98.1% ✅

---

## 9. Roadmap e Próximos Passos

### 🗺️ Roadmap Técnico

| Fase | Período | Status | Documento |
|------|---------|--------|-----------|
| Fase 1: Fundação | Q1 2025 | ✅ Completo | [BLOCO_1_COMPLETO.md](./BLOCO_1_COMPLETO.md) |
| Fase 2: Módulos Core | Q2 2025 | ✅ Completo | [FASE2_ESTRATEGIA_50_MODULOS.md](./FASE2_ESTRATEGIA_50_MODULOS.md) |
| Fase 3: IA & Relatórios | Q2 2025 | ✅ Completo | [FASE3_DASHBOARD_DEPLOY.md] |
| Fase 4: Cadastros | Q3 2025 | ✅ Completo | [FASE4_CADASTROS_COMPLETA.md](./FASE4_CADASTROS_COMPLETA.md) |
| Fase 5: Backend | Q3 2025 | ✅ Completo | [FASE5_BACKEND_COMPLETO.md](./FASE5_BACKEND_COMPLETO.md) |
| Fase 6: Integrações | Q3 2025 | ✅ Completo | [FASE6_INTEGRACAO_COMPLETA.md](./FASE6_INTEGRACAO_COMPLETA.md) |
| Fase 7: Deploy | Q4 2025 | ✅ Completo | [FASE7_FINAL.md](./FASE7_FINAL.md) |

### 🎯 Próximos Passos

- [PROXIMOS_PASSOS_COMPLETOS.txt](./PROXIMOS_PASSOS_COMPLETOS.txt)
- [ROADMAP.md](./ROADMAP.md)

---

## 10. Guias Rápidos

### 🚀 Quick Starts

| Guia | Público | Tempo |
|------|---------|-------|
| [QUICK_START.md](./QUICK_START.md) | Desenvolvedor | 10 min |
| [QUICK_START_PRODUCTION.md](./QUICK_START_PRODUCTION.md) | DevOps | 30 min |
| [QUICK_START_PREVIEW.md](./QUICK_START_PREVIEW.md) | QA | 15 min |

### 📝 Tutoriais Específicos

| Tutorial | Tópico |
|----------|--------|
| [GUIA_RAPIDO_LOGIN.md](./GUIA_RAPIDO_LOGIN.md) | Implementar autenticação |
| [GUIA_RAPIDO_CONTATO.md](./GUIA_RAPIDO_CONTATO.md) | Criar formulário de contato |
| [GUIA_RAPIDO_FORMULARIO_CONTATO.md](./GUIA_RAPIDO_FORMULARIO_CONTATO.md) | Form com validação |
| [GUIA_APLICACAO_MIGRATIONS.md](./GUIA_APLICACAO_MIGRATIONS.md) | Aplicar migrações DB |

---

## 11. Contribuindo

### 🤝 Como Contribuir

1. **Ler documentação**: Comece por este índice
2. **Setup local**: Siga [QUICK_START.md](./QUICK_START.md)
3. **Entender arquitetura**: Leia [ADRs](#3-decisões-de-arquitetura-adr)
4. **Seguir padrões**: Consulte [CONTRIBUTING.md](./CONTRIBUTING.md)
5. **Criar PR**: Com testes e documentação

### 📏 Padrões de Código

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Supabase Edge Functions
- **Database**: PostgreSQL com RLS
- **Testes**: Vitest + Playwright
- **Linter**: ESLint + Prettier

---

## 12. Contatos e Suporte

### 👥 Equipe

| Role | Responsável | Contato |
|------|-------------|---------|
| Arquiteto | - | dev@oraclusx.com |
| Tech Lead Frontend | - | dev@oraclusx.com |
| Tech Lead Backend | - | dev@oraclusx.com |
| AI Lead | - | dev@oraclusx.com |
| DevOps Lead | - | dev@oraclusx.com |

### 📞 Suporte

- **Email**: dev@oraclusx.com
- **Documentação**: Este repositório
- **Issues**: GitHub Issues (quando disponível)

---

## 📊 Estatísticas do Projeto

### 📈 Métricas

| Métrica | Valor |
|---------|-------|
| Linhas de código (Total) | ~50.000 LoC |
| Linhas de código (Frontend) | ~25.000 LoC |
| Linhas de código (Backend) | ~15.000 LoC |
| Linhas de código (SQL) | ~10.000 LoC |
| Módulos funcionais | 58 |
| Componentes React | 120+ |
| Tabelas no banco | 58 |
| Endpoints API | 200+ |
| Páginas de documentação | 100+ |
| Cobertura de testes | 85% |
| Score de qualidade | 94% |
| Desenvolvedores | 5+ |

### 🏆 Conquistas

- ✅ 100% dos módulos implementados
- ✅ 94% de qualidade de código
- ✅ 85% de cobertura de testes
- ✅ < 2s de carregamento de página
- ✅ < 200ms de resposta da API
- ✅ 100% compliance LGPD
- ✅ Integração ANVISA/UDI funcional
- ✅ Pipeline de IA multi-agente operacional

---

## 🔄 Atualizações deste Documento

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-11-17 | 1.0 | Criação do índice master |

---

## 📄 Licença

Este documento e o sistema ICARUS v5.0 são propriedade da **OraclusX**.

---

**Mantido por**: Equipe de Arquitetura ICARUS  
**Última atualização**: 17 de novembro de 2025  
**Versão do sistema**: 5.0

