# AGENTE_BOOTSTRAP_ADMIN_AUTOMATIZADOR — ICARUS v5.0

Perfil: Engenheiro de Plataforma (20+ anos) — Supabase/Postgres, Node, DevOps (PM2), MCP Cursor.

Missão: Garantir que o usuário admin (Dax Meneghel) exista e que todas as tabelas públicas tenham a coluna `usuario_id` (FK `auth.users(id)`) preenchida. A rotina executa automaticamente via MCP/Supabase.

---

## Entradas & Requisitos
- Variáveis de ambiente já configuradas no host:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE` (ou `SUPABASE_SERVICE_ROLE_KEY`), `DATABASE_URL` (ou `SUPABASE_DB_URL`)
  - Opcionais: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
- MCP do Supabase habilitado para chamadas remotas.

---

## Artefatos
- `tools/admin/create-admin.curl.sh` — cria/busca admin via Admin API
- `tools/admin/bootstrap-admin.mjs` — cria/obtém admin e propaga `usuario_id` + FK em todas as tabelas
- `tools/db/propagar_usuario_id_admin.sql` — fallback SQL puro (idempotente)
- `ecosystem.icarus-admin.config.cjs` — serviço PM2
- Scripts NPM adicionados em `package.json`

---

## Rotina Automática (ordem de execução)
1. Admin API (cURL) → `npm run admin:create:curl`
2. Node Bootstrap → `npm run admin:bootstrap`
3. SQL Fallback → `npm run admin:sql:propagar`
4. QA rápido → `npm run qa:integrations` (se existir)

Atalho:
- `npm run admin:recover` executa 1 → 2 → 3 automaticamente
- `npm run admin:all` inclui QA quando disponível

---

## PM2 (execução contínua / recuperação)
Arquivo: `ecosystem.icarus-admin.config.cjs`

Comandos:
```bash
pm2 start ecosystem.icarus-admin.config.cjs
pm2 logs icarus-admin-bootstrap
pm2 restart icarus-admin-bootstrap
pm2 save
```

O processo garante que o admin exista e que `usuario_id`/FK estejam corretos em ciclos controlados (reinício automático em falha).

---

## Política de Segurança
- Service Role nunca deve ser commitado.
- Executar em host seguro; rotacionar senha do admin em produção.

---

## Critérios de Aceite
- Usuário admin presente em `auth.users` (`dax@newortho.com.br` por padrão).
- Todas as tabelas públicas com coluna `usuario_id uuid`.
- Backfill feito (`usuario_id` não-nulo em registros existentes).
- FK presente: `FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL`.
- Logs do PM2 sem erros e `admin:all` finaliza sem falhas.

---

## RLS
Implementações de RLS devem ser executadas por último, após o backfill e validações.

---

## Passos manuais (se necessário)
```bash
# 1) Garantir envs (exemplo)
export SUPABASE_URL=https://ttswvavcisdnonytslom.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=...
export DATABASE_URL=postgresql://postgres:*****@db.ttswvavcisdnonytslom.supabase.co:5432/postgres

# 2) Rodar sequência completa
npm run admin:recover
npm run admin:all
```


