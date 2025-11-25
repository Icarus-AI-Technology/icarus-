# 🚀 Quick Start - ICARUS v5.0 Interface Moderna

## Acesso Rápido

### URLs Disponíveis
```
Dashboard:  http://localhost:5173/v5
            http://localhost:5173/v5/dashboard

Cadastros:  http://localhost:5173/v5/cadastros
```

## Comandos

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Navegação

### No Sistema
1. **Sidebar** (esquerda):
   - Clique no botão de seta para expandir/colapsar
   - Clique nos ícones para navegar (Dashboard, Cadastros, etc.)

2. **Topbar** (topo):
   - Barra de busca global
   - Ícone sino: notificações
   - Ícone mensagem: chat
   - Avatar: menu do usuário

3. **Dashboard** (`/v5`):
   - 4 KPIs no topo
   - Gráficos financeiros
   - Métricas operacionais
   - 6 botões de ações rápidas

4. **Cadastros** (`/v5/cadastros`):
   - Tabs horizontais (clique para trocar)
   - Tab "Médicos" mostra tabela completa
   - Clique nas colunas para ordenar
   - Navegue entre páginas (botões Anterior/Próximo)

## Features Implementadas

### ✅ Dashboard
- [x] 4 KPI Cards com variação %
- [x] Gráfico de faturamento mensal
- [x] Distribuição geográfica
- [x] Estoque crítico (bar chart)
- [x] Métricas de logística e IA
- [x] 6 Ações rápidas (buttons)

### ✅ Cadastros
- [x] 6 Tabs (Médicos, Hospitais, Convênios, Fornecedores, Produtos, Tabelas)
- [x] Tabela de médicos com 8 registros
- [x] Ordenação por Nome e Taxa de Sucesso
- [x] Paginação (5 por página)
- [x] Badges de especialidade e taxa
- [x] Avatares dos médicos
- [x] Busca e filtros (UI pronta)

### ✅ Design
- [x] Cor primária: Violeta (#7c3aed)
- [x] Cor sucesso: Emerald (#10b981)
- [x] Cor perigo: Rose (#f43f5e)
- [x] Sombras sutis e difusas
- [x] Border radius generoso (12px)
- [x] Fonte Inter
- [x] Hover effects
- [x] Animações Framer Motion

## Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **React 18** | Framework UI |
| **TypeScript** | Tipagem |
| **Vite** | Build tool |
| **Tailwind CSS** | Estilização |
| **Shadcn/ui** | Componentes base |
| **Lucide React** | Ícones |
| **Recharts** | Gráficos |
| **TanStack Table** | Tabelas avançadas |
| **Framer Motion** | Animações |
| **Zustand** | Estado global |

## Próximos Passos

### Expansão Sugerida
1. **Conectar com Backend Real**
   - Substituir mock data por chamadas API
   - Integrar com Supabase

2. **Implementar Tabs Restantes**
   - Hospitais (cards view)
   - Convênios (lista)
   - Fornecedores (grid)
   - Produtos OPME (tabela)
   - Tabelas de Preços (cards)

3. **Adicionar Filtros Funcionais**
   - Search em tempo real
   - Filtros avançados (modal)

4. **Expandir Navegação**
   - Adicionar mais rotas no sidebar
   - Implementar rotas faltantes

5. **Mobile Responsivo**
   - Menu hamburguer
   - Tabs scroll horizontal
   - Cards empilhados

## Comparação: Neumórfico vs Moderno

| Aspecto | Neumórfico (Atual) | Moderno (v5) |
|---------|-------------------|--------------|
| **Estilo** | 3D, sombras internas | Flat, clean |
| **Sombras** | Intensas, múltiplas | Sutis, simples |
| **Cores** | Indigo gradiente | Violeta sólido |
| **Cards** | Elevados, profundos | Planos, bordas |
| **Buttons** | Pressed effect | Scale effect |
| **Rota** | `/` (raiz) | `/v5` |

## Dicas

💡 **Performance:** Os componentes são lazy loaded via React.lazy()

💡 **Estado:** Zustand mantém a tab ativa entre navegações

💡 **Animações:** Framer Motion adiciona 0.2s de transição suave

💡 **Dados:** Mock data em `src/features/modern-cadastros/data/mockMedicos.ts`

💡 **Temas:** CSS vars em `src/styles/modern-theme.css`

## Troubleshooting

### Página em branco?
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erros de TypeScript?
```bash
# Verificar tipagem
npm run type-check
```

### Layout quebrado?
- Verifique se `modern-theme.css` está importado em `main.tsx`
- Confirme que Tailwind está processando os arquivos v5

## Suporte

📖 Documentação completa: `ICARUS_V5_IMPLEMENTACAO_COMPLETA.md`

🎨 Design tokens: `src/styles/modern-theme.css`

⚙️ Configuração Tailwind: `tailwind.config.js`

---

**Versão:** 5.0.0  
**Status:** ✅ Pronto para uso

