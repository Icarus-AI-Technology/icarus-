# 🚀 ICARUS v5.0 - Orquestrador Supabase v2.0

**Status:** ✅ ATIVO  
**Versão:** 2.0.0  
**Data:** 20 de outubro de 2025

---

## 📌 Novas Diretrizes Prioritárias

### 1️⃣ Autenticação é a ÚLTIMA Etapa
Durante desenvolvimento e validação visual, **NÃO ativar**:
- ✋ Fluxos de login obrigatório
- ✋ Bloqueios de rotas
- ✋ Guards de segurança
- ✋ RLS completo (apenas leitura de dados demo)

**Documentação:** `docs/orquestrador/DIRETRIZ_AUTENTICACAO_FINAL.md`

### 2️⃣ Previews Automáticos para Validação Visual
Capturas automáticas light/dark de todas as rotas críticas:
- ✅ Screenshots a cada 20 minutos
- ✅ Comparação com Figma Make
- ✅ Detecção precoce de regressões visuais
- ✅ Documentação visual do progresso

**Documentação:** `docs/orquestrador/DIRETRIZ_PREVIEWS_AUTOMATICOS.md`

---

## 🛠️ Ferramentas Implementadas

### Scripts de Preview

```bash
# Iniciar servidor de preview
npm run preview:start

# Captura manual de screenshots
npm run preview:capture

# Configurar previews automáticos (PM2)
npm run preview:setup

# Parar previews automáticos
npm run preview:stop

# Ver logs de captura
npm run preview:logs

# Ver logs do servidor
npm run preview:logs:server

# Monitoramento interativo
npm run preview:monit

# Reiniciar processos
npm run preview:restart

# Remover processos PM2
npm run preview:delete
```

### Estrutura de Artefatos

```
docs/
├── design/
│   ├── preview-url.md              # URLs de acesso
│   ├── figma-to-code-map.md        # Mapeamento Frame → Path
│   ├── prints/                     # Screenshots (30 arquivos)
│   │   ├── welcome-light.png
│   │   ├── welcome-dark.png
│   │   ├── dashboard-light.png
│   │   ├── dashboard-dark.png
│   │   └── ...
│   └── previews/                   # Relatórios JSON
│       └── capture-report-*.json
└── orquestrador/
    ├── DIRETRIZ_AUTENTICACAO_FINAL.md
    └── DIRETRIZ_PREVIEWS_AUTOMATICOS.md

tools/
└── design/
    └── capture-previews.js         # Script de captura

ecosystem.preview.config.js         # Config PM2
```

---

## 🎯 Rotas Críticas Capturadas

1. Welcome (`/`)
2. Dashboard (`/dashboard`)
3. Cirurgias (`/cirurgias`)
4. Consignação (`/consignacao`)
5. Estoque (`/estoque`)
6. Financeiro (`/financeiro`)
7. Cadastros (`/cadastros`)
8. Compras (`/compras`)
9. Contratos (`/contratos`)
10. Vendas (`/vendas`)
11. Compliance (`/compliance`)
12. Rastreabilidade (`/rastreabilidade`)
13. Analytics (`/analytics`)
14. Logística (`/logistica`)
15. IA Central (`/ia-central`)

**Total:** 15 rotas × 2 temas = **30 screenshots por execução**

---

## 🚀 Quick Start

### 1. Setup Inicial (uma vez)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Instalar Playwright (se não estiver)
npx playwright install chromium

# Criar diretórios
mkdir -p logs docs/design/prints docs/design/previews
```

### 2. Iniciar Previews Automáticos

```bash
# Build do projeto
npm run build

# Iniciar preview + capturas agendadas
npm run preview:setup

# Verificar status
pm2 list
```

Resultado esperado:
```
┌─────┬──────────────────────────────┬─────────┬─────────┐
│ id  │ name                         │ status  │ uptime  │
├─────┼──────────────────────────────┼─────────┼─────────┤
│ 0   │ icarus-preview-server        │ online  │ 2m      │
│ 1   │ icarus-preview-capture       │ waiting │ 0       │
└─────┴──────────────────────────────┴─────────┴─────────┘
```

### 3. Primeira Captura Manual

```bash
# Executar captura imediatamente (sem aguardar cron)
npm run preview:capture
```

Saída esperada:
```
ℹ️  🚀 Iniciando captura de previews...
✅ Servidor preview ativo: http://localhost:4173
✅ Diretório de saída: /path/to/docs/design/prints
ℹ️  🌐 Iniciando navegador Chromium...
✅ Salvo: welcome-light.png
✅ Salvo: welcome-dark.png
...
ℹ️  📊 RELATÓRIO DE CAPTURA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 30
✅ Sucesso: 30
❌ Falhas: 0
⏱️  Tempo: 42.18s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Relatório salvo: capture-report-2025-10-20T14-00-00.json
```

### 4. Monitorar Capturas Automáticas

```bash
# Ver logs em tempo real
npm run preview:logs

# Ou monitoramento interativo
npm run preview:monit
```

---

## 📊 Configurações Avançadas

### Ajustar Cronograma de Capturas

Editar `ecosystem.preview.config.js`, linha ~40:

```javascript
cron_restart: '*/20 * * * *', // A cada 20 minutos
```

Exemplos:
- A cada 10 min: `'*/10 * * * *'`
- A cada 30 min: `'*/30 * * * *'`
- A cada 1 hora: `'0 * * * *'`
- Diariamente às 9h: `'0 9 * * *'`

Após alterar:
```bash
npm run preview:restart
```

### Alterar URL do Preview

```bash
# Definir variável de ambiente
export PREVIEW_URL="http://192.168.1.100:4173"

