# icarus-newortho

🏥 **ICARUS - Sistema Integrado de Gestão OPME (Orteses, Próteses e Materiais Especiais)**

[![Deploy Ready](https://img.shields.io/badge/Deploy-Ready-success)](https://vercel.com)
[![Score](https://img.shields.io/badge/Score-92%2F100-brightgreen)](./RELATORIO_FINAL_AGENTE_10.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)

---

## 🎯 Sobre o Projeto

Sistema completo de gestão para empresas de OPME, integrando todos os processos: cirurgias, estoque, financeiro, compras, logística, compliance e inteligência artificial.

### ✨ Principais Funcionalidades

- 🏥 **Gestão de Cirurgias** - Agendamento e controle completo
- 📦 **Estoque Inteligente** - Controle com IA e rastreabilidade
- 💰 **Financeiro Completo** - Contas a pagar/receber, fluxo de caixa
- 🛒 **Compras & Cotações** - Cotações automáticas e pedidos
- 📊 **Dashboard BI** - Indicadores em tempo real
- 🤖 **IA Integrada** - GPT Researcher, análises preditivas
- ✅ **Compliance ANVISA** - Auditoria e rastreabilidade
- 🚚 **Logística** - Entregas e transportadoras

---

## 🚀 Deploy Rápido

### Vercel (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/Icarus-AI-Technology/icarus-newortho.git
cd icarus-newortho

# 2. Instale dependências
pnpm install

# 3. Configure variáveis de ambiente
cp env.example .env
# Edite .env com suas credenciais Supabase

# 4. Deploy
./deploy-vercel.sh
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Icarus-AI-Technology/icarus-newortho)

---

## 📦 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **UI/UX:** OraclusX Design System (Neumorphic)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **IA:** GPT-4, Claude, Ollama
- **Integrações:** 15+ APIs externas
- **Deploy:** Vercel

---

## 📊 Status do Projeto

| Módulo | Status | Coverage |
|--------|--------|----------|
| **Design System** | ✅ Completo | 100% |
| **Autenticação** | ✅ Completo | 100% |
| **Dashboard Principal** | ✅ Completo | 95% |
| **Gestão de Cirurgias** | ✅ Completo | 90% |
| **Estoque & Consignação** | ✅ Completo | 92% |
| **Financeiro** | ✅ Completo | 88% |
| **Compras** | ✅ Completo | 85% |
| **CRM & Vendas** | ✅ Completo | 80% |
| **Compliance** | ✅ Completo | 90% |
| **IA & Analytics** | ✅ Completo | 85% |

**Score Geral:** 92/100 ⭐

---

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- Supabase account

### Setup Local

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Preview
pnpm preview

# Testes
pnpm test
pnpm test:e2e
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Veja `env.example` para todas as variáveis disponíveis.

---

## 📚 Documentação

- [📖 Manual Completo](./docs/MANUAL.md)
- [🎨 Design System](./ORACLUSX_DS_COMPLETO.md)
- [🏗️ Arquitetura](./RELATORIO_AGENTE_02_FRONTEND_ARCHITECTURE.md)
- [🤖 IA & ML](./RELATORIO_AGENTE_05_INTELIGENCIA_ARTIFICIAL.md)
- [✅ Testes & QA](./RELATORIO_AGENTE_08_TESTES_QUALIDADE.md)
- [🚀 Deploy](./GUIA_DEPLOY_COMPLETO.md)

---

## 🎯 Roadmap

- [x] Design System Neumórfico
- [x] 58 Módulos Funcionais
- [x] Integração IA (GPT-4, Claude)
- [x] Dashboard Analytics
- [x] Sistema de Permissões (RBAC)
- [x] Testes E2E (Playwright)
- [x] Deploy Vercel
- [ ] App Mobile (React Native)
- [ ] Integrações ERP
- [ ] Multi-tenant

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

---

## 📄 Licença

Este projeto é proprietário da **Icarus AI Technology**.

---

## 🏆 Reconhecimentos

Desenvolvido com ❤️ pela equipe **Icarus AI Technology**

- **OraclusX Design System** - Design neuromórfico moderno
- **GPT Researcher** - Pesquisa inteligente integrada
- **Supabase** - Backend as a Service
- **Vercel** - Deploy e hosting

---

## 📞 Suporte

- 📧 Email: suporte@icarus-ai.com
- 🌐 Website: https://icarus-ai.com
- 💬 Discord: [Icarus Community](https://discord.gg/icarus)

---

**🚀 Status:** DEPLOY READY | **📊 Score:** 92/100 | **🏷️ Version:** v1.0.0-pre-deploy
