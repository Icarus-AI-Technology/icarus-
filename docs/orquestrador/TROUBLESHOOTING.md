# 🔧 SOLUÇÃO DE PROBLEMAS - Setup Orquestrador v2.0

**Data:** 20 de outubro de 2025

---

## ❌ Problemas Encontrados

1. **Erro de permissão ao instalar PM2 globalmente**
2. **Servidor preview não rodando antes da captura**
3. **PM2 não encontrado após instalação**

---

## ✅ SOLUÇÕES

### Opção 1: Instalar PM2 com sudo (Recomendado)

```bash
# Instalar PM2 globalmente com permissões
sudo npm install -g pm2

# Verificar instalação
pm2 --version
```

### Opção 2: Instalar PM2 localmente (Sem sudo)

```bash
# Adicionar PM2 como dependência do projeto
npm install --save-dev pm2

# Usar via npx (não precisa estar global)
npx pm2 --version
```

Se escolher Opção 2, ajustar scripts no `package.json`:
```json
{
  "scripts": {
    "preview:setup": "npx pm2 start ecosystem.preview.config.js",
    "preview:stop": "npx pm2 stop ecosystem.preview.config.js",
    "preview:restart": "npx pm2 restart ecosystem.preview.config.js",
    "preview:logs": "npx pm2 logs icarus-preview-capture",
    "preview:logs:server": "npx pm2 logs icarus-preview-server",
    "preview:monit": "npx pm2 monit",
    "preview:delete": "npx pm2 delete ecosystem.preview.config.js"
  }
}
```

---

## 🚀 EXECUÇÃO CORRIGIDA

### Passo 1: Instalar PM2

**Com sudo:**
```bash
sudo npm install -g pm2
```

**OU sem sudo (local):**
```bash
npm install --save-dev pm2
```

### Passo 2: Instalar Playwright

```bash
npx playwright install chromium
```

### Passo 3: Build do projeto

```bash
npm run build
```

### Passo 4: Iniciar servidor preview (IMPORTANTE!)

**Em um terminal separado**, manter rodando:
```bash
npm run preview:start
```

**OU em background:**
```bash
npm run preview:start &
```

**Aguardar 5 segundos** para o servidor iniciar.

### Passo 5: Executar captura (em outro terminal)

```bash
npm run preview:capture
```

### Passo 6: Validar screenshots

```bash
ls -la docs/design/prints/
```

Deve mostrar **30 arquivos PNG** (15 light + 15 dark).

---

## 🎯 ALTERNATIVA: Setup Manual (SEM PM2)

Se não quiser usar PM2, pode executar manualmente:

### Terminal 1: Servidor Preview
```bash
npm run preview:start
```

### Terminal 2: Captura Manual
```bash
# Aguardar servidor iniciar (5s)
sleep 5

# Executar captura
npm run preview:capture
```

### Agendar Capturas (macOS)

**Opção A: Usar cron**
```bash
# Editar crontab
crontab -e

# Adicionar linha (captura a cada 20 min)
*/20 * * * * cd /Users/daxmeneghel/icarus-make && npm run preview:capture
```

**Opção B: Usar launchd (macOS nativo)**

Criar arquivo: `~/Library/LaunchAgents/com.icarus.preview-capture.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.icarus.preview-capture</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd /Users/daxmeneghel/icarus-make && npm run preview:capture</string>
    </array>
    <key>StartInterval</key>
    <integer>1200</integer> <!-- 20 minutos = 1200 segundos -->
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/daxmeneghel/icarus-make/logs/preview-capture-out.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/daxmeneghel/icarus-make/logs/preview-capture-error.log</string>
</dict>
</plist>
```

Ativar:
```bash
launchctl load ~/Library/LaunchAgents/com.icarus.preview-capture.plist
```

---

## 📝 QUICK START CORRIGIDO

```bash
# 1. Instalar PM2 (escolher uma opção)
sudo npm install -g pm2              # Opção 1: Global
# OU
npm install --save-dev pm2           # Opção 2: Local

# 2. Instalar Playwright
npx playwright install chromium

# 3. Build
npm run build

# 4. Iniciar servidor preview (deixar rodando)
npm run preview:start &

# 5. Aguardar servidor iniciar
sleep 5

# 6. Executar captura
npm run preview:capture

# 7. Validar
ls -la docs/design/prints/

# 8. (Opcional) Setup PM2 para agendamento automático
npm run preview:setup
pm2 list
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após executar, verificar:

- [ ] Build gerado em `dist/`
- [ ] Servidor preview rodando na porta 4173
- [ ] Captura executada sem erros
- [ ] 30 screenshots em `docs/design/prints/`
- [ ] Relatório JSON em `docs/design/previews/`
- [ ] PM2 mostrando processos (se usar PM2)

---

## 🔍 TROUBLESHOOTING

### Problema: "fetch failed"
**Causa:** Servidor preview não está rodando  
**Solução:** Iniciar `npm run preview:start` antes da captura

### Problema: "pm2: command not found"
**Causa:** PM2 não instalado ou sem permissões  
**Solução:** Usar `sudo npm install -g pm2` ou `npx pm2`

### Problema: "EACCES permission denied"
**Causa:** Sem permissão para instalar globalmente  
**Solução:** Usar `sudo` ou instalar localmente

### Problema: "Playwright chromium not found"
**Causa:** Navegador não instalado  
**Solução:** `npx playwright install chromium`

---

## 📊 RESULTADO ESPERADO

```
ℹ️  🚀 Iniciando captura de previews...
✅ Servidor preview ativo: http://localhost:4173
✅ Diretório de saída: /path/to/docs/design/prints
ℹ️  🌐 Iniciando navegador Chromium...
ℹ️  Capturando: Página de boas-vindas (light)
✅ Salvo: welcome-light.png
ℹ️  Capturando: Página de boas-vindas (dark)
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

---

**Status:** 🔧 GUIA DE SOLUÇÃO DE PROBLEMAS  
**Última atualização:** 20 de outubro de 2025

