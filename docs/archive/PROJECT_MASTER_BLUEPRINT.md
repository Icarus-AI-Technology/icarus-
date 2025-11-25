# PROJECT_MASTER_BLUEPRINT.md

> **Fonte Única de Verdade (SSOT)** - Icarus v5.0
> *Atualizado em: 23/11/2025*

Este documento consolida a visão arquitetural, decisões de design, estrutura de dados e padrões de código do projeto Icarus v5.0. Deve ser utilizado como referência absoluta para desenvolvimento, manutenção e expansão do sistema.

---

## 1. Visão Geral do Projeto

### Nome
**Icarus v5.0**

### Missão
Desenvolver um ecossistema de gestão para uma distribuidora de dispositivos médicos de acordo com as normas da Anvisa atualizadas, rastreabilidade, lgpd, de alta fidelidade (High-Fidelity Management System), integrando UX "Dark Glass" imersiva com inteligência artificial preditiva. O objetivo é transformar a gestão de clínicas e hospitais, reduzindo a carga cognitiva operacional através de interfaces intuitivas e agentes autônomos que auxiliam na tomada de decisão.

### Status Atual
**Estável/Otimizado (Pós-Auditoria)**
- O sistema passou por uma auditoria completa de design e performance.
- Design System "OraclusX" consolidado com tema Dark/Neumorphic.
- Componentes principais refatorados para performance e acessibilidade.
- Hard Gates de qualidade (Linter/TypeScript) ativos e bloqueantes.

---

## 2. Design System & UX (Frontend)

### Estética: "Dark Glass / Cyberpunk Clean"
O sistema utiliza uma identidade visual sofisticada, focada em ambientes com pouca luz para reduzir cansaço visual (Dark Mode First).

- **Paleta de Cores Principal:**
  - **Background:** `#0f111a` (Profundo, quase preto, para imersão).
  - **Cards/Surface:** `#181b29` (Sutilmente mais claro, base dos elementos).
  - **Primary/Accent:** `indigo-600` / `#4f46e5` (Ações principais, destaques).
  - **Text Primary:** `#f8fafc` (Slate-50 - Leitura clara).
  - **Text Secondary:** `#94a3b8` (Slate-400 - Metadados).

- **Efeitos Visuais:**
  - **Glassmorphism:** Uso de `backdrop-blur-md` e `bg-opacity` para criar profundidade e hierarquia.
  - **Shadow Glow:** Sombras coloridas e difusas (`shadow-indigo-500/20`) para indicar interatividade e foco.
  - **Neumorphism (Dark):** Elementos de input e botões com relevo sutil usando sombras claras e escuras (`neumorphic-shadow-dark`, `neumorphic-shadow-light`).

### Componentes Chave
1.  **Layout Flutuante:** Estrutura principal que isola o conteúdo em "ilhas" de vidro sobre o fundo profundo.
2.  **Sidebar Inteligente (IcarusSidebar):** Navegação retrátil com ícones Lucide, tooltips e indicação de estado ativo com brilho (glow).
3.  **Modal com Backdrop Blur:** Diálogos de foco que desfocam o fundo, garantindo atenção total à tarefa (ex: Formulários de Cadastro).
4.  **AIChatWidget:** Assistente flutuante sempre disponível, com animações de "pulso" e interface conversacional estilo chat.
5.  **StatsGrid & KPICard:**Grid responsivo de indicadores com suporte a tendências (trends) visuais e ícones coloridos.

### Stack Tecnológica (Frontend)
- **Core:** React 18+, TypeScript.
- **Build:** Vite (com `@tailwindcss/vite` - Tailwind v4).
- **Estilização:** Tailwind CSS, CSS Modules (para animações específicas em `globals.css`).
- **Ícones:** Lucide React.
- **Visualização de Dados:** Recharts (Gráficos de área, pizza, linha).
- **Roteamento:** React Router DOM v6.
- **Gerenciamento de Estado:** React Hooks (useState, useEffect, Context API).
- **Formulários:** React Hook Form + Zod (inferred).

