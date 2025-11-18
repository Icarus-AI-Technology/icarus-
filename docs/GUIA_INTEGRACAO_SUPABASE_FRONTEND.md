# 🚀 Guia de Integração Supabase - Frontend ICARUS

**Status:** ✅ Integração Completa  
**Data:** 2025-11-18  
**Projeto:** ICARUS v5.0

---

## 📋 O QUE FOI CRIADO

### **1. Cliente Supabase Configurado**
📄 `/src/lib/supabase.ts`
- Cliente tipado com TypeScript
- Multi-tenant configurado (empresa_id)
- Helpers para auth e realtime
- Configuração de segurança RLS

### **2. Tipos TypeScript**
📄 `/src/lib/database.types.ts`
- Tipos gerados do schema Supabase
- Inferência automática de tipos
- Suporte a relacionamentos (JOIN)
- Types para INSERT, UPDATE, SELECT

### **3. Hooks Customizados (3)**
📄 `/src/hooks/useSupabase.ts` — Hook genérico
📄 `/src/hooks/useEstoque.ts` — Gestão de estoque
📄 `/src/hooks/useProdutos.ts` — Gestão de produtos OPME

### **4. Componente de Exemplo**
📄 `/src/components/estoque/EstoqueList.tsx`
- Listagem de estoque
- Movimentações (entrada/saída)
- Alertas de estoque baixo
- UI com shadcn/ui

### **5. Configuração de Ambiente**
📄 `/.env.example`
- Variáveis de ambiente configuradas
- Instruções para obter ANON_KEY

---

## 🔑 CONFIGURAÇÃO OBRIGATÓRIA

### **1. Obter ANON_KEY do Supabase**

Acesse o dashboard:
```
https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api
```

Copie a `anon` `public` key e crie o arquivo `.env`:

```bash
# .env (na raiz do projeto)
VITE_SUPABASE_URL=https://gvbkviozlhxorjoavmky.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Cole aqui a key real
VITE_SUPABASE_PROJECT_ID=gvbkviozlhxorjoavmky
```

---

## 📖 COMO USAR

### **Exemplo 1: Listar Estoque**

```typescript
// src/pages/Estoque.tsx
import { EstoqueList } from '@/components/estoque/EstoqueList'

export function EstoquePage() {
  const empresaId = 'uuid-da-empresa' // Obter do contexto/auth
  
  return (
    <div className="container mx-auto p-6">
      <EstoqueList empresaId={empresaId} />
    </div>
  )
}
```

---

### **Exemplo 2: Criar Produto**

```typescript
import { useProdutos } from '@/hooks/useProdutos'

function FormularioProduto() {
  const { createProduto, isSubmitting } = useProdutos()
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await createProduto({
      empresa_id: 'uuid-empresa',
      nome: 'Prótese de Quadril Titanium',
      registro_anvisa: '80278920018',
      fabricante: 'Zimmer Biomet',
      categoria: 'ortopedia',
      ativo: true,
      ponto_reposicao: 5
    })
    
    if (error) {
      alert('Erro ao criar produto')
    } else {
      alert('Produto criado com sucesso!')
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

### **Exemplo 3: Movimentar Estoque**

```typescript
import { useEstoque } from '@/hooks/useEstoque'

function MovimentacaoEstoque() {
  const { movimentarEstoque } = useEstoque()
  
  const handleEntrada = async (estoqueId: string) => {
    const { error } = await movimentarEstoque(
      estoqueId,
      10,        // quantidade
      'entrada'  // tipo
    )
    
    if (!error) {
      alert('Entrada registrada!')
    }
  }
  
  return <button onClick={() => handleEntrada('uuid')}>Entrada +10</button>
}
```

---

### **Exemplo 4: Buscar Produtos com Estoque Baixo**

```typescript
import { useProdutos } from '@/hooks/useProdutos'
import { useEffect, useState } from 'react'

function AlertasEstoque({ empresaId }: { empresaId: string }) {
  const { buscarEstoqueBaixo } = useProdutos()
  const [produtosBaixo, setProdutosBaixo] = useState([])
  
  useEffect(() => {
    async function fetchAlertas() {
      const { data } = await buscarEstoqueBaixo(empresaId)
      setProdutosBaixo(data || [])
    }
    fetchAlertas()
  }, [empresaId])
  
  return (
    <div>
      <h3>Alertas de Estoque Baixo ({produtosBaixo.length})</h3>
      {produtosBaixo.map(produto => (
        <div key={produto.id}>⚠️ {produto.nome}</div>
      ))}
    </div>
  )
}
```

---

### **Exemplo 5: Realtime (Atualização Automática)**

```typescript
import { useSupabaseRealtime } from '@/hooks/useSupabase'

function EstoqueRealtime() {
  useSupabaseRealtime('estoque', (payload) => {
    console.log('Estoque atualizado:', payload)
    
    if (payload.eventType === 'INSERT') {
      alert('Novo item adicionado ao estoque!')
    }
    
    if (payload.eventType === 'UPDATE') {
      alert('Estoque atualizado!')
    }
  })
  
  return <div>Monitorando estoque em tempo real...</div>
}
```

---

## 🧪 TESTAR INTEGRAÇÃO

### **1. Criar dados de teste via Supabase Dashboard**

```sql
-- Supabase Studio > SQL Editor

