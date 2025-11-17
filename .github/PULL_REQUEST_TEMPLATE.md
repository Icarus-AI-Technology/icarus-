## 📋 Descrição

<!-- Descreva as mudanças implementadas neste PR -->

## 🎯 Tipo de Mudança

<!-- Marque as opções relevantes -->

- [ ] 🐛 Bug fix (correção de bug)
- [ ] ✨ Nova feature (nova funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 📝 Documentação
- [ ] 🎨 Refatoração
- [ ] ⚡ Performance
- [ ] ✅ Testes
- [ ] 🔧 Configuração

## 🧪 Checklist de Qualidade

<!-- Marque TODOS os itens antes de submeter o PR -->

### Código

- [ ] ✅ Testes passando (`pnpm test`)
- [ ] ✅ Lint sem erros (`pnpm lint`)
- [ ] ✅ TypeScript OK (`pnpm typecheck`)
- [ ] ✅ Build funciona (`pnpm build`)
- [ ] ✅ Sem 'any' types desnecessários
- [ ] ✅ JSDoc em funções públicas

### Testes

- [ ] ✅ Testes unitários adicionados/atualizados
- [ ] ✅ Testes E2E adicionados (se necessário)
- [ ] ✅ Coverage mantém 50%+

### Documentação

- [ ] ✅ README atualizado (se necessário)
- [ ] ✅ CONTRIBUTING seguido
- [ ] ✅ Comentários no código onde necessário
- [ ] ✅ JSDoc completo

### Segurança

- [ ] ✅ Sem secrets hardcoded
- [ ] ✅ Sem vulnerabilidades conhecidas
- [ ] ✅ Input validation implementada

## 📊 Métricas de Qualidade

<!-- Execute ./scripts/quality/monitor-quality.sh e cole o resultado -->

```
# Cole aqui o output do monitor de qualidade
```

## 🖼️ Screenshots

<!-- Adicione screenshots se mudanças visuais -->

| Antes          | Depois        |
| -------------- | ------------- |
| ![before](url) | ![after](url) |

## 🧪 Como Testar

<!-- Descreva os passos para testar as mudanças -->

1. Checkout da branch: `git checkout feature/minha-branch`
2. Instale dependências: `pnpm install`
3. Rode os testes: `pnpm test`
4. Inicie o dev server: `pnpm dev`
5. Teste a funcionalidade: [descreva os passos]

## 📝 Notas Adicionais

<!-- Informações extras relevantes para o review -->

## 🔗 Issues Relacionadas

<!-- Link para issues relacionadas -->

Closes #
Fixes #
Relates to #

---

## ✅ Aprovação do Autor

Confirmo que:

- [ ] Segui todos os padrões do CONTRIBUTING.md
- [ ] Todos os checks de qualidade passaram
- [ ] O código está pronto para review
- [ ] Quality Score mantém 95%+

---

**Para Reviewers:**

Por favor verifique:

- [ ] Código segue padrões do projeto
- [ ] Testes adequados
- [ ] Sem risco de breaking changes não documentadas
- [ ] Performance não afetada negativamente
- [ ] Segurança considerada