---

## 3. Arquitetura de Dados (Backend Simulado/Planejado)

*Baseado na estrutura de dados mockados no frontend, este é o schema recomendado para implementação em Supabase/PostgreSQL.*

### Diagrama ER (Definição de Tabelas)

#### `users` (Autenticação & Perfil)
Tabela estendida do `auth.users` do Supabase.
- `id` (UUID, PK): Vínculo com Auth.
- `full_name` (Text): Nome de exibição (ex: "Roberto Silva").
- `role` (Enum): 'admin', 'manager', 'seller', 'doctor'.
- `avatar_url` (Text): URL da imagem no Storage.
- `preferences` (JSONB): Configurações de tema, notificações, etc.
- `created_at` (Timestamp).

#### `doctors` (Cadastros Médicos)
Baseado em `MedicoFormData`.
- `id` (UUID, PK).
- `full_name` (Text): Nome completo.
- `cpf` (Text, Unique): CPF (opcional na validação, mas ideal para unicidade).
- `rg` (Text).
- `birth_date` (Date).
- `crm` (Text): Número do conselho.
- `crm_uf` (Char(2)): Estado do conselho.
- `specialty` (Text): Especialidade médica.
- `ans_register` (Text, Nullable).
- `phone` (Text).
- `mobile` (Text): Contato principal (WhatsApp).
- `email` (Text): Email de contato.
- `linkedin_url` (Text, Nullable).
- `address_data` (JSONB): { logradouro, numero, bairro, cidade, uf, cep }.
- `bank_data` (JSONB): { banco, agencia, conta, pix }.
- `notes` (Text).
- `status` (Enum): 'active', 'inactive', 'pending'.
- `created_by` (UUID, FK): Referência a `users`.

#### `financial_metrics` (Analytics Financeiro)
Para alimentar os gráficos de Área e Barras.
- `id` (UUID, PK).
- `period_date` (Date): Data de referência (mês/ano).
- `revenue` (Decimal): Faturamento bruto.
- `expenses` (Decimal): Despesas operacionais.
- `net_profit` (Decimal): Lucro líquido.
- `category` (Text): Segmentação (ex: "Cirurgias", "Consultas").

#### `system_stats` (KPIs do Dashboard)
Para alimentar os `KPICards`.
- `id` (UUID, PK).
- `kpi_key` (Text, Unique): Chave identificadora (ex: 'monthly_surgeries', 'active_doctors').
- `value` (Decimal/Integer): Valor atual.
- `trend_value` (Decimal): Valor de tendência (ex: 12.5 para +12.5%).
- `trend_period` (Text): Label da tendência (ex: "vs. mês anterior").
- `updated_at` (Timestamp).

### Storage (Buckets)
- **`avatars`**: Imagens de perfil de usuários e médicos (Público: Leitura, Restrito: Escrita).
- **`documents`**: Documentos anexados aos cadastros (Restrito: Leitura/Escrita apenas p/ usuários autorizados).

---

## 4. Funcionalidades & Módulos

### Dashboard Principal (`/dashboard`)
- **KPIs (StatsGrid):** Exibição de métricas chave (Faturamento, Cirurgias, Novos Clientes) com indicadores de tendência de alta/baixa.
- **Gráficos:**
  - **Evolução Financeira:** Gráfico de Área (Recharts) mostrando receita vs. despesas.
  - **Distribuição de Receita:** Gráfico de Pizza (Donut) por especialidade ou categoria.
- **Status Line:** Rodapé fixo ou integrado mostrando status do sistema e conexões ativas.

### Módulo de Cadastros (`/cadastros`)
- **Tabela Inteligente:** Listagem de médicos com filtros, paginação e ações rápidas (Editar, Excluir).
- **Formulário Modal (`CadastroMedicos`):**
  - **Validação em Tempo Real:** Feedback visual imediato para campos obrigatórios e formatos inválidos (CPF, Email).
  - **Detecção de Duplicatas:** Verifica CRM/Nome antes de salvar para evitar redundância.
  - **API CEP:** Preenchimento automático de endereço.
  - **UX:** Feedback de carregamento (`Loader2`) e toasts de sucesso/erro (`sonner`).

