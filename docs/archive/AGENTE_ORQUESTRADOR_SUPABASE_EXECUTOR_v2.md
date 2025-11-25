
# 🧭 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR — ICARUS v5.0 (v2)

**Atualização 2025-10-20**  
Incluídas diretrizes **prioritárias** sobre ordem de implantação e **previews automáticos** para validação visual contínua.

---

## 📌 Diretriz Nova #1 — Autenticação é a **última etapa**
- **Login/Autenticação de usuários ficam por último** no cronograma.  
- Durante desenvolvimento e validação visual, o agente **não ativa fluxos de login** nem bloqueios de rota.  
- **Mocks/Stubs de sessão** podem ser usados (ex.: `__DEV_SESSION__`) somente para liberar telas e dados mocados **sem alterar regras de negócio**.
- Quando chegar a fase de auth: habilitar **Supabase Auth**, `profiles`, RLS com *claims* e flows definitivos (email/pass, magic link, SSO se aplicável), **após** todo o front estar validado.

### Regras de compatibilidade durante o período “sem login”
- Endpoints/Views expostos com **escopo de leitura** (dados não sensíveis) e/ou **mocks**.  
- RLS ativa apenas em tabelas sensíveis; rotas do preview usam **dados de demonstração**.  
- Qualquer *feature flag* de “auth requerida” deve estar **desligada** até a etapa final.

---

## 📌 Diretriz Nova #2 — **Previews Automáticos** para validação visual
O Orquestrador deve garantir **previews frequentes** (light/dark) para todas as ferramentas e módulos principais, **sem conflitar** com o AGENTE_DESIGNER_NEUMORPHIC_PREVIEW.

### Objetivos
- **Validação contínua 1:1** com Figma Make (Neumorphism 3D premium, shadcn + OraclusX DS).  
- **Evidências visuais** por rota crítica (Dashboard, Cirurgias, Consignação, etc.).  
- Detectar regressões visuais cedo (tipografia, cores, sombras, layout, responsividade).

### Implementação sugerida
1. **Scripts** (no `package.json` do projeto):  
   ```jsonc
   {
     "scripts": {
       "preview:start": "vite preview --host --port 5173",
       "preview:capture": "node tools/design/capture-previews.js"
     }
   }
   ```
2. **Captura de prints** (`tools/design/capture-previews.js`) — usar Playwright/Puppeteer:
   - Rotas: `/`, `/dashboard`, `/cirurgias`, `/consignacao`, páginas de componentes DS.  
   - Temas: `light` e `dark`.  
   - Salvar em: `docs/design/prints/{rota}-{tema}.png`.
3. **Agendamento** com **PM2** ou cron (local):
   ```js
   // ecosystem.preview.js
   module.exports = {
     apps: [
       { name: "icarus-web-preview", script: "npm", args: "run preview:start" },
       { name: "icarus-preview-capture", script: "npm", args: "run preview:capture", cron_restart: "*/20 * * * *" }
     ]
   }
   ```
   > `cron_restart` a cada **20 minutos** (ajuste conforme necessidade). O preview deve estar ativo antes do `capture`.

4. **Artefatos**:
   - `docs/design/preview-url.md` — URL em uso (ex.: `http://localhost:5173`).  
   - `docs/design/prints/*.png` — prints por rota/tema.  
   - `docs/design/figma-to-code-map.md` — mapeamento Frame → Path atualizado.

### Regras anti-conflito
- O Orquestrador **não altera** estilos/componentes do DS; apenas orquestra preview/capturas.  
- Se o preview já estiver sob gestão do AGENTE_DESIGNER_NEUMORPHIC_PREVIEW, este agente **apenas agenda e coleta evidências**.

---

## 🧩 Lembrete de Escopo (inalterado)
- **Banco/Infra (Supabase)**: schemas, tabelas, views, RPC, RLS, Storage, Realtime, Edge, Jobs, Observabilidade.  
- **Segurança**: RLS por `empresa_id`, RBAC por módulo, policies explícitas.  
- **OSS/baixo custo**: Meilisearch, Tesseract, Ollama, FCM, Resend/SES, BullMQ, Sentry, PostHog.  
- **Contratos Frontend**: `database.types.ts`, views materializadas para KPIs, *feature flags*.

---

## ✅ Critérios de Aceite (com as novas diretrizes)
- [ ] **Previews automáticos** ativos (PM2/cron) e prints light/dark por rota-chave.  
- [ ] **Auth somente ao final**: nenhum bloqueio de login no período de validação visual.  
- [ ] **Sem conflitos** com o AGENTE_DESIGNER_NEUMORPHIC_PREVIEW.  
- [ ] Health-checks e relatórios em `docs/infra/*` e `docs/design/*` atualizados.  
- [ ] RLS/Policies adequadas já planejadas, mas **ativação final** após validação de UI.

---

## ⚙️ Intents (Ações Rápidas) — atualizadas
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"agendarPreviews","params":{"cron":"*/20 * * * *"}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"registrarPreviewURL","params":{"url":"http://localhost:5173"}} }
```
```json
{ "source":"system", "intent":{"openModule":"orquestrador-supabase","action":"adiarAuth","params":{"fase":"final"}} }
```

> Esta versão mantém todo o escopo do agente original e **acrescenta** as duas regras estratégicas: **(1)** auth por último e **(2)** previews automáticos para validação visual contínua.
