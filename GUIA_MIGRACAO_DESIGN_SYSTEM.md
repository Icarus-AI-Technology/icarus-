# 🚀 Guia de Migração - Design System Neumórfico 3D

## Quick Start

### 1. Substitua KPI Cards antigos

**ANTES:**
```tsx
<div className="kpi-card bg-[#6366F1] text-white h-[140px]...">
  <div className="flex items-start justify-between">
    <div className="w-14 h-14 rounded-xl bg-white/10">
      <DollarSign size={28} />
    </div>
    <div>
      <p className="text-sm">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
</div>
```

**DEPOIS:**
```tsx
<CardKpi
  label="Receita Total"
  value="R$ 2.8M"
  icon={DollarSign}
  trend={{ direction: 'up', percentage: 12.5 }}
  tone="success"
/>
```

### 2. Substitua Botões antigos

**ANTES:**
```tsx
<Button variant="secondary" icon={<RefreshCw size={18} />}>
  Atualizar
</Button>
```

**DEPOIS:**
```tsx
<NeumoButton
  variant="secondary"
  leftIcon={RefreshCw}
  loading={isLoading}
>
  Atualizar
</NeumoButton>
```

### 3. Substitua Inputs antigos

**ANTES:**
```tsx
<Input
  label="E-mail"
  type="email"
  placeholder="seu@email.com"
/>
```

**DEPOIS:**
```tsx
<NeumoInput
  label="E-mail"
  type="email"
  placeholder="seu@email.com"
  leftIcon={Mail}
  error={errors.email}
/>
```

### 4. Use Cores dos Tokens

**ANTES:**
```tsx
<div className="text-[var(--orx-text-primary)]">
```

**DEPOIS:**
```tsx
<div className="text-orx-text-primary">
```

**ANTES:**
```tsx
<div className="bg-[var(--orx-bg-light)]">
```

**DEPOIS:**
```tsx
<div className="bg-orx-bg-light">
```

### 5. Use Sombras Neumórficas

**ANTES:**
```tsx
<div className="shadow-neumorphic">
```

**DEPOIS:**
```tsx
<div className="shadow-neumo">
```

**Opções disponíveis:**
- `shadow-neumo-sm` - Cards padrão
- `shadow-neumo` - Elementos interativos
- `shadow-neumo-lg` - Overlays
- `shadow-neumo-sm-inset` - Inputs
- `shadow-neumo-hover` - Estado hover

## 📋 Checklist de Migração por Módulo

Para cada módulo que você migrar:

- [ ] Substituir todos os KPI cards por `<CardKpi />`
- [ ] Substituir mini cards por `<MiniCard />`
- [ ] Substituir botões por `<NeumoButton />`
- [ ] Substituir inputs por `<NeumoInput />`
- [ ] Substituir textareas por `<NeumoTextarea />`
- [ ] Substituir barras de busca por `<NeumoSearchBar />`
- [ ] Trocar classes de cor por tokens (ex: `text-orx-text-primary`)
- [ ] Trocar sombras antigas por neumórficas
- [ ] Testar modo claro e escuro
- [ ] Validar responsividade
- [ ] Testar navegação por teclado
- [ ] Validar contraste de cores

## 🎨 Tonalidades Semânticas

Use as tonalidades corretas conforme o contexto:

| Contexto | Tonalidade | Exemplo |
|----------|------------|---------|
| Informação geral | `primary` | Total de usuários |
| Crescimento/positivo | `success` | Receita aumentou |
| Alerta/atenção | `warning` | Estoque baixo |
| Erro/crítico | `danger` | Falha no sistema |
| Dados neutros | `info` | Dados estatísticos |
| Padrão | `neutral` | Genérico |

## 🔧 Troubleshooting

### Sombras não aparecem no modo escuro

**Problema:**
```tsx
<div className="shadow-neumorphic">
```

**Solução:**
```tsx
<div className="shadow-neumo">
```

Os tokens CSS ajustam automaticamente para dark mode.

### Ícones sem cor

**Problema:**
```tsx
<CardKpi icon={<DollarSign />} />
```

**Solução:**
```tsx
<CardKpi icon={DollarSign} />
```

Passe o componente, não a instância JSX.

### Input muito pequeno

