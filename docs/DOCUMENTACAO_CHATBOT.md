# 🤖 CHATBOT ICARUS v6.0 (AI Assistant) - DOCUMENTAÇÃO TÉCNICA

**Sistema**: ICARUS v6.0  
**Categoria**: Assistente Inteligente com IA  
**Design System**: OraclusX DS (Dark Glass / Cyberpunk)  
**Framework**: React + HeroUI + Tailwind v4  
**Versão**: 6.0.0  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL
1. [Arquitetura & Tech Stack](#1-arquitetura--tech-stack)
2. [Design System (Dark Glass)](#2-design-system-dark-glass)

### PARTE II - COMPONENTES UI
3. [AIChatWidget (Componente Principal)](#3-aichatwidget-componente-principal)
4. [Interface de Mensagens](#4-interface-de-mensagens)

### PARTE III - FUNCIONALIDADES
5. [Sistema de Anexos & Vision](#5-sistema-de-anexos--vision)
6. [Comandos de Voz (Speech)](#6-comandos-de-voz-speech)
7. [Sugestões Inteligentes](#7-sugestões-inteligentes)

### PARTE IV - INTEGRAÇÃO & DADOS
8. [Pipeline de IA](#8-pipeline-de-ia)
9. [Schema de Banco de Dados](#9-schema-de-banco-de-dados)

---

# PARTE I - VISÃO GERAL

## 1. ARQUITETURA & TECH STACK

O **ICARUS AI Assistant** é um copiloto integrado que utiliza modelos LLM para automação de tarefas, análise de dados e suporte operacional.

```yaml
Frontend:
  Componente: AIChatWidget.tsx
  UI Library: HeroUI (@heroui/react)
  Icons: Lucide React
  Motion: Framer Motion / Tailwind Animate
  State: React Hooks (Local + Context)

AI & Backend:
  Primary Model: GPT-4o (OpenAI)
  Fallback: Ollama (Llama 3) - Local/Privado
  Speech-to-Text: Web Speech API / Whisper
  Vision: GPT-4o Vision (Análise de Fotos/Docs)
  Database: Supabase (PostgreSQL + Vector)
```

## 2. DESIGN SYSTEM (DARK GLASS)

Adaptado do padrão *Neuromórfico* original para o tema **Cyberpunk / Dark Glass** do Icarus v6.0.

*   **Glassmorphism**: Utiliza `backdrop-blur-xl`, `bg-white/5` e bordas translúcidas.
*   **Glow Effects**: Sombras coloridas (`shadow-indigo-500/20`) para indicar estado ativo e foco.
*   **Tipografia**: Fonte Inter, com alto contraste para legibilidade em fundo escuro.

---

# PARTE II - COMPONENTES UI

## 3. AICHATWIDGET (COMPONENTE PRINCIPAL)

**Arquivo**: `src/components/AIChatWidget.tsx`

Gerencia o estado do chat (minimizado/expandido) e a orquestração de mensagens.

### 3.1. Botão Flutuante (FAB)
*   **Estilo**: Circular, gradiente Indigo/Purple ou cor Sólida (`bg-indigo-600`).
*   **Efeito**: `hover:scale-105`, `animate-pulse` (quando processando).
*   **Posição**: Fixed `bottom-6 right-6` (z-index 50).

```tsx
<button className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] ...">
  <Bot size={28} className="text-white" />
</button>
```

### 3.2. Janela do Chat (Glass Container)
*   **Dimensões**: `w-[380px] h-[500px]`.
*   **Aparência**: Fundo escuro profundo (`bg-[#1a1d26]`), borda fina (`border-white/10`), sombra de elevação.
*   **Header**: Identidade do assistente, status de conexão e botões de controle (Minimizar, Fechar).

## 4. INTERFACE DE MENSAGENS

### 4.1. Cards de Mensagem
*   **User**: Alinhado à direita, fundo gradiente ou accent (`bg-indigo-600`), texto branco.
*   **AI**: Alinhado à esquerda, fundo glass (`bg-white/5`), texto cinza claro (`text-slate-200`).
*   **System**: Centralizado, texto pequeno, usado para logs ou avisos.

### 4.2. Input Area
Barra de entrada flutuante dentro do widget.
*   **Recursos**: Textarea auto-resize, botões de anexo (`Paperclip`) e voz (`Mic`) integrados.
*   **Estilo**: `bg-[#11131f] border-white/10 rounded-2xl`.

---

# PARTE III - FUNCIONALIDADES

## 5. SISTEMA DE ANEXOS & VISION

Permite o upload de documentos e imagens para análise contextual pela IA.

*   **Formatos**: PDF, JPG, PNG.
*   **Limite**: 5MB por arquivo (configurável).
*   **UX**: Preview de arquivo anexado com botão de remover antes do envio.
*   **Processamento**: 
    1. Upload para Supabase Storage.
    2. Extração de texto (OCR) ou análise visual (GPT-4 Vision).

## 6. COMANDOS DE VOZ (SPEECH)

Integração nativa com APIs de reconhecimento de fala.

*   **Ativação**: Botão de microfone no input.
*   **Feedback Visual**: Animação de onda ou pulso durante a escuta.
*   **Fluxo**: Áudio -> Texto (STT) -> Processamento LLM -> Resposta Texto -> Áudio (TTS - Opcional).

## 7. SUGESTÕES INTELIGENTES

"Chips" clicáveis apresentados acima da barra de input para agilizar a interação.

*   **Contextuais**: Mudam baseadas na tela atual do usuário (ex: no Dashboard -> "Ver faturamento").
*   **Estilo**: `variant="flat"` do HeroUI, `bg-[#232732] hover:bg-[#2d3240]`.

---

# PARTE IV - INTEGRAÇÃO & DADOS

## 8. PIPELINE DE IA

Fluxo de processamento de uma mensagem do usuário:

1.  **Pré-processamento**: Identificação de intenção (Regex/Keyword).
2.  **Contexto**: Recuperação do histórico recente e dados da tela atual.
3.  **RAG (Retrieval Augmented Generation)**: Busca em base de conhecimento (manuais, protocolos OPME).
4.  **Geração**: Chamada à API (OpenAI/Ollama).
5.  **Ação**: Execução de função (ex: "Navegar para Estoque", "Filtrar Relatório") se o modelo solicitar (Function Calling).

## 9. SCHEMA DE BANCO DE DADOS

Tabelas principais no Supabase para persistência e auditoria.

```sql
-- Histórico de Conversas
CREATE TABLE chatbot_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, closed
  metadata JSONB
);

-- Mensagens Individuais
CREATE TABLE chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chatbot_conversas(id),
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  attachments JSONB, -- URLs dos arquivos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de Auditoria (Compliance)
CREATE TABLE chatbot_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chatbot_mensagens(id),
  intent_detected TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER
);
```

---

> **Nota**: Esta documentação substitui as especificações de design anteriores ("Neuromórfico Claro") e alinha o Chatbot com a identidade visual **Dark Glass** atual do projeto Icarus v6.0.

