# 🚀 Quick Start - ICARUS v5.0 Production

## Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta Supabase (gratuita ou pro)
- Certificado Digital A1/A3 (SEFAZ) - opcional para homologação

## Setup Rápido (5 minutos)

```bash
# 1. Clone o projeto (se ainda não tiver)
git clone <seu-repo>
cd icarus-make

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais Supabase:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-anon-key

# 4. Aplique migrations no Supabase
npx supabase db push

# 5. Inicie em desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

## Deploy Production

### Opção A: Vercel (Recomendado)

```bash
# 1. Instale Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configure env vars no dashboard Vercel
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### Opção B: Netlify

```bash
# 1. Build
npm run build

# 2. Deploy via Netlify CLI ou dashboard
netlify deploy --prod --dir=dist
```

## Configurações Pós-Deploy

### 1. Supabase
- Ativar Row Level Security (RLS)
- Configurar SMTP (email transacional)
- Habilitar Realtime nas tabelas necessárias

### 2. APIs Externas
- SEFAZ: Certificado A1/A3
- ANVISA: Sem API key necessária
- CFM: Scraping (Puppeteer)
- Microsoft 365: OAuth credentials

### 3. Usuários Iniciais
```sql
-- Criar primeiro admin
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador completo');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u, roles r
WHERE u.email = 'admin@empresa.com'
  AND r.name = 'admin';
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Dev server (port 5173)
npm run build           # Build production
npm run preview         # Preview build

# Testes
npm run test            # Unit tests (Vitest)
npm run test:e2e        # E2E tests (Playwright)
npm run test:coverage   # Coverage report

# Lint
npm run lint            # ESLint
npm run typecheck       # TypeScript check

# Supabase
npx supabase start      # Local Supabase
npx supabase db push    # Apply migrations
npx supabase db reset   # Reset DB (cuidado!)
```

## Credenciais Padrão

**IMPORTANTE**: Altere após primeiro login!

- Email: `admin@icarus.com.br`
- Senha: `Icarus@2025!`

## Suporte

- 📧 Email: suporte@icarus.com.br
- 📚 Docs: `/docs/modulos/`
- 🐛 Issues: GitHub Issues

---

**Versão**: 5.0  
**Status**: ✅ Production Ready

