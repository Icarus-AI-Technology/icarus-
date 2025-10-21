# 📚 ÍNDICE - AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v2.0

**ICARUS v5.0**  
**Data:** 20 de outubro de 2025  
**Status:** ✅ ATIVO

---

## 📋 Documentação Completa

### 🎯 Documentos Principais

1. **[README_ORQUESTRADOR_V2.md](./README_ORQUESTRADOR_V2.md)**
   - Visão geral do Orquestrador v2.0
   - Quick Start
   - Scripts e comandos
   - Checklist de implementação

2. **[DIRETRIZ_AUTENTICACAO_FINAL.md](./DIRETRIZ_AUTENTICACAO_FINAL.md)**
   - Princípio: Auth é a ÚLTIMA etapa
   - Estratégias de implementação
   - Mocks de sessão
   - Feature flags
   - Cronograma de ativação
   - Anti-patterns

3. **[DIRETRIZ_PREVIEWS_AUTOMATICOS.md](./DIRETRIZ_PREVIEWS_AUTOMATICOS.md)**
   - Capturas automáticas light/dark
   - Configuração PM2
   - Rotas críticas
   - Comparação com Figma
   - Integração CI/CD

4. **[CONFIG_FEATURE_FLAGS.md](./CONFIG_FEATURE_FLAGS.md)**
   - Variáveis de ambiente
   - Implementação de feature flags
   - Hooks de autenticação com bypass
   - Protected routes
   - Testes

---

## 🛠️ Arquivos de Implementação

### Scripts e Ferramentas

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `tools/design/capture-previews.js` | Script de captura de screenshots | ✅ Criado |
| `ecosystem.preview.config.js` | Configuração PM2 | ✅ Criado |
| `.env.development.example` | Variáveis de ambiente (dev) | ✅ Criado |
| `.env.production.example` | Variáveis de ambiente (prod) | ✅ Criado |

### Implementação TypeScript (A Criar)

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `src/config/features.ts` | Feature flags | ⏳ Documentado |
| `src/lib/dev-session.ts` | Mock de sessão dev | ⏳ Documentado |
| `src/hooks/useAuth.ts` | Hook de auth com bypass | ⏳ Documentado |
| `src/components/ProtectedRoute.tsx` | Rota protegida | ⏳ Documentado |

---

## 📂 Estrutura de Artefatos

```
docs/
└── orquestrador/
    ├── INDEX.md                              # ← Este arquivo
    ├── README_ORQUESTRADOR_V2.md             # Visão geral
    ├── DIRETRIZ_AUTENTICACAO_FINAL.md        # Diretriz #1
    ├── DIRETRIZ_PREVIEWS_AUTOMATICOS.md      # Diretriz #2
    └── CONFIG_FEATURE_FLAGS.md               # Feature flags

tools/
└── design/
    └── capture-previews.js                   # Script de captura

ecosystem.preview.config.js                   # Config PM2

.env.development.example                      # Env dev (auth OFF)
.env.production.example                       # Env prod (auth ON)

src/
├── config/
│   └── features.ts                           # Feature flags (A Criar)
├── lib/
│   └── dev-session.ts                        # Mock sessão (A Criar)
├── hooks/
│   └── useAuth.ts                            # Hook auth (A Criar)
└── components/
    └── ProtectedRoute.tsx                    # Rota protegida (A Criar)
```

---

## 🚀 Ordem de Leitura Recomendada

### Para Desenvolvedores

1. **README_ORQUESTRADOR_V2.md** - Começar aqui
2. **CONFIG_FEATURE_FLAGS.md** - Entender feature flags
3. **DIRETRIZ_AUTENTICACAO_FINAL.md** - Entender estratégia de auth
4. **DIRETRIZ_PREVIEWS_AUTOMATICOS.md** - Configurar previews

### Para Gestores/POs

1. **README_ORQUESTRADOR_V2.md** - Visão geral
2. **DIRETRIZ_AUTENTICACAO_FINAL.md** - Cronograma e justificativa
3. **DIRETRIZ_PREVIEWS_AUTOMATICOS.md** - Validação visual contínua

### Para Designers

