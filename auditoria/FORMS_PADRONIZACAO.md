# 📋 Padronização de Formulários - OraclusX DS Neumorphic 3D

**Data:** 31 de outubro de 2025  
**Status:** 🟡 EM PROGRESSO  
**Prioridade:** ALTA

---

## 🎯 Objetivo

Padronizar **TODOS** os formulários do ICARUS v5.0 para seguir o padrão **OraclusX DS Neumorphic 3D Premium** conforme especificado em:
- `ORACLUSX_DS_COMPLETO.md`
- `ICARUS_V5_SPEC_COMPLETO.md`

---

## 📊 Formulários Identificados

### Cadastros (20 formulários)
1. `CadastroMedicos.tsx`
2. `FormularioMedicos.tsx`
3. `CadastroHospitais.tsx`
4. `CadastroPacientes.tsx`
5. `FormularioPacientes.tsx`
6. `CadastroConvenios.tsx`
7. `CadastroFornecedores.tsx`
8. `FormularioFornecedores.tsx`
9. `FormularioProdutos.tsx`
10. `CadastroEquipesMedicas.tsx`
11. `FormularioEquipesMedicas.tsx`
12. `CadastroTransportadoras.tsx`
13. `FormularioTransportadoras.tsx`
14. `CadastroPessoaJuridica.tsx`
15. (outros cadastros...)

### Operacionais (6 formulários)
1. `FormularioCirurgias.tsx`
2. `FormularioPedidosCompra.tsx`
3. `FormularioRemessasConsignacao.tsx`
4. `FormularioEstoque.tsx`
5. `FormularioEntregas.tsx`
6. `FormularioCotacoes.tsx`

---

## ✅ Padrão OraclusX DS Neumorphic 3D

### Componentes Obrigatórios

```typescript
import {
  CadastroPageLayout,
  CadastroSection,
  FormGrid,
  FormActions,
  Input,
  Select,
  Textarea,
  Button,
  Card
} from '@/components/oraclusx-ds';
```

### Estrutura Padrão

```typescript
export default function FormularioPadrao() {
  return (
    <CadastroPageLayout
      title="Título do Formulário"
      description="Descrição do formulário"
      icon={IconComponent}
    >
      <CadastroSection title="Seção 1" icon={Icon1}>
        <FormGrid columns={2}>
          <Input
            label="Campo 1"
            placeholder="..."
            className="neuro-input"
          />
          <Input
            label="Campo 2"
            placeholder="..."
            className="neuro-input"
          />
        </FormGrid>
      </CadastroSection>

      <FormActions>
        <Button variant="secondary">Cancelar</Button>
        <Button variant="primary">Salvar</Button>
      </FormActions>
    </CadastroPageLayout>
  );
}
```

### Classes CSS Neumórficas Obrigatórias

```css
/* Inputs */
.neuro-input {
  background: var(--orx-bg-light);
  border: 1px solid var(--orx-border-muted);
  box-shadow: var(--shadow-inset);
  border-radius: 12px;
}

/* Cards */
.neuromorphic-card {
  background: var(--orx-bg-light);
  box-shadow: var(--shadow-raised);
  border-radius: 16px;
}

/* Buttons */
.neuro-button {
  box-shadow: var(--shadow-raised);
  border-radius: 12px;
}
```

---

## 🔍 Checklist de Padronização

Para cada formulário, verificar:

### ✅ Estrutura
- [ ] Usa `CadastroPageLayout` como container principal
- [ ] Usa `CadastroSection` para seções
- [ ] Usa `FormGrid` para layout de campos
- [ ] Usa `FormActions` para botões de ação

### ✅ Componentes
- [ ] Usa `Input` do OraclusX DS (não HTML nativo)
- [ ] Usa `Select` do OraclusX DS (não HTML nativo)
- [ ] Usa `Textarea` do OraclusX DS (não HTML nativo)
- [ ] Usa `Button` do OraclusX DS (não HTML nativo)
- [ ] Usa `Card` do OraclusX DS para agrupamento

### ✅ Design Neumórfico
- [ ] Aplica classes `neuro-*` ou tokens CSS corretos
- [ ] Usa sombras neumórficas (`var(--shadow-raised)`, `var(--shadow-inset)`)
- [ ] Usa bordas arredondadas (12px inputs, 16px cards)
- [ ] Usa cores do design system (`var(--orx-*)`)
- [ ] Remove estilos inline hardcoded
- [ ] Remove classes Tailwind customizadas não padronizadas

### ✅ Acessibilidade
- [ ] Labels com `htmlFor` ou `aria-labelledby`
- [ ] Mensagens de erro acessíveis
- [ ] Contraste WCAG AA (4.5:1)
- [ ] Foco visível em todos os campos
- [ ] Suporte a navegação por teclado

### ✅ Validação
- [ ] Integração com React Hook Form
- [ ] Validação com Zod
- [ ] Mensagens de erro claras
- [ ] Estados de loading/disabled

---

## 🚀 Plano de Ação

### Fase 1: Auditoria Completa (EM PROGRESSO)
- [x] Identificar todos os formulários
- [ ] Analisar cada formulário
- [ ] Documentar desvios do padrão
- [ ] Criar lista de prioridades

### Fase 2: Padronização (PENDENTE)
- [ ] Criar template base reutilizável
- [ ] Migrar formulários críticos primeiro
- [ ] Migrar formulários de cadastro
- [ ] Migrar formulários operacionais

### Fase 3: Validação (PENDENTE)
- [ ] Validar visualmente cada formulário
- [ ] Testar acessibilidade (WCAG AA)
- [ ] Validar responsividade
- [ ] Testar dark mode

---

## 📝 Próximos Passos

1. **Criar script de auditoria** para verificar automaticamente os padrões
2. **Migrar formulários um por um** seguindo o template padrão
3. **Validar após cada migração** para garantir qualidade
4. **Documentar casos especiais** que precisam de tratamento customizado

---

**Última atualização:** 31/10/2025

