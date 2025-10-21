# 🎯 Análise de GAPs - Schema vs 58 Módulos ICARUS v5.0

**Data:** 2025-10-20  
**Status:** 22/100+ tabelas criadas (22%)  
**Estratégia:** Identificar tabelas faltantes para completar o schema

---

## ✅ TABELAS EXISTENTES (22)

### Core/Multi-tenant
1. ✅ `empresas` - Multi-tenant root
2. ✅ `usuarios` - Usuários do sistema
3. ✅ `audit_log` - Auditoria LGPD
4. ✅ `schema_migrations` - Controle de migrations

### Cadastros Básicos
5. ✅ `medicos` - Cadastro de médicos
6. ✅ `hospitais` - Cadastro de hospitais
7. ✅ `fornecedores` - Fornecedores

### Produtos/Estoque
8. ✅ `produtos` - Catálogo OPME
9. ✅ `lotes` - Rastreabilidade ANVISA
10. ✅ `kits` - Kits cirúrgicos
11. ✅ `itens_kit` - Itens dos kits

### Cirurgias
12. ✅ `cirurgias` - Gestão de cirurgias
13. ✅ `status_item_cirurgia` - Status itens (ENUM ou tabela?)

### Compras
14. ✅ `pedidos_compra` - Pedidos de compra

### Vendas/CRM
15. ✅ `leads` - CRM/Leads

### Financeiro
16. ✅ `faturas` - Faturamento
17. ✅ `transacoes` - Transações financeiras

### Comunicação
18. ✅ `emails_enviados` - Log de emails

### Integrações
19. ✅ `microsoft_tokens` - Microsoft 365
20. ✅ `microsoft_contatos_sync` - Sincronização contatos
21. ✅ `microsoft_onedrive_files` - Arquivos OneDrive
22. ✅ `reunioes_teams` - Reuniões Teams

---

## ❌ TABELAS FALTANTES (80+)

### 1. Módulo Cirurgias (CRÍTICO)
- ❌ `pacientes` - Dados dos pacientes
- ❌ `convenios` - Planos de saúde
- ❌ `cirurgia_materiais` - Materiais usados
- ❌ `cirurgia_eventos` - Timeline de eventos
- ❌ `cirurgia_equipe` - Equipe médica
- ❌ `status_cirurgia` - ENUM de status

### 2. Módulo Estoque/Consignação
- ❌ `estoque` - Movimentações de estoque
- ❌ `estoque_movimentacoes` - Histórico
- ❌ `estoque_reservas` - Reservas
- ❌ `contratos_consignacao` - Contratos
- ❌ `remessas_consignacao` - Remessas
- ❌ `itens_consignacao` - Itens consignados
- ❌ `devolucoes_consignacao` - Devoluções

### 3. Módulo Compras (expandir)
- ❌ `solicitacoes_compra` - Solicitações
- ❌ `itens_pedido_compra` - Itens dos pedidos
- ❌ `cotacoes` - Cotações
- ❌ `itens_cotacao` - Itens cotados
- ❌ `fornecedores_produtos` - Relacionamento

### 4. Módulo Contratos
- ❌ `contratos` - Contratos diversos
- ❌ `contratos_clausulas` - Cláusulas
- ❌ `contratos_aditivos` - Aditivos
- ❌ `contratos_documentos` - Documentos anexos

### 5. Módulo Vendas/CRM (expandir)
- ❌ `oportunidades` - Pipeline vendas
- ❌ `propostas` - Propostas comerciais
- ❌ `itens_proposta` - Itens propostas
- ❌ `negociacoes` - Histórico negociações
- ❌ `atividades_crm` - Atividades/tarefas

### 6. Módulo Financeiro (expandir)
- ❌ `contas_pagar` - Contas a pagar
- ❌ `contas_receber` - Contas a receber
- ❌ `fluxo_caixa` - Fluxo de caixa
- ❌ `bancos` - Contas bancárias
- ❌ `centros_custo` - Centros de custo
- ❌ `plano_contas` - Plano de contas contábil
- ❌ `lancamentos_contabeis` - Lançamentos

### 7. Módulo Faturamento (expandir)
- ❌ `notas_fiscais` - Notas fiscais
- ❌ `nfes` - NF-es eletrônicas
- ❌ `itens_nota_fiscal` - Itens das notas
- ❌ `guias_opme` - Guias TISS
- ❌ `protocolos_faturamento` - Protocolos

### 8. Módulo Compliance/Auditoria
- ❌ `compliance_requisitos` - Requisitos regulatórios
- ❌ `compliance_evidencias` - Evidências
- ❌ `auditorias` - Auditorias
- ❌ `auditorias_itens` - Itens auditados
- ❌ `nao_conformidades` - Não conformidades
- ❌ `acoes_corretivas` - Ações corretivas

### 9. Módulo Portais OPME
- ❌ `portais_opme_config` - Configurações
- ❌ `portais_opme_solicitacoes` - Solicitações
- ❌ `portais_opme_respostas` - Respostas
- ❌ `portais_opme_logs` - Logs integração

### 10. Módulo Licitações
- ❌ `licitacoes` - Licitações
- ❌ `licitacoes_itens` - Itens licitados
- ❌ `propostas_licitacao` - Propostas
- ❌ `documentos_licitacao` - Documentos

### 11. Módulo Chatbot/GPT Researcher
- ❌ `chatbot_conversas` - Conversas
- ❌ `chatbot_mensagens` - Mensagens
- ❌ `chatbot_sessoes` - Sessões
- ❌ `pesquisas_gpt` - Pesquisas GPT

