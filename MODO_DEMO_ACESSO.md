# 🔐 MODO DEMO - ACESSO ICARUS v5.0

**Status:** ✅ MODO MOCK ATIVO  
**Data:** 26 de Janeiro de 2025

---

## 🎯 CREDENCIAIS DE ACESSO (MODO DEMO)

### ✅ Opção 1 (Principal)

```
Email:  dax@newortho.com.br
Senha:  Admin@123456!
```

### ✅ Opção 2 (Alternativa)

```
Email:  dax@newortho.com.br
Senha:  admin123
```

### ✅ Opção 3 (Admin Alternativo)

```
Email:  admin@icarus.com
Senha:  admin123
```

---

## 🌐 COMO ACESSAR

### Passo 1: Abrir o Sistema

```
http://localhost:5173
```

### Passo 2: Fazer Login

1. Você verá o banner azul: **"🔧 MODO DEMO ATIVO"**
2. Digite: `dax@newortho.com.br`
3. Senha: `Admin@123456!`
4. Clique em "Entrar no Sistema"

### Passo 3: Sistema Carregado! ✅

- Dashboard Principal aparecerá
- Acesso total a todos os 62 módulos
- Navegação completa

---

## 🔧 O QUE É O MODO MOCK?

### Autenticação Offline

```
✅ Funciona SEM conexão com Supabase
✅ Credenciais mockadas localmente
✅ Sessão salva no localStorage
✅ Acesso total ao sistema (role admin)
✅ Perfeito para desenvolvimento/demo
```

### Dados Mockados

```yaml
Usuário:
  Nome: Dax Meneghel (DEMO)
  Email: dax@newortho.com.br
  Cargo: CEO
  Role: admin
  Permissões: SYSTEM_ALL (acesso total)

Empresa:
  Nome: NewOrtho DEMO
  CNPJ: 00.000.000/0001-00
  Status: ativa
```

---

## ✅ VALIDAÇÃO DO MODO MOCK

### Console do Navegador (F12)

Você verá:

```
🔧 useAuth: MODO MOCK ativo - pulando verificação Supabase
🔧 useAuth: Modo MOCK - pulando onAuthStateChange listener
🔧 useAuth: MODO MOCK ativado
✅ MOCK MODE: Login bem-sucedido!
```

### Banner na Tela

```
🔧 MODO DEMO ATIVO
Use: dax@newortho.com.br / Admin@123456!
```

---

## 🔄 COMO DESATIVAR MODO MOCK

### Se quiser voltar para Supabase real:

#### Opção 1: Via Console do Navegador

```javascript
// Abra Console (F12) e execute:
localStorage.removeItem("icarus_use_mock_auth");
localStorage.removeItem("sb-auth-token");
location.reload();
```

#### Opção 2: Via .env

```bash
# Edite .env e mude para:
VITE_USE_MOCK_AUTH=false

# Reinicie o servidor:
# Ctrl+C no terminal
pnpm dev
```

---

## 🎨 FUNCIONALIDADES DISPONÍVEIS

### Com Modo Mock Você Tem Acesso a:

```
✅ Dashboard Principal (/dashboard)
✅ 62 Módulos Completos
✅ Arquitetura (/arquitetura) ⭐
✅ Fluxo de Agentes (/agentes) ⭐
✅ Integrações (/integracoes-diagrama) ⭐
✅ Camada de Dados (/camada-dados) ⭐
✅ EDR Research (/edr-research) ⭐
✅ Cirurgias
✅ Estoque
✅ Financeiro
✅ Compliance
✅ E todos os outros módulos!
```

### ⚠️ Limitações do Modo Mock

```
⚠️ Dados são estáticos (não salvam no banco)
⚠️ Sem realtime updates
⚠️ Sem integração com APIs externas
⚠️ Edge Functions não funcionam
⚠️ Upload de arquivos simulado

Mas ideal para:
✅ Demonstrações
✅ Desenvolvimento de UI
✅ Testes de navegação
✅ Exploração do sistema
```

---

## 🚀 QUICK START

```bash
# 1. Servidor já está rodando em background
# Acesse: http://localhost:5173

# 2. Login com:
Email: dax@newortho.com.br
Senha: Admin@123456!

# 3. Pronto! Dashboard carregado ✅
```

---

## 🐛 TROUBLESHOOTING

### "Failed to fetch" ainda aparece

```
Solução:
1. Abra console do navegador (F12)
2. Execute: localStorage.setItem('icarus_use_mock_auth', 'true')
3. Recarregue a página (F5)
4. Tente login novamente
```

### Login não funciona

```
Verifique:
✅ Email exato: dax@newortho.com.br (minúsculas)
✅ Senha exata: Admin@123456! (case-sensitive)
✅ Banner azul aparece na tela
✅ Console mostra "MODO MOCK ativo"
```

### Redirecionamento não funciona

```
Após login bem-sucedido:
- Sistema deve redirecionar para /dashboard
- Se não redirecionar, vá manualmente: http://localhost:5173/dashboard
```

---

## 📊 STATUS ATUAL

```yaml
Frontend: ✅ Rodando (port 5173)
Vite: ✅ v5.4.21
Modo Mock: ✅ Ativado
Banner Visível: ✅ Sim
Credenciais: ✅ Configuradas
Sistema: ✅ 100% Funcional (mock mode)
```

---

## 🎯 RESUMO

```
╔═══════════════════════════════════════════╗
║   🔧 MODO DEMO ATIVO - ACESSO LIVRE       ║
╠═══════════════════════════════════════════╣
║                                           ║
║  URL:   http://localhost:5173             ║
║  Email: dax@newortho.com.br               ║
║  Senha: Admin@123456!                     ║
║                                           ║
║  Status: ✅ PRONTO PARA USAR              ║
║                                           ║
╚═══════════════════════════════════════════╝
```

---

**Documento gerado em:** 26/01/2025  
**Sistema:** ICARUS v5.0 (OraclusX)  
**Modo:** DEMO/MOCK (Offline)  
**Status:** ✅ Funcional

---

# 🚀 ACESSE AGORA E FAÇA LOGIN!

**http://localhost:5173**
