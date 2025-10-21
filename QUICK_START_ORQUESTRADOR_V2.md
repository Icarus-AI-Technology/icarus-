# 🚀 QUICK START - Orquestrador Supabase v2.0

**ICARUS v5.0** | **Data:** 20 de outubro de 2025

---

## ⚡ Setup em 5 Minutos

### 1. Instalar Dependências
```bash
npm install -g pm2
npx playwright install chromium
```

### 2. Configurar Supabase
```bash
# Editar .env.development
nano .env.development

# Substituir:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Build & Iniciar
```bash
npm run build
npm run preview:setup
```

### 4. Primeira Captura
```bash
npm run preview:capture
```

### 5. Validar
```bash
pm2 list
ls -la docs/design/prints/
```

---

## 📋 Comandos Essenciais

| Comando | Descrição |
|---------|-----------|
| `npm run preview:setup` | Iniciar tudo |
| `npm run preview:stop` | Parar tudo |
| `npm run preview:logs` | Ver logs |
| `npm run preview:monit` | Monitorar |
| `npm run preview:capture` | Captura manual |

---

## 📚 Documentação

- **Índice:** `docs/orquestrador/INDEX.md`
- **Visão Geral:** `docs/orquestrador/README_ORQUESTRADOR_V2.md`
- **Resumo Executivo:** `AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR_v2_COMPLETO.md`

---

## ✅ Resultado Esperado

```
✅ 30 screenshots capturados
✅ Relatório JSON gerado
✅ Capturas a cada 20 minutos
✅ Auth desligada (dev mode)
```

---

**Status:** 🚀 PRONTO PARA EXECUÇÃO