### 12. Módulo Workflow Builder
- ❌ `workflows` - Workflows
- ❌ `workflows_etapas` - Etapas
- ❌ `workflows_execucoes` - Execuções
- ❌ `workflows_logs` - Logs

### 13. Módulo API Gateway
- ❌ `api_endpoints` - Endpoints
- ❌ `api_keys` - Chaves API
- ❌ `api_logs` - Logs requisições
- ❌ `api_rate_limits` - Rate limiting

### 14. Módulo BI/Analytics
- ❌ `bi_dimensao_tempo` - Dimensão tempo
- ❌ `bi_dimensao_produto` - Dimensão produto
- ❌ `bi_fato_vendas` - Fato vendas
- ❌ `bi_fato_estoque` - Fato estoque
- ❌ `dashboards` - Dashboards customizados
- ❌ `widgets` - Widgets

### 15. Módulo KPIs/Metas
- ❌ `kpi_metas` - Metas
- ❌ `kpi_realizacoes` - Realizações
- ❌ `kpi_alertas` - Alertas

### 16. Módulo RBAC/Permissões (expandir)
- ❌ `roles` - Papéis
- ❌ `permissions` - Permissões
- ❌ `role_permissions` - Relacionamento
- ❌ `user_roles` - Usuários-roles
- ❌ `permission_groups` - Grupos

### 17. Módulo Relatórios Regulatórios
- ❌ `relatorios_regulatorios` - Relatórios
- ❌ `relatorios_templates` - Templates
- ❌ `relatorios_agendamentos` - Agendamentos

### 18. Módulo Entregas/Logística
- ❌ `entregas` - Entregas
- ❌ `entregas_itens` - Itens entregues
- ❌ `rotas_entrega` - Rotas
- ❌ `rastreamento` - Rastreamento

### 19. Módulo Validações/Cache
- ❌ `validacoes_cache` - Cache validações
- ❌ `validacoes_cfm` - Validações CRM
- ❌ `validacoes_anvisa` - Validações ANVISA

### 20. Módulo Health/Monitoring
- ❌ `system_health_metrics` - Métricas sistema
- ❌ `system_alerts` - Alertas sistema
- ❌ `system_logs` - Logs sistema

### 21. Módulo Pluggy (Integração Bancária)
- ❌ `pluggy_connections` - Conexões
- ❌ `pluggy_accounts` - Contas
- ❌ `pluggy_transactions` - Transações

### 22. Tabelas Auxiliares
- ❌ `profiles` - Perfis de usuário (Supabase Auth)
- ❌ `notificacoes` - Notificações in-app
- ❌ `anexos` - Anexos genéricos
- ❌ `comentarios` - Comentários
- ❌ `tags` - Tags
- ❌ `favoritos` - Favoritos

---

## 📊 RESUMO QUANTITATIVO

| Categoria | Existentes | Faltantes | Total |
|-----------|-----------|-----------|-------|
| Core/Multi-tenant | 4 | 0 | 4 |
| Cadastros | 3 | 2 | 5 |
| Produtos/Estoque | 4 | 10 | 14 |
| Cirurgias | 2 | 6 | 8 |
| Compras | 1 | 5 | 6 |
| Vendas/CRM | 1 | 5 | 6 |
| Financeiro | 2 | 6 | 8 |
| Faturamento | 1 | 5 | 6 |
| Compliance | 0 | 6 | 6 |
| Portais OPME | 0 | 4 | 4 |
| Licitações | 0 | 4 | 4 |
| Chatbot | 0 | 4 | 4 |
| Workflows | 0 | 4 | 4 |
| API Gateway | 0 | 4 | 4 |
| BI/Analytics | 0 | 6 | 6 |
| KPIs | 0 | 3 | 3 |
| RBAC | 0 | 5 | 5 |
| Relatórios Reg. | 0 | 3 | 3 |
| Entregas | 0 | 4 | 4 |
| Validações | 0 | 3 | 3 |
| Health | 0 | 3 | 3 |
| Pluggy | 0 | 3 | 3 |
| Integrações MS365 | 4 | 0 | 4 |
| Auxiliares | 1 | 6 | 7 |
| **TOTAL** | **22** | **~82** | **~104** |

---

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### FASE 1 - Crítico Operacional (10 tabelas)
1. `pacientes`
2. `convenios`
3. `cirurgia_materiais`
4. `cirurgia_eventos`
5. `estoque`
6. `estoque_movimentacoes`
7. `contratos_consignacao`
8. `notas_fiscais`
9. `profiles`
10. `notificacoes`

### FASE 2 - Core Business (20 tabelas)
11-30. Expandir módulos de Compras, Vendas, Financeiro, Faturamento

### FASE 3 - Compliance & Integrações (15 tabelas)
31-45. Compliance, Portais OPME, Licitações

### FASE 4 - Features Avançadas (20 tabelas)
46-65. Chatbot, Workflows, API Gateway, BI

### FASE 5 - Governança & Monitoramento (17 tabelas)
66-82. RBAC, Health, Validações, Relatórios

---

## 🚀 PRÓXIMOS PASSOS

1. **Criar migrations FASE 1** (10 tabelas críticas)
2. **Aplicar e validar**
3. **Ajustar relacionamentos**
4. **Repetir para FASE 2-5**
5. **RLS por último** (após schema completo)

---

**Taxa de Completude Atual:** 22/104 = **21%**  
**Meta Próxima:** 32/104 = **31%** (após FASE 1)

