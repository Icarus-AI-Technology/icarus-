# Playbook de Auditoria Supabase (ICARUS v5.0)

## 1. Preparar variáveis de ambiente

Exportar no shell antes de rodar os scripts:

```bash
export SUPABASE_URL="https://<sua-instancia>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

## 2. Rodar auditorias locais

```bash
node scripts/supabase/audit-schema.ts
node scripts/supabase/edge-health.ts
node scripts/supabase/realtime-check.ts
node scripts/supabase/crud-sanity.ts
```

Os relatórios serão gravados em `.cursor/reports/supabase/*.json`. Em caso de falha as mensagens de erro indicam quais tabelas/RPCs/buckets precisam de correção.

## 3. Validar políticas RLS em staging

1. Aplicar `scripts/supabase/rls_policies.sql` em um banco de staging.
2. Autenticar com usuários reais (admin + operador) e testar:
   - CRUD completo em `cirurgias`, `consignacao_materiais`, `contas_receber`.
   - Consulta e update em `estoque`, `produtos`, `compliance_requisitos`, `nao_conformidades`, `acoes_corretivas`.
3. Confirmar que usuários de outra empresa NÃO enxergam dados cruzados.
4. Somente após validação aplicar em produção.

## 4. Monitorar Edge Functions/Reatime

- Se `edge-health.ts` apontar falhas, verificar deploy e secrets das funções listadas.
- `realtime-check.ts` reporta problemas de assinatura; revisar roles e Realtime Server.

## 5. Configurar GitHub Actions

1. No repositório > Settings > Secrets and variables > Actions, cadastrar:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. O workflow `Supabase Audit & Health` ( `.github/workflows/supabase-audit.yml`) já usa esses segredos.
3. Após cada execução baixar o artefato `supabase-reports` e anexar ao dossiê de conformidade.

## 6. Revisar alertas do painel Supabase

- Views com `SECURITY DEFINER`: validar se precisam rodar com privilégio elevado ou substituir por policies.
- Consultas lentas: usar explain/analise e adicionar índices conforme necessário.

## 7. Checklist pós-execução

- ✅ Relatórios salvos em `.cursor/reports/supabase`.
- ✅ Logs das funções Edge sem erros.
- ✅ Policies testadas e aprovadas.
- ✅ Workflow executando com artefatos anexados.
- ✅ Alertas de segurança/performance mitigados.