-- 1. Criar armazém
INSERT INTO public.estoque_armazens (empresa_id, nome, endereco)
VALUES (
  (SELECT id FROM public.empresas LIMIT 1),
  'Armazém Central',
  'Rua Principal, 100'
);

-- 2. Criar produto OPME
INSERT INTO public.produtos_opme (empresa_id, nome, registro_anvisa, fabricante)
VALUES (
  (SELECT id FROM public.empresas LIMIT 1),
  'Prótese de Quadril Titanium',
  '80278920018',
  'Zimmer Biomet'
);

-- 3. Criar estoque
INSERT INTO public.estoque (
  empresa_id,
  produto_id,
  armazem_id,
  quantidade_disponivel,
  status
)
VALUES (
  (SELECT id FROM public.empresas LIMIT 1),
  (SELECT id FROM public.produtos_opme ORDER BY criado_em DESC LIMIT 1),
  (SELECT id FROM public.estoque_armazens ORDER BY criado_em DESC LIMIT 1),
  50,
  'disponivel'
);
```

---

### **2. Testar no frontend**

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

Navegue para a página de estoque e verifique:
- ✅ Lista de produtos carrega
- ✅ Dados aparecem corretamente
- ✅ Botões de entrada/saída funcionam
- ✅ Alertas de estoque baixo aparecem

---

## 🔒 SEGURANÇA E RLS

### **Configurar Empresa Atual (Multi-tenant)**

```typescript
import { setCurrentEmpresa } from '@/lib/supabase'

// No login ou seleção de empresa
await setCurrentEmpresa('uuid-da-empresa')

// Todas as queries agora filtram automaticamente por empresa_id via RLS
```

### **Configurar Role do Usuário**

```typescript
import { setCurrentUserRole } from '@/lib/supabase'

// Após autenticação
await setCurrentUserRole('Admin')  // ou 'Gerente', 'Coordenador'

// RLS policies permitem/bloqueiam operações baseado no role
```

---

## 📊 HOOKS DISPONÍVEIS

### **`useSupabaseQuery`**
```typescript
const { data, loading, error } = useSupabaseQuery('estoque', {
  select: '*',
  filter: { status: 'disponivel' },
  orderBy: { column: 'nome', ascending: true },
  limit: 10
})
```

### **`useEstoque`**
```typescript
const {
  estoques,           // Lista de estoques
  loading,            // Estado de carregamento
  error,              // Erro se houver
  createEstoque,      // Criar novo
  updateEstoque,      // Atualizar
  deleteEstoque,      // Deletar (soft delete)
  movimentarEstoque,  // Entrada/saída
  getEstoquePorProduto // Buscar por produto
} = useEstoque(empresaId)
```

### **`useProdutos`**
```typescript
const {
  produtos,                 // Lista de produtos
  loading,                  // Estado de carregamento
  error,                    // Erro se houver
  createProduto,            // Criar novo
  updateProduto,            // Atualizar
  deleteProduto,            // Deletar (soft delete)
  buscarPorRegistroANVISA,  // Buscar por registro ANVISA
  buscarEstoqueBaixo        // Produtos com estoque baixo
} = useProdutos(empresaId)
```

---

## 🎯 PRÓXIMOS PASSOS

1. **✅ Configurar .env** com ANON_KEY real
2. **✅ Testar componente EstoqueList**
3. **Criar páginas:**
   - `/estoque` — Visualização de estoque
   - `/produtos` — Cadastro de produtos OPME
   - `/movimentacoes` — Histórico de movimentações
4. **Implementar auth:**
   - Login com Supabase Auth
   - Context para empresa_id
   - Proteção de rotas
5. **Adicionar features:**
   - Upload de imagens (Storage)
   - Exportação de relatórios
   - Notificações realtime

---

## 📚 DOCUMENTAÇÃO ADICIONAL

**Supabase:**
- Docs: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky

**Tipo de dados:**
- Ver `/src/lib/database.types.ts` para schema completo

**Migrations aplicadas:**
- Ver `/docs/db/RELATORIO_DEPLOY_MCP_SUPABASE.md`

---

## ✅ CHECKLIST DE INTEGRAÇÃO

- [x] ✅ Cliente Supabase criado
- [x] ✅ Tipos TypeScript gerados
- [x] ✅ Hooks customizados criados
- [x] ✅ Componente de exemplo criado
- [ ] ⚠️  `.env` configurado com ANON_KEY real
- [ ] ⚠️  Dados de teste criados
- [ ] ⚠️  Testado no navegador
- [ ] ⚠️  Auth implementado
- [ ] ⚠️  Context multi-tenant criado

---

**✅ INTEGRAÇÃO FRONTEND COMPLETA!**  
**Pronto para uso após configurar `.env` e obter ANON_KEY.**

🚀 **Bom desenvolvimento!**

