# 📸 Captura Automatizada de Screenshots - ICARUS v5.0

## Visão Geral

Script automatizado para capturar screenshots de todas as páginas do sistema ICARUS v5.0 em modo claro e escuro.

## Pré-requisitos

```bash
# Instalar Playwright (se ainda não estiver instalado)
pnpm add -D playwright
pnpm exec playwright install chromium
```

## Uso Básico

```bash
# Capturar com configurações padrão (localhost:5173)
node tools/design/capture-previews.mjs

# Ou com pnpm
pnpm run capture:screenshots
```

## Configurações via Variáveis de Ambiente

### URL Base
```bash
# Desenvolvimento (padrão)
PREVIEW_URL=http://localhost:5173 node tools/design/capture-previews.mjs

# Build de preview
PREVIEW_URL=http://localhost:4173 node tools/design/capture-previews.mjs

# Staging
PREVIEW_URL=https://staging.icarus.com.br node tools/design/capture-previews.mjs
```

### Viewport (Resolução)
```bash
# Full HD (padrão: 1920x1080)
VIEWPORT_WIDTH=1920 VIEWPORT_HEIGHT=1080 node tools/design/capture-previews.mjs

# 4K
VIEWPORT_WIDTH=3840 VIEWPORT_HEIGHT=2160 node tools/design/capture-previews.mjs

# Laptop
VIEWPORT_WIDTH=1366 VIEWPORT_HEIGHT=768 node tools/design/capture-previews.mjs

# Mobile
VIEWPORT_WIDTH=375 VIEWPORT_HEIGHT=812 node tools/design/capture-previews.mjs
```

### Timeout
```bash
# Timeout padrão: 3000ms (3s)
WAIT_TIMEOUT=3000 node tools/design/capture-previews.mjs

# Timeout maior para páginas lentas
WAIT_TIMEOUT=5000 node tools/design/capture-previews.mjs
```

### Combinando Configurações
```bash
PREVIEW_URL=http://localhost:5173 \
VIEWPORT_WIDTH=1920 \
VIEWPORT_HEIGHT=1080 \
WAIT_TIMEOUT=4000 \
node tools/design/capture-previews.mjs
```

## Rotas Capturadas

### 📊 Dashboard (3 rotas)
- `/` - Home
- `/dashboard` - Dashboard
- `/dashboard/ia` - Dashboard IA

### 📝 Cadastros (6 rotas)
- `/cadastros` - Dashboard de Cadastros
- `/cadastros/medicos` - Cadastro de Médicos
- `/cadastros/hospitais` - Cadastro de Hospitais
- `/cadastros/produtos` - Cadastro de Produtos
- `/cadastros/fornecedores` - Cadastro de Fornecedores
- `/cadastros/convenios` - Cadastro de Convênios

### 🛒 Compras (4 rotas)
- `/compras/cotacoes` - Cotações
- `/compras/pedidos` - Pedidos de Compra
- `/compras/notas` - Notas de Compra
- `/compras/pesquisa-precos` - Pesquisa de Preços

### 📦 Estoque (4 rotas)
- `/estoque` - Dashboard de Estoque
- `/estoque/inventario` - Inventário
- `/estoque/lotes` - Gestão de Lotes
- `/estoque/ia` - Estoque IA

### 🏥 Consignação (2 rotas)
- `/consignacao` - Consignação
- `/consignacao/avancada` - Consignação Avançada

### 🩺 Cirurgias (2 rotas)
- `/cirurgias` - Dashboard de Cirurgias
- `/cirurgias/procedimentos` - Procedimentos

### 💰 Financeiro (5 rotas)
- `/financeiro` - Dashboard Financeiro
- `/financeiro/contas-pagar` - Contas a Pagar
- `/financeiro/contas-receber` - Contas a Receber
- `/financeiro/dre` - DRE
- `/financeiro/ia` - Financeiro IA

### 💳 Faturamento (3 rotas)
- `/faturamento` - Dashboard de Faturamento
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
- `/bi/dashboards` - Dashboards Analíticos

### 📄 Relatórios (2 rotas)
- `/relatorios` - Dashboard de Relatórios
- `/relatorios/regulatorios` - Relatórios Regulatórios

### 🔌 Integrações (3 rotas)
- `/integracoes` - Dashboard de Integrações
- `/integracoes/api` - APIs
- `/integracoes/credenciais` - Credenciais

