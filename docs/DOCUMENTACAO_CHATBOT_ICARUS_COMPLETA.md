# 🤖 CHATBOT ICARUS v5.0 - DOCUMENTAÇÃO COMPLETA 100%

**Sistema**: ICARUS v5.0  
**Categoria**: Assistente Inteligente com IA  
**Design System**: OraclusX DS  
**Prioridade**: P1 (Alta)  
**Versão**: 5.0.0  
**Última Atualização**: Outubro 2025  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL E ARQUITETURA
1. [Visão Geral do Chatbot](#1-visão-geral-do-chatbot)
2. [Arquitetura e Componentes](#2-arquitetura-e-componentes)
3. [Design Neuromórfico](#3-design-neuromórfico)
4. [Inteligência Artificial](#4-inteligência-artificial)

### PARTE II - COMPONENTES UI
5. [ChatbotFAB (Botão Flutuante)](#5-chatbotfab-botão-flutuante)
6. [ChatbotWidget (Janela de Chat)](#6-chatbotwidget-janela-de-chat)
7. [ChatbotMessageCard (Mensagens)](#7-chatbotmessagecard-mensagens)
8. [ChatbotCloseButton (Botão Fechar)](#8-chatbotclosebutton-botão-fechar)

### PARTE III - FUNCIONALIDADES AVANÇADAS
9. [Sistema de Anexos](#9-sistema-de-anexos)
10. [Gravação de Voz](#10-gravação-de-voz)
11. [Drag & Drop](#11-drag-drop)
12. [Auto-sugestões](#12-auto-sugestões)

### PARTE IV - IA E BACKEND
13. [ChatbotAI Service](#13-chatbotai-service)
14. [Reconhecimento de Intenção](#14-reconhecimento-de-intenção)
15. [Análise de Sentimento](#15-análise-de-sentimento)
16. [FAQ Inteligente](#16-faq-inteligente)

### PARTE V - SISTEMAS AUXILIARES
17. [Sistema de Alertas](#17-sistema-de-alertas)
18. [Sistema de Auditoria](#18-sistema-de-auditoria)
19. [Auto-correção](#19-auto-correção)
20. [Sistema de Treinamento](#20-sistema-de-treinamento)

### PARTE VI - INTEGRAÇÃO E DADOS
21. [Integração Supabase](#21-integração-supabase)
22. [Modelo de Dados](#22-modelo-de-dados)
23. [Analytics e Métricas](#23-analytics-e-métricas)
24. [Casos de Uso](#24-casos-de-uso)

---

# PARTE I - VISÃO GERAL E ARQUITETURA

## 1. VISÃO GERAL DO CHATBOT

### 1.1. Descrição

O **Chatbot ICARUS v5.0** é um assistente inteligente baseado em IA que fornece suporte contextual e automação para todas as funcionalidades do sistema OPME. Utiliza processamento de linguagem natural (NLP), análise de sentimento e machine learning para oferecer respostas precisas e contextualmente relevantes.

### 1.2. Características Principais

```yaml
Características Core:
  - Design Neuromórfico (100% OraclusX DS)
  - IA Multi-modelo (GPT-4 + Ollama + HuggingFace)
  - NLP Avançado (Intent Recognition + Entity Extraction)
  - Análise de Sentimento em tempo real
  - FAQ Inteligente (60+ respostas)
  - Contexto de Conversação
  - Anexos de Arquivos (5 arquivos, 10MB cada)
  - Gravação de Voz
  - Drag & Drop
  - Auto-sugestões
  - Modo Claro/Escuro
  - 100% Responsivo
  - Acessível (WCAG AA)

Posicionamento:
  - Floating Action Button (FAB)
  - Posições: bottom-right, bottom-left, top-right, top-left
  - Offset customizável
  - Z-index: 9999

Dimensões FAB:
  - Tamanho: 77×77px (+20% atualização Out/2025)
  - Ícone: 34px (stroke-only)
  - Badge contador: 18×18px
  - Badge ponto: 8×8px

Janela de Chat:
  - Width: 400px (desktop), 100% (mobile)
  - Height: 600px (desktop), 100vh (mobile)
  - Max-height: 80vh
  - Border-radius: 24px (neuromórfico)
```

### 1.3. Tecnologias Utilizadas

```typescript
// Stack Tecnológico
const chatbotStack = {
  frontend: {
    framework: 'React + TypeScript',
    design: 'OraclusX DS Neuromórfico',
    icons: 'Lucide React',
    animations: 'Framer Motion',
    toasts: 'Sonner'
  },
  
  backend: {
    database: 'Supabase PostgreSQL',
    storage: 'Supabase Storage',
    realtime: 'Supabase Realtime'
  },
  
  ia: {
    nlp: 'Custom NLP Engine',
    llm: ['GPT-4 Turbo', 'Ollama (local)', 'HuggingFace'],
    sentiment: 'VADER + Custom Dictionary',
    voice: 'Web Speech API',
    vision: 'GPT-4 Vision (anexos de imagem)'
  },
  
  integrações: {
    apis: ['ANVISA', 'SEFAZ', 'ANS', 'Correios'],
    webhooks: 'Supabase Edge Functions',
    analytics: 'Custom Analytics Engine'
  }
};
```

---

## 2. ARQUITETURA E COMPONENTES

### 2.1. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                CHATBOT ICARUS v5.0 - ARQUITETURA                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  PRESENTATION LAYER                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │  ChatbotFAB  │  │ChatbotWidget │  │  Message     │ │    │
│  │  │  (77×77px)   │  │  (400×600px) │  │   Cards      │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   Anexos     │  │  Voice Rec.  │  │  Auto-       │ │    │
│  │  │ Drag & Drop  │  │  (Áudio)     │  │  Sugestões   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              BUSINESS LOGIC LAYER                       │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         ChatbotAI.ts                             │  │    │
│  │  │  - Intent Recognition                            │  │    │
│  │  │  - Entity Extraction                             │  │    │
│  │  │  - Sentiment Analysis                            │  │    │
│  │  │  - Context Management                            │  │    │
│  │  │  - Response Generation                           │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         AlertSystem.ts                           │  │    │
│  │  │  - Notificações inteligentes                     │  │    │
│  │  │  - Alertas contextuais                           │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         AuditSystem.ts                           │  │    │
│  │  │  - Log de conversas                              │  │    │
│  │  │  - Compliance LGPD                               │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         AutoCorrectionSystem.ts                  │  │    │
│  │  │  - Correção ortográfica                          │  │    │
│  │  │  - Sugestões de escrita                          │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         TrainingSystem.ts                        │  │    │
│  │  │  - Machine Learning                              │  │    │
│  │  │  - Melhoria contínua                             │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                INTEGRATION LAYER                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   GPT-4      │  │    Ollama    │  │ HuggingFace  │ │    │
│  │  │   Turbo      │  │   (Local)    │  │  (Cloud)     │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   ANVISA     │  │    SEFAZ     │  │     ANS      │ │    │
│  │  │     API      │  │   NF-e API   │  │   TISS API   │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    DATA LAYER                           │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │          Supabase PostgreSQL                      │  │    │
│  │  │  - chatbot_conversas                              │  │    │
│  │  │  - chatbot_mensagens                              │  │    │
│  │  │  - chatbot_intencoes                              │  │    │
│  │  │  - chatbot_faqs                                   │  │    │
│  │  │  - chatbot_treinamento                            │  │    │
│  │  │  - chatbot_metricas                               │  │    │
│  │  │  - chatbot_anexos                                 │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │          Supabase Storage                         │  │    │
│  │  │  - Anexos de conversas                            │  │    │
│  │  │  - Gravações de voz                               │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Estrutura de Arquivos

```
chatbot/
├── components/
│   ├── oraclusx-ds/
│   │   ├── ChatbotFAB.tsx                  # Botão flutuante
│   │   ├── ChatbotFABWithPrompt.tsx        # FAB com prompt
│   │   └── ChatbotCloseButton.tsx          # Botão fechar
│   ├── ui/
│   │   ├── chatbot-widget.tsx              # Janela simples
│   │   ├── chatbot-widget-enterprise.tsx   # Janela enterprise
│   │   ├── chatbot-message-card.tsx        # Cards de mensagem
│   │   └── chatbot-svg-icon.tsx            # Ícone SVG
│   └── modules/
│       └── ChatbotMetricsDashboard.tsx     # Dashboard analytics
│
├── lib/services/
│   ├── ai/
│   │   ├── ChatbotAI.ts                    # Service principal IA
│   │   └── ChatbotAI_Enterprise.ts         # Enterprise features
│   └── chatbot/
│       ├── AlertSystem.ts                   # Sistema de alertas
│       ├── AuditSystem.ts                   # Auditoria
│       ├── AutoCorrectionSystem.ts          # Auto-correção
│       ├── SupabaseIntegration.ts           # Integração DB
│       └── TrainingSystem.ts                # Machine Learning
│
├── hooks/
│   └── ai/
│       └── useChatbotAI.ts                 # Hook React
│
├── supabase/
│   ├── chatbot_schema.sql                  # Schema inglês
│   └── chatbot_ia_schema_ptbr.sql         # Schema português
│
├── examples/
│   └── chatbot-anexos-exemplo.tsx          # Exemplo de uso
│
└── tests/
    └── chatbot/
        └── chatbot.test.ts                 # Testes unitários
```

---

## 3. DESIGN NEUROMÓRFICO

### 3.1. ChatbotFAB - Especificações Completas

```css
/* ═══════════════════════════════════════════════════════════
   CHATBOT FAB - FLOATING ACTION BUTTON
   Atualizado: Outubro 2025 (+20% tamanho)
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab {
  /* Dimensões - 77×77px (+20% de 64px) */
  width: 77px;
  height: 77px;
  
  /* Shape */
  border-radius: 9999px; /* Circular perfeito */
  
  /* Background - Sempre #6366F1 (indigo) */
  background: #6366F1;
  
  /* Neuromórfico - Modo Claro (Raised) */
  box-shadow: 
    -8px -8px 16px rgba(255, 255, 255, 0.9),  /* Light superior */
    8px 8px 16px rgba(203, 213, 225, 0.6);    /* Shadow inferior */
  
  /* Ícone */
  --icon-size: 34px; /* +20% de 28px */
  --icon-color: #FFFFFF;
  --icon-stroke: 2.2;
  
  /* Posição */
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  
  /* Interação */
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

/* ═══════════════════════════════════════════════════════════
   MODO ESCURO
   ═══════════════════════════════════════════════════════════ */

.dark .chatbot-fab {
  /* Background - Mantém #6366F1 */
  background: #6366F1;
  
  /* Neuromórfico Dark (Raised) */
  box-shadow: 
    -8px -8px 16px rgba(51, 65, 85, 0.5),   /* Light dark superior */
    8px 8px 16px rgba(0, 0, 0, 0.7);        /* Shadow dark inferior */
}

/* ═══════════════════════════════════════════════════════════
   HOVER STATE
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab:hover {
  /* Elevação */
  transform: translateY(-2px);
  opacity: 0.96;
  
  /* Shadow enhanced - Modo Claro */
  box-shadow: 
    -10px -10px 20px rgba(255, 255, 255, 0.9),
    10px 10px 20px rgba(203, 213, 225, 0.7);
}

.dark .chatbot-fab:hover {
  /* Shadow enhanced - Modo Escuro */
  box-shadow: 
    -12px -12px 24px rgba(51, 65, 85, 0.6),
    12px 12px 24px rgba(0, 0, 0, 0.8);
}

/* ═══════════════════════════════════════════════════════════
   ACTIVE/PRESSED STATE
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab:active,
.chatbot-fab.active {
  /* Escala reduzida */
  transform: scale(0.96);
  
  /* Inset shadow (pressed) - Modo Claro */
  box-shadow: 
    inset 10px 10px 20px rgba(203, 213, 225, 0.7),
    inset -10px -10px 20px rgba(255, 255, 255, 0.5);
}

.dark .chatbot-fab:active,
.dark .chatbot-fab.active {
  /* Inset shadow (pressed) - Modo Escuro */
  box-shadow: 
    inset 12px 12px 24px rgba(0, 0, 0, 0.8),
    inset -12px -12px 24px rgba(51, 65, 85, 0.4);
}

/* ═══════════════════════════════════════════════════════════
   BADGE CONTADOR (18×18px - igual topbar)
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  
  /* Dimensões FIXAS */
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  
  /* Shape */
  border-radius: 50%;
  
  /* Background */
  background: #EF4444; /* Red-500 */
  color: #FFFFFF;
  
  /* Typography */
  font-size: 10px;
  line-height: 1;
  font-weight: 700;
  
  /* Border para contraste */
  border: 1px solid #FFFFFF;
  
  /* Shadow sutil */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  /* Flexbox para centrar */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* ═══════════════════════════════════════════════════════════
   BADGE PONTO (8×8px)
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab__dot {
  position: absolute;
  top: -4px;
  right: -4px;
  
  /* Dimensões */
  width: 8px;
  height: 8px;
  
  /* Shape */
  border-radius: 50%;
  
  /* Background */
  background: #EF4444; /* Red-500 */
  
  /* Border */
  border: 2px solid #FFFFFF;
}

.dark .chatbot-fab__dot {
  border-color: #1E293B;
}

/* ═══════════════════════════════════════════════════════════
   ÍCONE (34×34px - +20%)
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab__icon {
  width: 34px;
  height: 34px;
  color: #FFFFFF;
  stroke-width: 2.2;
  fill: none;
  stroke: currentColor;
}

/* ═══════════════════════════════════════════════════════════
   ACESSIBILIDADE - WCAG AA
   ═══════════════════════════════════════════════════════════ */

.chatbot-fab:focus-visible {
  outline: none;
  ring: 2px solid var(--light-primary);
  ring-offset: 2px;
}

.dark .chatbot-fab:focus-visible {
  ring-color: var(--dark-primary);
}
```

### 3.2. ChatbotWidget - Janela de Chat

```css
/* ═══════════════════════════════════════════════════════════
   CHATBOT WIDGET - JANELA DE CHAT
   ═══════════════════════════════════════════════════════════ */

.chatbot-widget {
  /* Dimensões */
  width: 400px;
  max-width: calc(100vw - 32px);
  height: 600px;
  max-height: 80vh;
  
  /* Posicionamento */
  position: fixed;
  bottom: 112px; /* FAB height + spacing */
  right: 24px;
  z-index: 9998;
  
  /* Shape */
  border-radius: 24px;
  overflow: hidden;
  
  /* Background - Modo Claro */
  background: linear-gradient(
    180deg,
    #F5F7FA 0%,
    #FFFFFF 100%
  );
  
  /* Neuromórfico Raised */
  box-shadow: 
    -8px -8px 16px rgba(255, 255, 255, 0.9),
    8px 8px 24px rgba(0, 0, 0, 0.15),
    0 4px 32px rgba(0, 0, 0, 0.1);
    
  border: 1px solid rgba(0, 0, 0, 0.08);
  
  /* Animação de entrada */
  animation: chatbot-slide-up 0.3s ease-out;
}

/* Modo Escuro */
.dark .chatbot-widget {
  background: linear-gradient(
    180deg,
    #1E293B 0%,
    #0F172A 100%
  );
  
  box-shadow: 
    -8px -8px 16px rgba(51, 65, 85, 0.3),
    8px 8px 24px rgba(0, 0, 0, 0.7),
    0 4px 32px rgba(0, 0, 0, 0.5);
    
  border-color: rgba(255, 255, 255, 0.08);
}

/* Animação */
@keyframes chatbot-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════ */

.chatbot-widget__header {
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  
  /* Background */
  background: #6366F1;
  
  /* Border */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Typography */
  color: #FFFFFF;
}

.chatbot-widget__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #FFFFFF;
}

.chatbot-widget__subtitle {
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════
   MESSAGES AREA
   ═══════════════════════════════════════════════════════════ */

.chatbot-widget__messages {
  /* Layout */
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  /* Spacing */
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* Scroll customizado */
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}

.chatbot-widget__messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-widget__messages::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-widget__messages::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

.chatbot-widget__messages::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

/* ═══════════════════════════════════════════════════════════
   INPUT AREA
   ═══════════════════════════════════════════════════════════ */

.chatbot-widget__input-area {
  /* Layout */
  padding: 16px 20px 20px;
  
  /* Background */
  background: rgba(245, 247, 250, 0.5);
  
  /* Border */
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .chatbot-widget__input-area {
  background: rgba(30, 41, 59, 0.5);
  border-top-color: rgba(255, 255, 255, 0.08);
}

.chatbot-widget__input-container {
  /* Layout */
  display: flex;
  align-items: flex-end;
  gap: 8px;
  
  /* Background neuromórfico */
  background: #FFFFFF;
  border-radius: 16px;
  padding: 12px;
  
  /* Shadow sutil */
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.5);
    
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .chatbot-widget__input-container {
  background: #1E293B;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.3),
    inset -2px -2px 4px rgba(51, 65, 85, 0.3);
  border-color: rgba(255, 255, 255, 0.08);
}

/* ═══════════════════════════════════════════════════════════
   MOBILE RESPONSIVO
   ═══════════════════════════════════════════════════════════ */

@media (max-width: 640px) {
  .chatbot-widget {
    /* Full screen mobile */
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 0;
  }
  
  .chatbot-fab {
    /* Reposicionar FAB */
    bottom: 16px;
    right: 16px;
    width: 64px;
    height: 64px;
  }
  
  .chatbot-fab__icon {
    width: 28px;
    height: 28px;
  }
}
```

---

## 4. INTELIGÊNCIA ARTIFICIAL

### 4.1. Arquitetura de IA Multi-Modelo

```typescript
/**
 * Sistema de IA Multi-Modelo
 * 
 * O chatbot utiliza 3 modelos de IA em paralelo:
 * 1. GPT-4 Turbo (OpenAI) - Principal
 * 2. Ollama (Local) - Fallback/Privacy
 * 3. HuggingFace (Cloud) - Tarefas específicas
 */

interface AIModel {
  name: string;
  provider: 'openai' | 'ollama' | 'huggingface';
  priority: number; // 1 = highest
  capabilities: string[];
  latency: number; // ms
  cost: number; // per 1K tokens
}

const AI_MODELS: AIModel[] = [
  {
    name: 'gpt-4-turbo-preview',
    provider: 'openai',
    priority: 1,
    capabilities: [
      'intent-recognition',
      'entity-extraction',
      'response-generation',
      'medical-justification',
      'code-generation'
    ],
    latency: 800,
    cost: 0.03
  },
  {
    name: 'llama3-70b',
    provider: 'ollama',
    priority: 2,
    capabilities: [
      'intent-recognition',
      'entity-extraction',
      'sentiment-analysis'
    ],
    latency: 400,
    cost: 0 // Local
  },
  {
    name: 'roberta-sentiment',
    provider: 'huggingface',
    priority: 3,
    capabilities: [
      'sentiment-analysis',
      'emotion-detection'
    ],
    latency: 300,
    cost: 0.001
  }
];
```

### 4.2. Pipeline de Processamento

```yaml
Pipeline NLP Completo:

Etapa 1 - Pré-processamento (10-20ms):
  - Normalização de texto
  - Remoção de stopwords (opcional)
  - Tokenização
  - Stemming/Lemmatization
  
Etapa 2 - Intent Recognition (50-100ms):
  - Análise de padrões regex
  - Classificação com ML (Ollama)
  - Validação com GPT-4
  - Confiança mínima: 70%
  
Etapa 3 - Entity Extraction (30-60ms):
  - Extração de datas
  - Extração de números
  - Extração de nomes (pessoas, locais)
  - Extração de valores monetários
  - Extração de status/estados
  
Etapa 4 - Sentiment Analysis (40-80ms):
  - Análise de palavras-chave
  - Score -1 a +1
  - Detecção de emoções (5 tipos)
  - Classificação de intensidade
  
Etapa 5 - Context Management (20-40ms):
  - Recuperação de histórico
  - Atualização de contexto
  - Verificação de dependências
  
Etapa 6 - Response Generation (200-500ms):
  - Busca em FAQ (se aplicável)
  - Geração com GPT-4
  - Validação de resposta
  - Formatação de saída
  
Etapa 7 - Post-processing (30-50ms):
  - Geração de sugestões
  - Verificação de ações
  - Log de auditoria
  - Atualização de métricas

Tempo Total: 380-850ms (média: 500ms)
```

Vou continuar a documentação em um segundo arquivo devido ao tamanho extenso.