# Reiniciar captura
npm run preview:restart
```

### Adicionar Novas Rotas

Editar `tools/design/capture-previews.js`, linha ~32:

```javascript
routes: [
  // ... rotas existentes
  { path: '/nova-rota', name: 'nova-rota', description: 'Nova Rota' },
]
```

---

## 🔍 Verificação de Integridade

### Checar Screenshots Gerados

```bash
# Listar prints com timestamp
ls -lth docs/design/prints/

# Contar screenshots (deve ter 30)
ls -1 docs/design/prints/*.png | wc -l
```

### Analisar Último Relatório

```bash
# Ver resumo
cat $(ls -t docs/design/previews/capture-report-*.json | head -1) | \
  jq '.summary'

# Identificar falhas (se houver)
cat $(ls -t docs/design/previews/capture-report-*.json | head -1) | \
  jq '.results[] | select(.success == false)'
```

---

## 🎨 Comparação com Figma

### Processo Manual

1. **Abrir Figma**: [Link do projeto]
2. **Selecionar Frame**: Ex: "Dashboard - Light Mode"
3. **Exportar PNG**: 2x scale
4. **Comparar lado a lado**:
   ```bash
   open docs/design/prints/dashboard-light.png
   open ~/Downloads/figma-dashboard-light.png
   ```

### Ferramentas Automatizadas (Opcional)

- **Percy**: Comparação visual em CI/CD (pago)
- **Playwright Visual**: Regressão visual automática (gratuito)
- **Pixelmatch**: Diff pixel-a-pixel em Node.js (gratuito)

---

## 🚫 Regras Anti-Conflito

### COM AGENTE_DESIGNER_NEUMORPHIC_PREVIEW

| Responsabilidade | Orquestrador | Designer |
|------------------|--------------|----------|
| Gerenciar servidor de preview | ✅ | ❌ |
| Agendar capturas automáticas | ✅ | ❌ |
| Alterar estilos/componentes DS | ❌ | ✅ |
| Implementar componentes visuais | ❌ | ✅ |
| Validar fidelidade Figma | Coleta evidências | Analisa e ajusta |

**Regra de ouro:**
> O Orquestrador **não toca** em código visual. O Designer **não gerencia** infraestrutura de preview.

---

## ✅ Checklist de Implementação

### Setup Inicial
- [x] Script `capture-previews.js` criado
- [x] Config PM2 `ecosystem.preview.config.js` criado
- [x] Scripts adicionados ao `package.json`
- [x] Documentação de diretrizes criada
- [ ] PM2 instalado globalmente
- [ ] Playwright instalado (`npx playwright install chromium`)
- [ ] Diretórios criados (`logs/`, `docs/design/prints/`, etc.)

### Ativação
- [ ] Build do projeto (`npm run build`)
- [ ] Previews iniciados (`npm run preview:setup`)
- [ ] Primeira captura executada (`npm run preview:capture`)
- [ ] Screenshots verificados (30 arquivos)
- [ ] Relatório JSON gerado
- [ ] PM2 status verificado (`pm2 list`)

### Validação
- [ ] Capturas automáticas a cada 20 min
- [ ] Temas light/dark funcionando
- [ ] Todas as rotas capturadas com sucesso
- [ ] Comparação manual com Figma realizada
- [ ] Logs PM2 verificados sem erros
- [ ] Designer notificado dos prints disponíveis

---

## 📚 Documentação Completa

- **Autenticação:** `docs/orquestrador/DIRETRIZ_AUTENTICACAO_FINAL.md`
- **Previews:** `docs/orquestrador/DIRETRIZ_PREVIEWS_AUTOMATICOS.md`
- **Mapeamento Figma:** `docs/design/figma-to-code-map.md`
- **URLs de Acesso:** `docs/design/preview-url.md`

---

## 🔗 Intents (Ações Rápidas)

### Agendar Previews
```json
{
  "source": "system",
  "intent": {
    "openModule": "orquestrador-supabase",
    "action": "agendarPreviews",
    "params": { "cron": "*/20 * * * *" }
  }
}
```

### Registrar Preview URL
```json
{
  "source": "system",
  "intent": {
    "openModule": "orquestrador-supabase",
    "action": "registrarPreviewURL",
    "params": { "url": "http://localhost:4173" }
  }
}
```

### Adiar Autenticação
```json
{
  "source": "system",
  "intent": {
    "openModule": "orquestrador-supabase",
    "action": "adiarAuth",
    "params": { "fase": "final" }
  }
}
```

---

## 📈 Métricas de Sucesso

- ✅ **30 screenshots** capturados por execução
- ✅ **100% das rotas críticas** cobertas
- ✅ **2 temas** (light/dark) validados
- ✅ **Capturas a cada 20 min** sem falhas
- ✅ **Fidelidade visual 92%+** com Figma
- ✅ **Zero bloqueios de auth** durante validação

---

**Status:** ✅ INFRAESTRUTURA PRONTA  
**Próximos Passos:** Executar `npm run preview:setup` e iniciar validação visual

---

> **"Valide a experiência do usuário primeiro, proteja depois."**  
> **"Validação visual contínua é a ponte entre design e código."**

