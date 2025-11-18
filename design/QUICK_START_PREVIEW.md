# 🚀 QUICK START - Preview Frontend ICARUS v5.0

## ⚡ Início Rápido

```bash
# Navegar para o projeto
cd /Users/daxmeneghel/icarus-v5.0

# Iniciar preview (hot reload)
npm run dev

# Acessar no navegador
open http://localhost:3002
```

---

## 📍 URLs Disponíveis

### Local
```
http://localhost:3002
```

### Network (acesso via rede)
```
http://192.168.3.42:3002
```

---

## 🎨 Rotas Principais para Validação

### Dashboard & Shell
- `/` → Dashboard Principal
- `/dashboard` → Dashboard Principal (alias)

### Cadastros Inteligentes
- `/cadastros` → Dashboard de Cadastros
- `/cadastros/medicos` → Médicos
- `/cadastros/hospitais` → Hospitais
- `/cadastros/pacientes` → Pacientes
- `/cadastros/produtos` → Produtos OPME
- `/cadastros/convenios` → Convênios
- `/cadastros/fornecedores` → Fornecedores
- `/cadastros/equipes` → Equipes Médicas
- `/cadastros/transportadoras` → Transportadoras
- `/cadastros/tabelas-precos` → Tabelas de Preços

### Compras & Fornecedores
- `/compras/cotacoes` → Gestão de Cotações
- `/compras/pedidos` → Pedidos de Compra
- `/compras/notas` → Notas de Compra

---

## 🎛️ Controles do Preview

### Toggle Dark Mode
Clique no ícone de **Lua/Sol** no canto superior direito da Topbar.

### Toggle Sidebar
Clique no ícone de **Menu** (≡) no canto superior esquerdo da Topbar.

### Chatbot IA
Clique no ícone flutuante no canto inferior direito.

---

## 📸 Capturar Screenshots

### Automático (Playwright)
```bash
PREVIEW_URL=http://localhost:3002 node tools/design/capture-previews.mjs
```

**Output**: `docs/design/prints/*.png`  
**Relatório**: `docs/design/previews/screenshots-report.md`

### Manual
1. Abra o preview no navegador
2. Use DevTools (F12) ou extensões de screenshot
3. Salve em `docs/design/prints/`

---

## 🔍 Validação de Qualidade

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

### Hard Gates (OraclusX DS)
```bash
npm run qa:hardgates
```
**Relatório**: `docs/revisor/hard-gates-report.md`

### Acessibilidade (axe)
```bash
npm run qa:a11y
```
**Relatório**: `docs/axe-root.json`

---

## 🎨 Temas & Estilos

### CSS Variables Principais
```css
/* Cores */
--orx-primary: #6366F1          /* Indigo médio */
--orx-bg-light: #E0E5EC         /* Neumórfico claro */
--orx-bg-dark: #2D3748          /* Neumórfico escuro */

/* Sombras 3D */
--orx-shadow-light-1: 8px 8px 16px #a3b1c6
--orx-shadow-light-2: -8px -8px 16px #ffffff
--orx-shadow-dark-1: 8px 8px 16px #1a202c
--orx-shadow-dark-2: -8px -8px 16px #3d4a5c
```

### Classes Utilitárias Neumórficas
```css
.neumorphic-card      /* Card elevado */
.neumorphic-button    /* Botão 3D */
.neumorphic-input     /* Input com sombra interna */
.neomorphic-raised    /* Elevado genérico */
.neomorphic-pressed   /* Pressionado (inset) */
.neomorphic-flat      /* Plano */
```

---

## 🛠️ Troubleshooting

### Preview não inicia
```bash
# Matar processos na porta
lsof -ti:3002 | xargs kill -9

# Limpar cache e reinstalar
rm -rf node_modules dist
npm ci
npm run dev
```

### Erro de TypeScript
```bash
# Type check isolado (não bloqueia preview)
npm run type-check
```

### Erros de importação
```bash
# Verificar alias tsconfig
cat tsconfig.json | grep paths

# Verificar Vite config
cat vite.config.ts | grep alias
```

---

## 📚 Documentação Completa

- **Relatório Final**: [docs/design/RELATORIO_FINAL_PREVIEW.md](RELATORIO_FINAL_PREVIEW.md)
- **Mapeamento Figma**: [docs/design/figma-to-code-map.md](figma-to-code-map.md)
- **Componentes shadcn**: [docs/design/componentes-shadcn-neumorphism.md](componentes-shadcn-neumorphism.md)
- **Screenshots**: [docs/design/previews/screenshots-report.md](previews/screenshots-report.md)
- **Hard Gates**: [docs/revisor/hard-gates-report.md](../revisor/hard-gates-report.md)

---

## 🎯 Checklist de Validação Visual

- [ ] Layout shell (Topbar + Sidebar + Main)
- [ ] Brand container (Icarus logo)
- [ ] Navegação hierárquica (58 módulos)
- [ ] Dashboard Principal com KPIs
- [ ] Modo escuro funcional
- [ ] Sidebar collapse/expand
- [ ] Busca global
- [ ] Notificações
- [ ] Chatbot flutuante
- [ ] Transições suaves
- [ ] Sombras neumórficas 3D
- [ ] Responsividade (desktop)

---

## 🚦 Status

✅ **Preview ATIVO**  
✅ **Hot Reload FUNCIONAL**  
✅ **Dark Mode IMPLEMENTADO**  
✅ **Neumorphism 3D APLICADO**  
✅ **44 Screenshots CAPTURADOS**  
🟡 **Hard Gates PARCIAL** (65% conformidade)

---

**Última atualização**: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}  
**Responsável**: AGENTE_DESIGNER_NEUMORPHIC_PREVIEW

