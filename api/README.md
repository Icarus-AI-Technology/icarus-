# Contratos de API

- Gateway central documenta endpoints REST/Realtime_GQL.
- Schemas e exemplos ficam em `docs/api/*.md`; sempre atualizar ao alterar handlers.
- Requests devem validar input com Zod; responses padronizadas (`data`, `meta`, `errors`).
- Integrações externas devem expor health-check em `/api/integrations/<nome>/health`.