**Problema:**
```tsx
<NeumoInput />
```

**Solução:**
```tsx
<NeumoInput size="lg" />
```

Tamanhos: `sm`, `md` (padrão), `lg`.

## 📚 Exemplos Completos

### Form Completo

```tsx
import { NeumoInput, NeumoTextarea, NeumoButton } from '@/components/oraclusx-ds';
import { Mail, User, Lock } from 'lucide-react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <NeumoInput
        label="Nome"
        placeholder="Seu nome completo"
        leftIcon={User}
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        error={errors.name}
        required
      />

      <NeumoInput
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        leftIcon={Mail}
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
        required
      />

      <NeumoTextarea
        label="Mensagem"
        placeholder="Digite sua mensagem..."
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        error={errors.message}
        rows={5}
        maxLength={500}
        showCharCount
        required
      />

      <div className="flex gap-3">
        <NeumoButton
          type="submit"
          variant="primary"
          loading={loading}
          fullWidth
        >
          Enviar
        </NeumoButton>
        <NeumoButton
          type="button"
          variant="ghost"
          onClick={handleReset}
        >
          Limpar
        </NeumoButton>
      </div>
    </form>
  );
}
```

### Dashboard KPIs

```tsx
import { CardKpi, MiniCard } from '@/components/oraclusx-ds';
import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';

function DashboardKPIs() {
  return (
    <>
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardKpi
          label="Receita Mensal"
          value="R$ 2.8M"
          icon={DollarSign}
          trend={{ direction: 'up', percentage: 12.5 }}
          tone="success"
        />
        <CardKpi
          label="Novos Clientes"
          value="1.847"
          icon={Users}
          trend={{ direction: 'up', percentage: 8.3 }}
          tone="primary"
        />
        <CardKpi
          label="Produtos Vendidos"
          value="12.4K"
          icon={Package}
          trend={{ direction: 'down', percentage: 3.2 }}
          tone="warning"
        />
        <CardKpi
          label="Taxa Conversão"
          value="3.2%"
          icon={TrendingUp}
          trend={{ direction: 'neutral', percentage: 0 }}
          tone="info"
        />
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <MiniCard
          title="Pedidos Hoje"
          value="127"
          icon={Package}
          trend={{ direction: 'up', value: '+12%' }}
        />
        {/* ... mais mini cards */}
      </div>
    </>
  );
}
```

## 🎯 Próximos Módulos para Migrar

### Prioridade Alta
1. ✅ Dashboard Principal (COMPLETO)
2. [ ] Cadastros Inteligentes
3. [ ] Compras e Fornecedores
4. [ ] Gestão de Cirurgias
5. [ ] Estoque Inteligente

### Prioridade Média
6. [ ] Consignação Avançada
7. [ ] Vendas & CRM
8. [ ] Financeiro Avançado
9. [ ] Analytics & BI
10. [ ] Compliance & Auditoria

### Prioridade Baixa
11-58. [ ] Demais módulos

## 💡 Dicas Pro

1. **Sempre use ícones do lucide-react**
   ```tsx
   import { Search, Mail, User } from 'lucide-react';
   ```

2. **Prefira leftIcon/rightIcon ao invés de children para ícones**
   ```tsx
   // ✅ Bom
   <NeumoButton leftIcon={Search}>Buscar</NeumoButton>
   
   // ❌ Evite
   <NeumoButton><Search /> Buscar</NeumoButton>
   ```

3. **Use loading state nos botões**
   ```tsx
   <NeumoButton loading={isSubmitting}>
     Salvar
   </NeumoButton>
   ```

4. **Aproveite o fullWidth quando apropriado**
   ```tsx
   <NeumoButton fullWidth variant="primary">
     Continuar
   </NeumoButton>
   ```

5. **Sempre forneça labels acessíveis**
   ```tsx
   <NeumoInput
     label="E-mail"
     aria-label="Digite seu e-mail"
   />
   ```

## 📞 Suporte

Dúvidas sobre a migração? Consulte:
- 📄 `DESIGN_SYSTEM_NEUMORFICO_DOCUMENTACAO.md`
- 🎨 `/src/pages/NeumoShowcase.tsx`
- 💬 Canal #design-system no Slack

---

**Happy Coding! 🚀**

