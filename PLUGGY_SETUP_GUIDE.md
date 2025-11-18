# 🔌 PLUGGY — GUIA DE SETUP E ATIVAÇÃO

**Sistema**: ICARUS v5.0 — Gestão elevada pela IA  
**Data**: 20 de Outubro de 2025  
**Objetivo**: Ativar integração Pluggy (Open Finance Brasil)

---

## 📋 ÍNDICE

1. [Status Atual](#status-atual)
2. [O Que É o Pluggy](#o-que-é-o-pluggy)
3. [Como Obter Credenciais](#como-obter-credenciais)
4. [Passo a Passo de Ativação](#passo-a-passo-de-ativação)
5. [Configuração do Backend](#configuração-do-backend)
6. [Configuração do Frontend](#configuração-do-frontend)
7. [Teste da Integração](#teste-da-integração)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 STATUS ATUAL

### ✅ O Que Já Está Pronto

- ✅ `PluggyService.ts` completo (src/services/integrations/PluggyService.ts)
- ✅ Tipos TypeScript (src/types/pluggy/index.ts)
- ✅ Migrações Supabase (supabase/migrations/20251020_pluggy_tables.sql)
- ✅ Documentação completa (docs/PLUGGY_GUIA_IMPLEMENTACAO_COMPLETO.md)
- ✅ Sistema funcionando em **modo MOCK** (dados fake para desenvolvimento)

### ⏸️ O Que Precisa Ser Ativado

- ⏸️ Obter credenciais da Pluggy (Client ID + Secret)
- ⏸️ Configurar variáveis de ambiente
- ⏸️ Instalar SDK: `npm install pluggy-sdk`
- ⏸️ Descomentar código de integração
- ⏸️ Testar conexão com banco real

---

## 🏦 O QUE É O PLUGGY

O **Pluggy** é uma plataforma de **Open Finance Brasil** que permite:

✅ **Conectar contas bancárias** de 150+ instituições  
✅ **Sincronizar transações** automaticamente  
✅ **Iniciar pagamentos PIX** direto do sistema  
✅ **Criar cobranças recorrentes**  
✅ **Acessar dados de investimentos**  
✅ **Consultar identidade (KYC)**

### Casos de Uso no ICARUS

1. **Dashboard Financeiro**: Saldo consolidado de todas as contas
2. **Contas a Pagar**: Pagamentos PIX em lote
3. **Contas a Receber**: Cobranças recorrentes para cirurgias
4. **Faturamento OPME**: Conciliação bancária automática
5. **Análise Financeira**: LLM analisa transações e identifica anomalias

---

## 🔑 COMO OBTER CREDENCIAIS

### Passo 1: Criar Conta

1. Acesse: **https://dashboard.pluggy.ai/**
2. Clique em **"Sign Up"**
3. Preencha:
   - Nome completo
   - Email corporativo
   - Senha forte
   - Nome da empresa: **ICARUS DISTRIBUIDORA LTDA**
4. Confirme seu email

### Passo 2: Criar Aplicação

1. No dashboard, clique em **"Create Application"**
2. Preencha:
   - **Application Name**: ICARUS v5.0
   - **Environment**: Sandbox (para testes) ou Production
   - **Webhook URL**: `https://seu-dominio.com.br/api/pluggy/webhooks`
3. Clique em **"Create"**

### Passo 3: Obter Credenciais

1. Clique na aplicação criada
2. Vá em **"API Keys"**
3. Copie:
   - **Client ID**: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`
   - **Client Secret**: `abcdefghijklmnopqrstuvwxyz123456`

⚠️ **IMPORTANTE**: O **Client Secret** só é mostrado **uma vez**! Guarde em local seguro.

---

## 🚀 PASSO A PASSO DE ATIVAÇÃO

### Etapa 1: Instalar SDK

```bash
cd /Users/daxmeneghel/icarus-v5.0
npm install pluggy-sdk --save --legacy-peer-deps
```

### Etapa 2: Configurar Variáveis de Ambiente

Edite `.env.local` (ou crie se não existir):

```bash
# Copiar do .env.example
cp .env.example .env.local

# Editar
nano .env.local
```

Preencha as variáveis do Pluggy:

```bash
# PLUGGY (Open Finance Brasil)
VITE_PLUGGY_ENABLED=true  # ⬅️ Mudar para true!
VITE_PLUGGY_CLIENT_ID=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
VITE_PLUGGY_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Sandbox (para testes) ou Production
VITE_PLUGGY_BASE_URL=https://api.sandbox.pluggy.ai
# VITE_PLUGGY_BASE_URL=https://api.pluggy.ai  # ⬅️ Produção (depois)
```

Salve e feche (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Etapa 3: Descomentar Código de Integração

Abra `src/services/integrations/PluggyService.ts` e descomente as importações:

```typescript
// ❌ ANTES (comentado)
// import { PluggyClient } from 'pluggy-sdk';
//
// const pluggy = new PluggyClient({
//   clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID || '',
//   clientSecret: import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '',
// });

// ✅ DEPOIS (descomentado)
import { PluggyClient } from 'pluggy-sdk';

const pluggy = new PluggyClient({
  clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_PLUGGY_CLIENT_SECRET || '',
});
```

Depois, descomente **TODOS** os blocos de código marcados com:

```typescript
// 🔧 INTEGRAÇÃO REAL (descomente quando ativado)
```

### Etapa 4: Executar Migrations

```bash
# Conectar ao Supabase
npx supabase db push

# Ou aplicar manualmente:
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20251020_pluggy_tables.sql
```

### Etapa 5: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## ⚙️ CONFIGURAÇÃO DO BACKEND

### Registrar Webhooks

Após ativar, configure a URL de webhooks no dashboard da Pluggy:

1. Acesse: **https://dashboard.pluggy.ai/**
2. Clique na sua aplicação
3. Vá em **"Webhooks"**
4. Adicione URL: `https://seu-dominio.com.br/api/pluggy/webhooks`
5. Selecione eventos:
   - `item/created`
   - `item/updated`
   - `item/deleted`
   - `item/error`
   - `payment/approved`
   - `payment/rejected`

### Criar Rota de Webhooks (se ainda não existir)

```typescript
// server/routes/pluggy.ts
router.post('/webhooks', async (req, res) => {
  try {
    await PluggyService.handleWebhook(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 🎨 CONFIGURAÇÃO DO FRONTEND

### 1. Carregar SDK no HTML

Adicione no `index.html`:

```html
<!-- Pluggy Connect Widget -->
<script src="https://cdn.pluggy.ai/pluggy-connect/v1.4.0/pluggy-connect.js"></script>
```

### 2. Usar o Widget

```tsx
import { PluggyConnectWidget } from '@/components/pluggy/PluggyConnectWidget';

function DashboardFinanceiro() {
  const [showWidget, setShowWidget] = useState(false);
  
  const handleSuccess = (itemId: string) => {
    console.log('Banco conectado:', itemId);
    // Recarregar contas
    loadAccounts();
  };
  
  return (
    <div>
      <button onClick={() => setShowWidget(true)}>
        Conectar Banco
      </button>
      
      {showWidget && (
        <PluggyConnectWidget
          onSuccess={handleSuccess}
          onError={(error) => console.error(error)}
        />
      )}
    </div>
  );
}
```

---

## ✅ TESTE DA INTEGRAÇÃO

### Teste 1: Verificar Configuração

```typescript
// No console do navegador (F12)
console.log('Pluggy Enabled:', import.meta.env.VITE_PLUGGY_ENABLED);
console.log('Pluggy Client ID:', import.meta.env.VITE_PLUGGY_CLIENT_ID);

// Deve mostrar:
// Pluggy Enabled: true
// Pluggy Client ID: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

### Teste 2: Criar Connect Token

```typescript
import { PluggyService } from '@/services/integrations/PluggyService';

const token = await PluggyService.createConnectToken('user-123');
console.log('Token:', token);

// Deve retornar:
// {
//   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   expiresAt: "2025-10-20T15:30:00.000Z"
// }
```

### Teste 3: Conectar Banco no Sandbox

1. Clique em **"Conectar Banco"**
2. Widget abre com lista de bancos
3. Selecione **"Itaú (Sandbox)"** (banco de teste)
4. Credenciais de teste:
   - Usuário: `user-sandbox`
   - Senha: `password-sandbox`
5. Confirme a conexão
6. Aguarde sincronização (~30 segundos)
7. Verifique se contas aparecem no dashboard

### Teste 4: Verificar Dados no Supabase

```sql
-- Ver conexões criadas
SELECT * FROM pluggy_items;

-- Ver contas sincronizadas
SELECT * FROM pluggy_accounts;

-- Ver transações (últimos 30 dias)
SELECT * FROM pluggy_transactions
ORDER BY date DESC
LIMIT 50;
```

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Cannot find module 'pluggy-sdk'"

**Causa**: SDK não instalado  
**Solução**:

```bash
npm install pluggy-sdk --save --legacy-peer-deps
```

### Problema 2: "Client ID não configurado"

**Causa**: Variáveis de ambiente não carregadas  
**Solução**:

1. Verifique `.env.local`
2. Reinicie o servidor (`npm run dev`)
3. Limpe cache do navegador (Ctrl+Shift+R)

### Problema 3: Widget não abre

**Causa**: Script não carregado  
**Solução**:

1. Verifique `index.html` tem o script CDN
2. Abra console do navegador (F12)
3. Verifique se `window.PluggyConnect` existe
4. Se não existir, adicione o script

### Problema 4: Erro 401 Unauthorized

**Causa**: Credenciais inválidas  
**Solução**:

1. Verifique Client ID e Secret no dashboard Pluggy
2. Copie novamente (sem espaços)
3. Cole em `.env.local`
4. Reinicie o servidor

### Problema 5: Webhooks não chegam

**Causa**: URL incorreta ou servidor não público  
**Solução**:

1. Para desenvolvimento local, use **ngrok**:
   ```bash
   ngrok http 3000
   ```
2. Copie URL pública: `https://abc123.ngrok.io`
3. Configure no dashboard: `https://abc123.ngrok.io/api/pluggy/webhooks`

### Problema 6: Sandbox vs Production

**Diferença**:
- **Sandbox**: Bancos fake para testes (gratuito)
- **Production**: Bancos reais (cobra por transação)

**URL**:
- Sandbox: `https://api.sandbox.pluggy.ai`
- Production: `https://api.pluggy.ai`

Mude apenas quando estiver pronto para produção!

---

## 📊 MONITORAMENTO

### Dashboard Pluggy

Acesse **https://dashboard.pluggy.ai/** para:

- ✅ Ver total de conexões
- ✅ Monitorar status das sincronizações
- ✅ Ver logs de webhooks
- ✅ Analisar uso da API
- ✅ Ver faturamento (em produção)

### Logs no ICARUS

```typescript
// Ativar logs detalhados
localStorage.setItem('PLUGGY_DEBUG', 'true');

// Ver logs
console.log(PluggyService.logs);
```

---

## 💰 PLANOS E CUSTOS

### Sandbox (Desenvolvimento)

✅ **Gratuito** (ilimitado)  
✅ Bancos fake para testes  
✅ Todos os recursos disponíveis  
❌ Não funciona com bancos reais

### Growth (Recomendado para ICARUS)

💰 **~R$ 200-300/mês** (base)  
💳 **+ R$ 0,50/transação PIX**  
📊 Até 500 contas conectadas  
✅ Dados ilimitados  
✅ Webhooks em tempo real  
✅ Suporte prioritário  
✅ SLA 99,9%

### Enterprise (Grandes Volumes)

💰 **Contato comercial**  
✅ Contas ilimitadas  
✅ Taxas personalizadas  
✅ Suporte dedicado  
✅ SLA 99,95%

---

## ✅ CHECKLIST DE ATIVAÇÃO

### Antes de Ativar

- [ ] Criar conta no Pluggy
- [ ] Obter Client ID e Secret
- [ ] Instalar `pluggy-sdk`
- [ ] Configurar `.env.local`
- [ ] Executar migrations Supabase

### Código

- [ ] Descomentar importação de `PluggyClient`
- [ ] Descomentar todos os blocos de integração
- [ ] Adicionar script CDN no `index.html`
- [ ] Configurar webhook URL no backend

### Testes

- [ ] Verificar variáveis no console
- [ ] Criar Connect Token com sucesso
- [ ] Conectar banco sandbox
- [ ] Ver contas no dashboard
- [ ] Ver transações sincronizadas
- [ ] Verificar dados no Supabase

### Produção

- [ ] Mudar para API de produção
- [ ] Configurar webhooks com URL pública
- [ ] Testar com banco real
- [ ] Monitorar custos no dashboard
- [ ] Configurar alertas de erro

---

## 📚 REFERÊNCIAS

- **Dashboard Pluggy**: https://dashboard.pluggy.ai/
- **Documentação Oficial**: https://docs.pluggy.ai/
- **Repositório Quickstart**: https://github.com/pluggyai/quickstart
- **Suporte**: suporte@pluggy.ai
- **Status da API**: https://status.pluggy.ai/

- **Documentação ICARUS**:
  - `docs/PLUGGY_GUIA_IMPLEMENTACAO_COMPLETO.md`
  - `docs/LLM_AGENTE_FINANCEIRO_AVANCADO.md`
  - `docs/ESTRATEGIA_APIS_INTEGRACOES.md`

---

**🎉 Boa sorte com a integração!**

*Desenvolvido com ❤️ pela equipe ICARUS v5.0*  
**Gestão elevada pela IA**