1. **DIRETRIZ_PREVIEWS_AUTOMATICOS.md** - Capturas automáticas
2. **README_ORQUESTRADOR_V2.md** - Scripts de preview

---

## ✅ Checklist Geral de Implementação

### Fase 1: Setup Inicial (30 min)
- [x] Documentação criada
- [x] Scripts de preview criados
- [x] Configuração PM2 criada
- [x] Exemplos de .env criados
- [ ] PM2 instalado globalmente
- [ ] Playwright instalado
- [ ] Diretórios criados (`logs/`, `docs/design/prints/`)

### Fase 2: Feature Flags (1-2h)
- [ ] Criar `src/config/features.ts`
- [ ] Criar `src/lib/dev-session.ts`
- [ ] Criar `src/hooks/useAuth.ts`
- [ ] Criar `src/components/ProtectedRoute.tsx`
- [ ] Copiar `.env.development.example` → `.env`
- [ ] Configurar variáveis Supabase
- [ ] Testar bypass de auth em dev

### Fase 3: Previews Automáticos (30 min)
- [ ] Build do projeto (`npm run build`)
- [ ] Iniciar preview (`npm run preview:setup`)
- [ ] Executar captura manual (`npm run preview:capture`)
- [ ] Verificar 30 screenshots gerados
- [ ] Verificar relatório JSON
- [ ] Validar capturas a cada 20 min

### Fase 4: Validação Visual (Contínuo)
- [ ] Comparar screenshots com Figma
- [ ] Identificar gaps visuais
- [ ] Ajustar componentes (Designer)
- [ ] Re-capturar e validar
- [ ] Aprovar fidelidade visual 92%+

### Fase 5: Ativação de Auth (Final - 6-10 semanas)
- [ ] Validação visual 100% completa
- [ ] Stakeholders aprovaram
- [ ] Configurar Supabase Auth
- [ ] Criar migrations de auth
- [ ] Ativar RLS completo
- [ ] Implementar RBAC
- [ ] Copiar `.env.production.example` → `.env`
- [ ] Definir `VITE_AUTH_REQUIRED=true`
- [ ] Testar fluxos de login/logout
- [ ] Deploy em produção

---

## 🔗 Links Relacionados

### Documentação Externa
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Playwright](https://playwright.dev/)
- [PM2](https://pm2.keymetrics.io/)
- [Vite Preview](https://vitejs.dev/guide/cli#vite-preview)

### Documentação Interna
- `docs/design/preview-url.md` - URLs de acesso
- `docs/design/figma-to-code-map.md` - Mapeamento Figma → Código
- `docs/PLANEJAMENTO_AUTENTICACAO.md` - Plano detalhado de auth

---

## 📊 Métricas de Sucesso

- ✅ **2 diretrizes prioritárias** documentadas
- ✅ **4 documentos principais** criados
- ✅ **Scripts de preview** implementados
- ✅ **Feature flags** documentadas
- ⏳ **30 screenshots** por execução (após setup)
- ⏳ **Capturas a cada 20 min** (após setup)
- ⏳ **Auth desligada** até validação visual completa
- ⏳ **Fidelidade visual 92%+** com Figma

---

## 🎯 Próximos Passos Imediatos

1. **Instalar dependências:**
   ```bash
   npm install -g pm2
   npx playwright install chromium
   ```

2. **Criar diretórios:**
   ```bash
   mkdir -p logs docs/design/prints docs/design/previews
   ```

3. **Configurar ambiente:**
   ```bash
   cp .env.development.example .env
   # Editar .env com valores reais do Supabase
   ```

4. **Iniciar previews:**
   ```bash
   npm run build
   npm run preview:setup
   npm run preview:capture  # Primeira captura manual
   ```

5. **Verificar:**
   ```bash
   pm2 list  # Verificar processos
   pm2 logs  # Ver logs
   ls -la docs/design/prints/  # Verificar screenshots
   ```

---

**Status:** ✅ DOCUMENTAÇÃO COMPLETA  
**Próximo:** Executar setup inicial e implementar feature flags

---

> **"Valide a experiência do usuário primeiro, proteja depois."**  
> **"Validação visual contínua é a ponte entre design e código."**

