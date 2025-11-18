# 📸 Guia Completo de Captura de Screenshots - ICARUS v5.0

## 🎯 Visão Geral

Sistema automatizado de captura de screenshots para documentação visual completa do ICARUS v5.0.

## ✨ Características

- ✅ **51 rotas** cobrindo todo o sistema
- ✅ **2 modos**: Light e Dark
- ✅ **102 screenshots** totais
- ✅ **Configurável** via variáveis de ambiente
- ✅ **Relatório automático** em Markdown
- ✅ **Organizado** por módulos

## 🚀 Uso Rápido

```bash
# 1. Inicie o servidor de desenvolvimento
pnpm dev

# 2. Em outro terminal, capture os screenshots
pnpm run capture:screenshots
```

## 📋 Scripts Disponíveis

### Captura Padrão (Full HD - 1920x1080)
```bash
pnpm run capture:screenshots
# ou
pnpm run preview:capture
```

### Captura em 4K (3840x2160)
```bash
pnpm run capture:4k
```

### Captura Mobile (375x812)
```bash
pnpm run capture:mobile
```

### Captura Tablet (768x1024)
```bash
pnpm run capture:tablet
```

## ⚙️ Configurações Avançadas

### URL Customizada
```bash
PREVIEW_URL=http://localhost:4173 pnpm run capture:screenshots
```

### Resolução Customizada
```bash
VIEWPORT_WIDTH=2560 VIEWPORT_HEIGHT=1440 pnpm run capture:screenshots
```

### Timeout Customizado
```bash
WAIT_TIMEOUT=5000 pnpm run capture:screenshots
```

### Combinação de Configurações
```bash
PREVIEW_URL=http://localhost:4173 \
VIEWPORT_WIDTH=1920 \
VIEWPORT_HEIGHT=1080 \
WAIT_TIMEOUT=4000 \
node tools/design/capture-previews.mjs
```

## 📊 Cobertura de Rotas

| Módulo | Rotas | Screenshots (L+D) |
|--------|-------|-------------------|
| Dashboard | 3 | 6 |
| Cadastros | 6 | 12 |
| Compras | 4 | 8 |
| Estoque | 4 | 8 |
| Consignação | 2 | 4 |
| Cirurgias | 2 | 4 |
| Financeiro | 5 | 10 |
| Faturamento | 3 | 6 |
| Compliance | 5 | 10 |
| CRM | 3 | 6 |
| BI | 2 | 4 |
| Relatórios | 2 | 4 |
| Integrações | 3 | 6 |
| Configurações | 3 | 6 |
| **TOTAL** | **51** | **102** |

## 📁 Estrutura de Saída

```
docs/
├── screenshots/
│   ├── dashboard/
│   │   ├── dashboard-principal-light.png
│   │   ├── dashboard-principal-dark.png
│   │   └── ...
│   ├── cadastros/
│   ├── compras/
│   ├── estoque/
│   ├── consignacao/
│   ├── cirurgias/
│   ├── financeiro/
│   ├── faturamento/
│   ├── compliance/
│   ├── crm/
│   ├── bi/
│   ├── relatorios/
│   ├── integracoes/
│   └── configuracoes/
└── design/
    └── previews/
        └── screenshots-report.md
```

## 🔍 Detalhamento das Rotas

### 📊 Dashboard (3 rotas)
- `/` - Home
- `/dashboard` - Dashboard principal
- `/dashboard/ia` - Dashboard com IA

### 📝 Cadastros (6 rotas)
- `/cadastros` - Dashboard de cadastros
- `/cadastros/medicos` - Cadastro de médicos
- `/cadastros/hospitais` - Cadastro de hospitais
- `/cadastros/produtos` - Cadastro de produtos
- `/cadastros/fornecedores` - Cadastro de fornecedores
- `/cadastros/convenios` - Cadastro de convênios

### 🛒 Compras (4 rotas)
- `/compras/cotacoes` - Cotações
- `/compras/pedidos` - Pedidos de compra
- `/compras/notas` - Notas de compra
- `/compras/pesquisa-precos` - Pesquisa de preços

### 📦 Estoque (4 rotas)
- `/estoque` - Dashboard de estoque
- `/estoque/inventario` - Inventário
- `/estoque/lotes` - Gestão de lotes
- `/estoque/ia` - Estoque com IA

### 🏥 Consignação (2 rotas)
- `/consignacao` - Consignação
- `/consignacao/avancada` - Consignação avançada

### 🩺 Cirurgias (2 rotas)
- `/cirurgias` - Dashboard de cirurgias
- `/cirurgias/procedimentos` - Procedimentos cirúrgicos

### 💰 Financeiro (5 rotas)
- `/financeiro` - Dashboard financeiro
- `/financeiro/contas-pagar` - Contas a pagar
- `/financeiro/contas-receber` - Contas a receber
- `/financeiro/dre` - DRE
- `/financeiro/ia` - Financeiro com IA

