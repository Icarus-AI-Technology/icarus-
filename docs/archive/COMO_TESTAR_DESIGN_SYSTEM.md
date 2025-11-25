# 🧪 Como Testar o Design System Neumórfico

## Quick Test - 5 minutos

### 1. Inicie o Servidor de Desenvolvimento

```bash
pnpm dev
```

### 2. Acesse o Dashboard Principal

Navegue para:
```
http://localhost:5173/dashboard
```

**O que observar:**
- ✅ Cards KPI com profundidade 3D
- ✅ Ícones com gradientes
- ✅ Indicadores de tendência
- ✅ Hover com elevação
- ✅ Sombras neumórficas

### 3. Teste o Modo Escuro

No navegador, abra o console (F12) e execute:

```javascript
document.documentElement.classList.toggle('dark');
```

**O que observar:**
- ✅ Transição suave entre modos
- ✅ Cores ajustadas automaticamente
- ✅ Sombras adaptadas
- ✅ Contraste mantido

### 4. Teste a Responsividade

Redimensione a janela ou use o DevTools (F12 > Toggle Device Toolbar):

**Breakpoints para testar:**
- 📱 Mobile: 375px
- 📱 Tablet: 768px
- 💻 Desktop: 1024px
- 🖥️ Large Desktop: 1440px

**O que observar:**
- ✅ Grid adapta de 4 colunas para 1
- ✅ Textos permanecem legíveis
- ✅ Botões mantêm tamanho adequado
- ✅ Sem overflow horizontal

### 5. Teste a Acessibilidade

**Navegação por Teclado:**
- Pressione `Tab` para navegar entre elementos
- Pressione `Enter` ou `Space` para ativar botões/cards

**O que observar:**
- ✅ Focus ring visível
- ✅ Ordem lógica de tabulação
- ✅ Todos elementos clicáveis são alcançáveis

---

## Teste Completo - 15 minutos

### 1. Acesse a Página de Showcase

**IMPORTANTE:** Primeiro, adicione a rota no seu router.

Em `src/App.tsx` ou arquivo de rotas, adicione:

```tsx
import NeumoShowcase from '@/pages/NeumoShowcase';

// ... dentro das rotas:
<Route path="/showcase" element={<NeumoShowcase />} />
```

Depois acesse:
```
http://localhost:5173/showcase
```

### 2. Teste Todos os Componentes

#### **CardKpi**
- [x] Hover aumenta elevação
- [x] Trends exibem cores corretas (verde/vermelho/cinza)
- [x] Todas as 6 tonalidades funcionam
- [x] Ícones visíveis e legíveis

#### **MiniCard**
- [x] Ícone com inset neumórfico
- [x] Trends funcionam
- [x] Hover suave
- [x] Dense mode funciona

#### **NeumoSearchBar**
- [x] Ícone de lupa visível
- [x] Botão limpar aparece ao digitar
- [x] Botão de filtros funciona (se habilitado)
- [x] Placeholder legível
- [x] Tamanhos (sm, md, lg) corretos

#### **NeumoInput**
- [x] Ícones esquerda/direita funcionam
- [x] Estados de erro exibem mensagem
- [x] Focus ring visível
- [x] Disabled bloqueia interação
- [x] Label e hint exibidos corretamente

#### **NeumoTextarea**
- [x] Contador de caracteres funciona
- [x] Resize vertical permitido
- [x] Estados de erro funcionam
- [x] Visual consistente com Input

#### **NeumoButton**
- [x] Todas variantes têm cores corretas
- [x] Loading state exibe spinner
- [x] Ícones esquerda/direita posicionados
- [x] Hover com scale funciona
- [x] Disabled não responde a cliques

### 3. Teste Interações

No showcase, teste:

1. **Digite na busca** - veja o botão limpar aparecer
2. **Preencha um input** - veja o focus ring
3. **Clique em um botão com loading** - veja o spinner
4. **Clique no toggle dark mode** - veja a transição
5. **Redimensione a janela** - veja o layout adaptar

### 4. Teste de Performance

Abra o DevTools > Performance:

