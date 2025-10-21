# 🎯 Estratégia: Schema Completo pt-BR ANTES de RLS

**Prioridade:** TABELAS → ÍNDICES → VIEWS → FUNCTIONS → RLS (POR ÚLTIMO)

---

## ⚠️ IMPORTANTE: RLS Por Último!

**Motivo:** RLS restringe acesso administrativo. Aplicar agora bloquearia:
- Migrations futuras
- Testes e validações
- Desenvolvimento iterativo
- Acesso via service_role para setup

**Quando aplicar RLS:** Apenas na fase final, quando:
- ✅ TODAS as tabelas estiverem criadas
- ✅ TODOS os módulos implementados
- ✅ Schema validado e estável
- ✅ Testes completos realizados

---

## 📋 Módulos x Tabelas Necessárias (58 Módulos)

### CORE (10 módulos)
1. **Dashboard Principal** → `dashboard_kpis`, `metricas_tempo_real`
2. **Cadastros** → `empresas`, `usuarios`, `perfis`
3. **Cirurgias** → ✅ `cirurgias`, `cirurgia_materiais`, `cirurgia_eventos`
4. **Estoque IA** → `materiais`, `lotes`, `movimentacoes_estoque`, `alertas_estoque`
5. **Financeiro** → `transacoes`, `contas_correntes`, `categorias_financeiras`
6. **Faturamento** → `faturas`, `itens_fatura`, `impostos`
7. **NF-e** → `notas_fiscais`, `xml_nfe`, `eventos_nfe`
8. **Contas Receber** → `titulos_receber`, `baixas`, `renegociacoes`
9. **Rel Financeiros** → `relatorios_configuracoes`
10. **Rel Executivos** → `dashboards_personalizados`

### COMERCIAL (11-20)
11. **CRM** → `leads`, `oportunidades`, `atividades_crm`
12. **Leads** → mesmas tabelas CRM
13. **Relacionamento** → `interacoes_cliente`, `historico_contatos`
14. **Compras** → `pedidos_compra`, `cotacoes`, `aprovacoes`
15. **Compras Internacionais** → `importacoes`, `despachos_aduaneiros`
16. **Notas Compra** → `notas_entrada`, `xml_compra`
17. **Logística** → `rotas`, `entregas`, `rastreamentos`
18. **Transportadoras** → `transportadoras`, `fretes`, `cotacoes_frete`
19. **Consignação** → ✅ `consignacoes`, `itens_consignacao`, `devolucoes`
20. **Rastreabilidade** → `rastreamento_opme`, `anvisa_registros`

### OPERACIONAL (21-30)
21. **Inventário** → `inventarios`, `contagens`, `ajustes_estoque`
22. **Grupos Produtos** → `grupos_opme`, `categorias_opme`
23. **Tabela Preços Viewer** → `tabelas_precos`, `precos_materiais`
24. **Tabela Preços Form** → mesmas tabelas
25. **Portais OPME** → ✅ `portais_opme`, `credenciais_portal`
26. **Alertas Estoque** → `alertas`, `notificacoes`, `regras_alerta`
27. **Contratos** → ✅ `contratos`, `clausulas`, `aditivos`
28. **Compliance** → ✅ `auditorias`, `documentos_compliance`, `certificacoes`
29. **Marketplace** → `produtos_marketplace`, `vendas_marketplace`
30. **Workflows** → ✅ `workflows`, `etapas_workflow`, `execucoes`

### AVANÇADO (31-40)
31. **Licitações** → ✅ `licitacoes`, `propostas`, `documentos_licitacao`
32. **Propostas** → mesmas tabelas
33. **Centro Custos** → `centros_custo`, `alocacoes_custo`
34. **DRE** → `contas_contabeis`, `lancamentos_contabeis`
35. **Conciliação** → `extratos_bancarios`, `conciliacoes`, `divergencias`
36. **Fluxo Caixa** → `previsoes_caixa`, `realizacoes_caixa`
37. **Microsoft 365** → ✅ `integracao_m365`, `sincronizacao_calendar`
38. **Pluggy** → ✅ `pluggy_conexoes`, `pluggy_transacoes`
39. **Chatbot** → ✅ `conversas_chatbot`, `mensagens`, `intents`
40. **BI Analytics** → ✅ `relatorios_bi`, `datasets`, `metricas_calculadas`

### REGULATÓRIOS (41-50)
41. **ANVISA** → `registros_anvisa`, `validacoes_anvisa`
42. **CFM** → ✅ `validacoes_crm`, `cache_cfm`
43. **TISS** → `guias_tiss`, `lotes_tiss`
44. **Rel Regulatórios** → ✅ mesmas tabelas
45. **API Gateway** → ✅ `api_keys`, `rate_limits`, `logs_api`
46. **Webhooks** → `webhooks`, `eventos_webhook`, `tentativas`
47. **Notificações** → ✅ `notificacoes`, `templates_notificacao`
48. **Timeline** → `eventos_timeline`, `historico_mudancas`

### EXTRAS (49-58)
49-58. **Módulos de suporte** → tabelas auxiliares

---

## 📦 Tabelas Já Criadas (Verificar Migrations)

Migrations existentes analisadas:
- ✅ `20251018_initial_schema.sql` - 10 tabelas base
- ✅ `20251019_consignacao_avancada_completo.sql`
- ✅ `20251019_compliance_auditoria_completo.sql`
- ✅ `20251019_contracts_crm.sql`
- ✅ `20251020_workflow_builder.sql`
- ✅ `20251020_licitacoes_propostas.sql`
- ✅ `20251020_microsoft365_integration.sql`
- ✅ `20251020_pluggy_tables.sql`
- ✅ E mais...

Total estimado: **100+ tabelas** já criadas!

---

## 🎯 Próximos Passos CORRETOS

### Fase 1: Inventário Completo (AGORA)
```bash
# Listar TODAS as tabelas já criadas
npm run db:list-tables

# Gerar mapa completo de schema
npm run db:gen:schema-map

# Identificar lacunas
npm run infra:gap-analysis
```

### Fase 2: Completar Tabelas Faltantes
- Criar migrations APENAS para tabelas que não existem
- Manter pt-BR em TUDO
- SEM RLS ainda

### Fase 3: Índices e Performance
- Adicionar índices estratégicos
- Views materializadas
- Functions RPC

### Fase 4: Validação Total
- Testes de integridade
- Validação de relacionamentos
- Performance benchmarks

### Fase 5: RLS (FINAL)
- Apenas quando tudo estiver 100% pronto
- Aplicar policies de forma incremental
- Testar cada policy individualmente

---

## 🚫 O Que NÃO Fazer Agora

- ❌ NÃO aplicar RLS policies
- ❌ NÃO habilitar RLS nas tabelas
- ❌ NÃO restringir service_role
- ❌ NÃO criar policies de acesso

---

## ✅ Foco Imediato

1. **Mapear schema atual completo**
2. **Identificar gaps** (tabelas faltantes)
3. **Criar migrations** apenas para o que falta
4. **Validar nomenclatura pt-BR** em tudo
5. **Documentar relacionamentos**