### ⚙️ Configurações (3 rotas)
- `/configuracoes` - Configurações do Sistema
- `/configuracoes/usuarios` - Usuários e Permissões
- `/configuracoes/empresa` - Dados da Empresa

**Total: 51 rotas × 2 modos = 102 screenshots**

## Outputs

### Diretório de Saída
```
docs/screenshots/
├── dashboard/
│   ├── dashboard-principal-light.png
│   ├── dashboard-principal-dark.png
│   └── ...
├── cadastros/
│   ├── cadastros-medicos-light.png
│   ├── cadastros-medicos-dark.png
│   └── ...
├── compras/
├── estoque/
├── consignacao/
├── cirurgias/
├── financeiro/
├── faturamento/
├── compliance/
├── crm/
├── bi/
├── relatorios/
├── integracoes/
└── configuracoes/
```

### Relatório
Gerado automaticamente em:
```
docs/design/previews/screenshots-report.md
```

## Exemplo de Execução

```bash
$ node tools/design/capture-previews.mjs

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
  📸 Dashboard IA (light)...
     ✓ Salvo: dashboard/dashboard-ia-light.png
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

## Script no package.json

Adicione ao `package.json`:

```json
{
  "scripts": {
    "capture:screenshots": "node tools/design/capture-previews.mjs",
    "capture:4k": "VIEWPORT_WIDTH=3840 VIEWPORT_HEIGHT=2160 node tools/design/capture-previews.mjs",
    "capture:mobile": "VIEWPORT_WIDTH=375 VIEWPORT_HEIGHT=812 node tools/design/capture-previews.mjs"
  }
}
```

## Casos de Uso

### 1. Documentação
Capturar screenshots para manuais e documentação do sistema.

### 2. QA Visual
Comparar visual antes/depois de mudanças de design.

### 3. Testes de Regressão Visual
Verificar se mudanças de código afetaram a aparência.

### 4. Apresentações
Gerar imagens para apresentações e demos.

### 5. Onboarding
Criar material visual para novos usuários/desenvolvedores.

## Troubleshooting

### Erro: "Cannot find module 'playwright'"
```bash
pnpm add -D playwright
pnpm exec playwright install chromium
```

### Erro: "Navigation timeout"
Aumente o timeout:
```bash
WAIT_TIMEOUT=10000 node tools/design/capture-previews.mjs
```

### Erro: "Connection refused"
Certifique-se de que o servidor está rodando:
```bash
pnpm dev  # Em outro terminal
```

### Screenshots em branco
Aumente o `WAIT_TIMEOUT` para dar mais tempo de renderização:
```bash
WAIT_TIMEOUT=5000 node tools/design/capture-previews.mjs
```

## Adicionando Novas Rotas

Edite `tools/design/capture-previews.mjs` e adicione ao array `ROUTES`:

```javascript
const ROUTES = [
  // ... rotas existentes ...
  
  // Nova rota
  { 
    path: '/nova-rota', 
    name: 'Nova Funcionalidade',
    shots: [{ file: 'nova-rota/screenshot' }] 
  },
  
  // Rota com múltiplos screenshots
  { 
    path: '/outra-rota', 
    name: 'Outra Funcionalidade',
    shots: [
      { file: 'outra-rota/view-1' },
      { file: 'outra-rota/view-2' }
    ] 
  },
];
```

## Performance

- **Tempo médio**: ~2-3 minutos para 102 screenshots
- **Tamanho médio**: ~100-200KB por screenshot PNG
- **Total aproximado**: ~10-20MB para conjunto completo

## Boas Práticas

1. **Execute em dev/preview**: Sempre capture de um ambiente controlado
2. **Versione os screenshots**: Commit das capturas importantes
3. **Atualize regularmente**: Recapture após mudanças visuais significativas
4. **Use .gitignore seletivo**: Ignore screenshots temporários, versione os oficiais
5. **Documente mudanças**: Anote no commit o motivo da recaptura

## Automação CI/CD

Exemplo de workflow GitHub Actions:

```yaml
name: Capture Screenshots

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: pnpm install
      - run: pnpm exec playwright install chromium
      - run: pnpm build
      - run: pnpm preview &
      - run: sleep 5
      - run: PREVIEW_URL=http://localhost:4173 pnpm run capture:screenshots
      
      - uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: docs/screenshots/
```

---

**Versão**: 1.0  
**Última Atualização**: 18/11/2025  
**Autor**: ICARUS Development Team