1. Inicie gravação
2. Faça scroll na página
3. Alterne dark mode 3x
4. Pare a gravação

**O que observar:**
- ✅ FPS consistente (60fps)
- ✅ Sem layout shifts
- ✅ Transições suaves

---

## Teste de Acessibilidade - 10 minutos

### Ferramentas Automatizadas

#### 1. Axe DevTools

Instale: [Axe DevTools Extension](https://www.deque.com/axe/devtools/)

1. Abra o DevTools (F12)
2. Vá para a aba "Axe DevTools"
3. Clique em "Scan ALL of my page"

**Resultado esperado:** 0 erros críticos

#### 2. Lighthouse

1. Abra DevTools (F12)
2. Vá para a aba "Lighthouse"
3. Selecione "Accessibility"
4. Clique em "Analyze page load"

**Resultado esperado:** Score ≥ 95

### Teste Manual

#### Contraste de Cores

Use: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

Teste estas combinações:

**Modo Claro:**
- Texto primário (#1a202c) em fundo claro (#edf1f7) → Deve passar AA
- Texto secundário (#4a5568) em fundo claro → Deve passar AA

**Modo Escuro:**
- Texto primário (#f7fafc) em fundo escuro (#1a202c) → Deve passar AA
- Texto secundário (#e2e8f0) em fundo escuro → Deve passar AA

#### Screen Reader

**Windows:** NVDA (gratuito)
**Mac:** VoiceOver (nativo)

1. Ative o screen reader
2. Navegue com `Tab`
3. Ouça as descrições

**O que observar:**
- ✅ Labels de campos lidos corretamente
- ✅ Estados (error, disabled) anunciados
- ✅ Valores de KPIs compreensíveis

---

## Checklist Final

Antes de considerar completo:

### Visual
- [ ] Sombras neumórficas visíveis em modo claro
- [ ] Sombras neumórficas visíveis em modo escuro
- [ ] Ícones coloridos e legíveis
- [ ] Profundidade 3D perceptível
- [ ] Borders sutis visíveis

### Funcional
- [ ] Todos botões respondem a cliques
- [ ] Inputs aceitam digitação
- [ ] Forms podem ser submetidos
- [ ] Loading states funcionam
- [ ] Estados de erro exibem mensagens

### Responsivo
- [ ] Mobile (375px) - 1 coluna
- [ ] Tablet (768px) - 2 colunas
- [ ] Desktop (1024px+) - 4 colunas
- [ ] Sem scroll horizontal
- [ ] Touch targets ≥44px

### Acessibilidade
- [ ] Navegação por teclado completa
- [ ] Focus indicators visíveis
- [ ] Contraste AA/AAA
- [ ] ARIA labels corretos
- [ ] Screen reader friendly

### Performance
- [ ] Carregamento < 3s
- [ ] Scroll suave 60fps
- [ ] Transições sem lag
- [ ] Sem memory leaks

---

## Problemas Comuns e Soluções

### Sombras não aparecem

**Causa:** CSS não carregado ou tokens não importados

**Solução:**
```tsx
// Certifique-se que globals.css está importado no main.tsx
import '@/styles/globals.css';
```

### Modo escuro não funciona

**Causa:** Classe 'dark' não aplicada ao root

**Solução:**
```javascript
// Adicione ao HTML root
document.documentElement.classList.add('dark');
```

### Componentes não encontrados

**Causa:** Import path incorreto

**Solução:**
```tsx
// Use o path correto
import { CardKpi } from '@/components/oraclusx-ds';
```

### Ícones sem cor

**Causa:** Passando instância JSX ao invés do componente

**Solução:**
```tsx
// ✅ Correto
<CardKpi icon={DollarSign} />

// ❌ Errado
<CardKpi icon={<DollarSign />} />
```

---

## Relatando Bugs

Se encontrar problemas, documente:

1. **O que você esperava:**
2. **O que aconteceu:**
3. **Como reproduzir:**
4. **Screenshots:** (se visual)
5. **Browser/OS:**

---

## ✅ Pronto!

Após completar todos os testes, o design system está validado e pronto para uso em produção.

**Happy Testing! 🧪**