### 💳 Faturamento (3 rotas)
- `/faturamento` - Dashboard de faturamento
- `/faturamento/tiss` - TISS
- `/faturamento/nfe` - NF-e

### ⚖️ Compliance (5 rotas)
- `/compliance/anvisa` - Compliance ANVISA
- `/compliance/abbott` - Compliance Abbott
- `/compliance/ans` - Compliance ANS
- `/compliance/auditoria` - Auditoria
- `/compliance/lgpd` - LGPD

### 🤝 CRM (3 rotas)
- `/crm` - Dashboard CRM
- `/crm/propostas` - Propostas
- `/crm/contratos` - Contratos

### 📈 BI e Analytics (2 rotas)
- `/bi` - BI Analytics
- `/bi/dashboards` - Dashboards analíticos

### 📄 Relatórios (2 rotas)
- `/relatorios` - Dashboard de relatórios
- `/relatorios/regulatorios` - Relatórios regulatórios

### 🔌 Integrações (3 rotas)
- `/integracoes` - Dashboard de integrações
- `/integracoes/api` - APIs
- `/integracoes/credenciais` - Credenciais

### ⚙️ Configurações (3 rotas)
- `/configuracoes` - Configurações do sistema
- `/configuracoes/usuarios` - Usuários e permissões
- `/configuracoes/empresa` - Dados da empresa

## 🎨 Exemplo de Saída

```
🎨 ICARUS v5.0 - Captura de Screenshots
==========================================
Base URL: http://localhost:5173
Output: /path/to/docs/screenshots
Viewport: 1920x1080
Wait Timeout: 3000ms
Total de rotas: 51

☀️  Capturando modo LIGHT...
  📸 Home (light)...
     ✓ Salvo: dashboard/dashboard-principal-light.png
  📸 Dashboard (light)...
     ✓ Salvo: dashboard/dashboard-alias-light.png
  ...
   ✓ 51 capturas / ✗ 0 falhas

🌙 Capturando modo DARK...
  📸 Home (dark)...
     ✓ Salvo: dashboard/dashboard-principal-dark.png
  ...
   ✓ 51 capturas / ✗ 0 falhas

==========================================
📊 RESUMO:
  ✅ Total capturado: 102 screenshots
  ❌ Total falhado: 0 screenshots
  📁 Salvos em: /path/to/docs/screenshots

📄 Relatório gerado: docs/design/previews/screenshots-report.md
✅ Processo concluído!
```

## 🔧 Troubleshooting

### Problema: Screenshots em branco
**Solução**: Aumente o timeout
```bash
WAIT_TIMEOUT=5000 pnpm run capture:screenshots
```

### Problema: Navegação falhando
**Solução**: Verifique se o servidor está rodando
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm run capture:screenshots
```

### Problema: Playwright não instalado
**Solução**: Instale o Playwright
```bash
pnpm add -D playwright
pnpm exec playwright install chromium
```

## 📚 Casos de Uso

1. **Documentação**: Screenshots para manuais e guias
2. **QA Visual**: Comparação antes/depois de mudanças
3. **Apresentações**: Material visual para demos
4. **Onboarding**: Material de treinamento
5. **Testes de Regressão**: Verificação visual

## 🔄 Workflow Recomendado

```bash
# 1. Faça mudanças visuais no código
git checkout -b feature/nova-tela

# 2. Inicie o dev server
pnpm dev

# 3. Capture screenshots (em outro terminal)
pnpm run capture:screenshots

# 4. Revise os screenshots
open docs/screenshots/

# 5. Commit se estiver OK
git add docs/screenshots/
git commit -m "docs: atualiza screenshots com nova tela"
```

## 📝 Adicionando Novas Rotas

Edite `tools/design/capture-previews.mjs`:

```javascript
const ROUTES = [
  // ... rotas existentes ...
  
  {
    path: '/nova-rota',
    name: 'Nova Funcionalidade',
    shots: [{ file: 'nova-rota/screenshot' }]
  },
];
```

## 🎯 Performance

- **Tempo médio**: 2-3 minutos
- **Tamanho médio por screenshot**: 100-200KB
- **Total aproximado**: 10-20MB

## 📖 Documentação Adicional

- **Script**: `tools/design/capture-previews.mjs`
- **README**: `tools/design/README.md`
- **Relatório**: `docs/design/previews/screenshots-report.md` (gerado automaticamente)

## ✅ Checklist de Qualidade

- [ ] Servidor rodando em localhost:5173
- [ ] Playwright instalado
- [ ] Todas as rotas acessíveis
- [ ] Modo light funcionando
- [ ] Modo dark funcionando
- [ ] Screenshots salvos corretamente
- [ ] Relatório gerado
- [ ] Screenshots commitados (se necessário)

---

**Versão**: 2.0  
**Última Atualização**: 18/11/2025  
**Autor**: ICARUS Development Team