### Navegação
- `/login`: Autenticação.
- `/dashboard`: Visão geral.
- `/cadastros`: Gestão de entidades (Médicos, Pacientes, etc.).
- `/analytics`: Relatórios detalhados (mockados ou futuros).
- `/config`: Configurações do sistema e perfil.

---

## 5. Inteligência Artificial (Agentes)

### Icarus AI Widget
- **Interface:** Widget flutuante no canto inferior direito (`fixed bottom-6 right-6`).
- **Estados:**
  - **Colapsado:** Botão circular ("FAB") com ícone de chat e gradiente.
  - **Expandido:** Janela de chat completa com histórico, input e header.
  - **Minimizado:** Barra de título discreta para manter contexto sem ocupar tela.
- **Funcionalidade:** Atua como assistente de primeira linha ("Copilot") para tirar dúvidas sobre o sistema, buscar dados rápidos (ex: "Quantas cirurgias hoje?") ou suporte técnico.
- **Integração (Atual):** Mockada/Simulada via `useChatbot` hook.
- **Integração (Target):** OpenAI API (GPT-4o) ou Anthropic (Claude 3.5 Sonnet) via Edge Functions.

### Integração Futura
- **Análise Preditiva:** Sugerir estoques baixos ou prever faturamento futuro no módulo Analytics.
- **Preenchimento Inteligente:** OCR em documentos de médicos para preencher formulários automaticamente.

---

## 6. Segurança & RLS (Row Level Security)

*Políticas recomendadas para implementação no Supabase:*

1.  **Leitura Global (Read):**
    - `users`: Usuário vê apenas seu próprio perfil.
    - `system_stats`: Todos os usuários autenticados podem ver.
2.  **Segmentação de Dados (Doctors/Financial):**
    - **Role `admin` / `manager`:** Acesso total (CRUD) a todos os registros.
    - **Role `seller`:** Pode ver/editar apenas médicos que ele criou (`created_by = auth.uid()`).
    - **Role `viewer`:** Apenas leitura (SELECT).
3.  **Storage:**
    - Políticas estritas para garantir que apenas usuários autenticados façam upload.

---

## 7. APIs e Integrações

### Endpoints Necessários (REST/RPC)
- **Médicos:**
  - `GET /api/doctors`: Listagem com filtros.
  - `GET /api/doctors/:id`: Detalhes.
  - `POST /api/doctors`: Criação (com validação de duplicidade).
  - `PUT /api/doctors/:id`: Atualização.
- **Dashboard:**
  - `GET /api/dashboard/metrics`: Retorna KPIs consolidados.
  - `GET /api/dashboard/financial-chart`: Dados para o gráfico de área.
- **Serviços Externos:**
  - **BrasilAPI / ViaCEP:** Consulta de CEP.
  - **CNPJ/CFM API (Futuro):** Validação oficial de CRM e CNPJ.

---

## 8. Auditoria e Qualidade

### Regras de Linter & Code Quality
O projeto segue regras estritas definidas em `eslint.config.js` e `tsconfig.json`:
- **No Unused Imports:** Imports não utilizados são erro bloqueante.
- **No Any:** Uso de `any` é desencorajado (use interfaces/types).
- **React Hooks:** Verificação exaustiva de dependências em `useEffect`.
- **Acessibilidade (a11y):** Verificações básicas de ARIA e contraste.

### Comandos de Manutenção
- **Lint Fix:** `npm run audit:fix` (Corrige formatação e imports automaticamente).
- **Type Check:** `npm run type-check` (Validação profunda de tipos TS).
- **Testes:** `npm run test` (Execução de suíte de testes unitários/integração).
- **Build:** `npm run build` (Gera artefatos de produção otimizados).

