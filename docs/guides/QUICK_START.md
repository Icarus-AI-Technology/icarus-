# 🚀 ICARUS v5.0 - Quick Start Guide

> Guia rápido para iniciar o ICARUS v5.0 em menos de 5 minutos.

---

## ⚡ Início Rápido (3 Passos)

### 1️⃣ Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/icarus-v5.git
cd icarus-v5

# Instale as dependências
npm install
```

### 2️⃣ Configuração

```bash
# Copie o arquivo de ambiente
cp env.example .env

# Edite .env e configure (opcional):
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

### 3️⃣ Executar

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

**Pronto!** Acesse: **http://localhost:3000**

---

## 🎯 Primeiro Acesso

### Credenciais Padrão (Mock)

- **Email:** `admin@newortho.com.br`
- **Senha:** `Admin@123`

> ⚠️ **Nota:** Sistema funciona em modo mock sem Supabase. Para produção, configure o banco de dados.

---

## 📱 Navegação Inicial

### Topbar (Topo)

- **Logo ICARUS** - Página inicial
- **Busca Global** - Atalho: `Ctrl + K` / `Cmd + K`
- **Notificações** - Badge de notificações não lidas
- **Tema** - Toggle claro/escuro
- **Perfil** - Menu do usuário

### Sidebar (Lateral)

- **Dashboard** - Visão geral e KPIs
- **Gestão** - Estoque, Cirurgias, Logística
- **Financeiro** - Faturamento, Contas, NFe
- **CRM** - Vendas e relacionamento
- **Compliance** - Rastreabilidade e auditoria
- **Configurações** - Usuários e sistema

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + K` | Busca global |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + /` | Atalhos de teclado |
| `Ctrl/Cmd + Shift + N` | Nova cirurgia |
| `Ctrl/Cmd + Shift + P` | Novo produto |
| `Ctrl/Cmd + Shift + C` | Novo cliente |
| `Esc` | Fechar modal/drawer |

**Ver todos:** Pressione `Ctrl/Cmd + /`

---

## 🎨 Explorando Módulos

### Dashboard Principal
```
http://localhost:3000/
```
- KPIs em tempo real
- Gráficos interativos
- Cards com IA

### Estoque IA
```
http://localhost:3000/estoque-ia
```
- Gestão inteligente
- Reposição automática
- Alertas preditivos

### Cirurgias
```
http://localhost:3000/cirurgias
```
- Agenda cirúrgica
- Materiais por cirurgia
- Previsão de demanda IA

### CRM & Vendas
```
http://localhost:3000/crm-vendas
```
- Pipeline de vendas
- Recomendações IA
- Métricas de conversão

---

## 🔧 Configurações Recomendadas

### 1. Tema

**Recomendado:** Modo Claro (padrão)

- Design neuromórfico otimizado para light mode
- Contraste WCAG AA garantido
- Toggle: botão no topbar

### 2. Acessibilidade

Ative no menu **Configurações → Acessibilidade:**

- ✅ Screen reader announcements
- ✅ Keyboard navigation
- ✅ High contrast mode (se necessário)

### 3. Notificações

Configure em **Configurações → Notificações:**

- ✅ Desktop notifications
- ✅ Sound alerts
- ✅ Email digest

---

## 📊 Testando Funcionalidades

### Criar um Produto OPME

1. Sidebar → **Gestão de Cadastros**
2. Aba **Produtos OPME**
3. Botão **+ Novo Produto**
4. Preencha o formulário
5. **Salvar**

### Agendar uma Cirurgia

1. Sidebar → **Cirurgias e Procedimentos**
2. Botão **+ Nova Cirurgia**
3. Preencha:
   - Hospital
   - Médico
   - Paciente
   - Data/Hora
   - Materiais
4. **Agendar**

### Ver Insights de IA

1. Dashboard Principal
2. Cards com ícone de cérebro 🧠
3. Clique para ver detalhes
4. Insights são atualizados em tempo real

---

## 🧪 Executar Testes

### Testes Unitários

```bash
npm run test
```

### Testes E2E

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Porta 3000 já está em uso

```bash
# Use outra porta
PORT=3001 npm run dev
```

### Erro ao instalar dependências

```bash
# Limpe o cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Erro de TypeScript

```bash
# Verifique tipos
npm run type-check
```

### Build falha

```bash
# Limpe e rebuild
npm run clean
npm run build
```

---

## 📚 Próximos Passos

### 1. Explorar Documentação

- [Manual do Usuário Completo](./docs/usuario/MANUAL_USUARIO_FINAL_ICARUS_V5.md)
- [OraclusX Design System](./docs/design/INDEX-ORACLUSX-DS.md)
- [Guia de Desenvolvimento](./docs/README.md)

### 2. Configurar Banco de Dados

- [Setup Supabase](./supabase/README_PTBR.md)
- Importar schemas SQL
- Configurar `.env`

### 3. Personalizar Sistema

- Ajustar cores (manter `#6366F1` nos botões)
- Configurar integrações externas
- Adicionar usuários

### 4. Deploy

```bash
# Build para produção
npm run build

# Testar build localmente
npm run preview
```

---

## 🤝 Precisa de Ajuda?

### Recursos

- 📚 [Documentação Completa](./docs/README.md)
- 🎯 [Lista de Módulos](./docs/ICARUS-INDEX-MODULOS.md)
- 🎨 [OraclusX DS](./docs/design/INDEX-ORACLUSX-DS.md)
- 🧪 [Guia de Testes](./docs/testes/GUIA_COMPLETO_TESTES_E2E.md)

### Suporte

- 📧 Email: suporte@icarus.tech
- 📚 Docs: [docs.icarus.tech](https://docs.icarus.tech)

---

## ✅ Checklist de Início

- [ ] Instalação concluída (`npm install`)
- [ ] `.env` configurado
- [ ] Servidor rodando (`npm run dev`)
- [ ] Acesso em http://localhost:3000
- [ ] Login realizado
- [ ] Dashboard visualizado
- [ ] Módulos explorados
- [ ] Atalhos de teclado testados
- [ ] Tema configurado
- [ ] Primeira cirurgia criada

---

**Versão:** 5.0.2  
**Última Atualização:** 17 de outubro de 2025

© 2025 ICARUS v5.0 - Icarus AI Technology
