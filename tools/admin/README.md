# Admin Bootstrap Tools

Scripts utilitários para garantir a existência do usuário admin e propagar `usuario_id` em todas as tabelas.

Comandos:

```bash
npm run admin:create:curl
npm run admin:bootstrap
npm run admin:sql:propagar
npm run admin:recover
```

Requisitos de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`/`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`/`SUPABASE_DB_URL`.


