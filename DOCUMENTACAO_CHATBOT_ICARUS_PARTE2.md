# 🤖 CHATBOT ICARUS v5.0 - PARTE 2 (Seções 5-16)

**Continuação da documentação completa do Chatbot**

---

## 5. CHATBOTFAB (BOTÃO FLUTUANTE)

### 5.1. Especificações Completas

**Arquivo**: `/components/oraclusx-ds/ChatbotFAB.tsx`

```typescript
interface ChatbotFABProps {
  theme?: 'light' | 'dark';
  state?: 'idle' | 'active' | 'dragging';
  badge?: 'none' | 'dot' | 'count';
  badgeCount?: number;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

// Uso básico
<ChatbotFAB
  theme="light"
  state="idle"
  badge="count"
  badgeCount={3}
  onClick={() => setIsOpen(true)}
  aria-label="Abrir assistente IA"
/>
```

### 5.2. Estados Visuais

```yaml
Estado Idle (Padrão):
  - Transform: none
  - Opacity: 1
  - Shadow: Neuromórfico raised
  - Cursor: pointer

Estado Hover:
  - Transform: translateY(-2px)
  - Opacity: 0.96
  - Shadow: Enhanced (maior blur)
  - Cursor: pointer

Estado Active (Pressionado):
  - Transform: scale(0.96)
  - Opacity: 1
  - Shadow: Inset (pressed)
  - Cursor: pointer

Estado Dragging (Arrastando):
  - Opacity: 0.8
  - Cursor: move
  - Shadow: Normal
```

### 5.3. Variantes de Badge

```typescript
// Badge Dot (ponto vermelho)
<ChatbotFAB
  badge="dot"
  aria-label="Chatbot com notificação"
/>

// Badge Count (contador)
<ChatbotFAB
  badge="count"
  badgeCount={5}
  aria-label="Chatbot com 5 notificações"
/>

// Badge Count > 9 (mostra "9+")
<ChatbotFAB
  badge="count"
  badgeCount={15}
  // Mostra: "9+"
/>
```

---

## 6. CHATBOTWIDGET (JANELA DE CHAT)

### 6.1. Especificações Completas

**Arquivo**: `/components/ui/chatbot-widget-enterprise.tsx`

```typescript
interface ChatbotWidgetEnterpriseProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: {
    right?: string;
    left?: string;
    top?: string;
    bottom?: string;
  };
  userId?: string;
  userName?: string;
  initialGreeting?: string;
}

// Uso completo
<ChatbotWidgetEnterprise
  position="bottom-right"
  offset={{ right: '24px', bottom: '112px' }}
  userId="user_123"
  userName="Roberto Silva"
  initialGreeting="👋 Olá Roberto! Como posso ajudar hoje?"
/>
```

### 6.2. Estrutura Interna

```tsx
<div className="chatbot-widget">
  {/* HEADER */}
  <header className="chatbot-widget__header">
    <div className="flex items-center gap-3">
      {/* Avatar do Bot */}
      <div className="chatbot-avatar">
        <BotMessageSquare size={24} />
      </div>
      
      {/* Título */}
      <div>
        <h3 className="chatbot-widget__title">
          Assistente IA ICARUS
        </h3>
        <p className="chatbot-widget__subtitle">
          Online • Responde em segundos
        </p>
      </div>
    </div>
    
    {/* Botão Fechar */}
    <ChatbotCloseButton onClick={onClose} />
  </header>

  {/* MESSAGES AREA */}
  <div className="chatbot-widget__messages">
    {messages.map(msg => (
      <ChatbotMessageCard
        key={msg.id}
        message={msg}
        theme={theme}
      />
    ))}
    <div ref={messagesEndRef} />
  </div>

  {/* INPUT AREA */}
  <div className="chatbot-widget__input-area">
    {/* Anexos Preview */}
    {attachments.length > 0 && (
      <AttachmentsPreview
        attachments={attachments}
        onRemove={handleRemoveAttachment}
      />
    )}
    
    {/* Input Container */}
    <div className="chatbot-widget__input-container">
      {/* Botão Anexar */}
      <IconButton
        icon={<Paperclip />}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Anexar arquivo"
      />
      
      {/* Input de Texto */}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem..."
        rows={1}
        className="chatbot-input"
      />
      
      {/* Botão Voz */}
      <IconButton
        icon={isRecording ? <MicOff /> : <Mic />}
        onClick={toggleRecording}
        variant={isRecording ? 'recording' : 'default'}
        aria-label={isRecording ? 'Parar gravação' : 'Gravar voz'}
      />
      
      {/* Botão Enviar */}
      <IconButton
        icon={<Send />}
        onClick={handleSendMessage}
        disabled={!inputValue.trim() && attachments.length === 0}
        variant="primary"
        aria-label="Enviar mensagem"
      />
    </div>
  </div>
</div>
```

### 6.3. Posicionamento Dinâmico

```typescript
const POSITION_STYLES = {
  'bottom-right': { 
    bottom: '112px',  // FAB height + spacing
    right: '24px' 
  },
  'bottom-left': { 
    bottom: '112px', 
    left: '24px' 
  },
  'top-right': { 
    top: '24px', 
    right: '24px' 
  },
  'top-left': { 
    top: '24px', 
    left: '24px' 
  },
};

// Aplicação dinâmica
<div
  className="chatbot-widget"
  style={{
    ...POSITION_STYLES[position],
    ...offset
  }}
/>
```

---

## 7. CHATBOTMESSAGECARD (MENSAGENS)

### 7.1. Tipos de Mensagem

```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  metadata?: {
    intent?: Intent;
    sentiment?: SentimentResult;
    confidence?: number;
  };
}

type MessageType = 'user' | 'assistant' | 'system';
```

### 7.2. Design por Tipo

```css
/* ═══════════════════════════════════════════════════════════
   MENSAGEM DO USUÁRIO (user)
   ═══════════════════════════════════════════════════════════ */

.message-card--user {
  /* Alinhamento à direita */
  align-self: flex-end;
  max-width: 75%;
  
  /* Background indigo */
  background: linear-gradient(
    135deg,
    #6366F1 0%,
    #4F46E5 100%
  );
  
  /* Typography */
  color: #FFFFFF;
  
  /* Shape */
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  
  /* Shadow sutil */
  box-shadow: 
    0 4px 12px rgba(99, 102, 241, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.1);
}

/* ═══════════════════════════════════════════════════════════
   MENSAGEM DO ASSISTENTE (assistant)
   ═══════════════════════════════════════════════════════════ */

.message-card--assistant {
  /* Alinhamento à esquerda */
  align-self: flex-start;
  max-width: 85%;
  
  /* Background neuromórfico */
  background: #FFFFFF;
  
  /* Typography */
  color: #2A3341;
  
  /* Shape */
  border-radius: 16px 16px 16px 4px;
  padding: 12px 16px;
  
  /* Neuromórfico flat */
  box-shadow: 
    -4px -4px 8px rgba(255, 255, 255, 0.8),
    4px 4px 12px rgba(0, 0, 0, 0.08);
    
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark .message-card--assistant {
  background: #1E293B;
  color: #F8FAFC;
  
  box-shadow: 
    -4px -4px 8px rgba(51, 65, 85, 0.3),
    4px 4px 12px rgba(0, 0, 0, 0.5);
    
  border-color: rgba(255, 255, 255, 0.08);
}

/* ═══════════════════════════════════════════════════════════
   MENSAGEM DO SISTEMA (system)
   ═══════════════════════════════════════════════════════════ */

.message-card--system {
  /* Centralizado */
  align-self: center;
  max-width: 90%;
  
  /* Background sutil */
  background: rgba(99, 102, 241, 0.08);
  
  /* Typography */
  color: #6366F1;
  font-size: 13px;
  text-align: center;
  
  /* Shape */
  border-radius: 12px;
  padding: 8px 16px;
  
  /* Border sutil */
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.dark .message-card--system {
  background: rgba(99, 102, 241, 0.12);
  color: #818CF8;
  border-color: rgba(99, 102, 241, 0.3);
}
```

### 7.3. Componente React

```tsx
interface ChatbotMessageCardProps {
  message: ChatMessage;
  theme?: 'light' | 'dark';
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export const ChatbotMessageCard: React.FC<ChatbotMessageCardProps> = ({
  message,
  theme = 'light',
  showAvatar = true,
  showTimestamp = true
}) => {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';
  const isSystem = message.type === 'system';

  return (
    <div className={cn(
      'message-card',
      `message-card--${message.type}`,
      'flex gap-3'
    )}>
      {/* Avatar (apenas assistant) */}
      {showAvatar && isAssistant && (
        <div className="message-avatar">
          <BotMessageSquare size={20} />
        </div>
      )}

      {/* Content */}
      <div className="message-content">
        {/* Text */}
        <p className="message-text">
          {message.content}
        </p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((att, idx) => (
              <AttachmentPreview key={idx} attachment={att} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <span className="message-timestamp">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>

      {/* Avatar (apenas user) */}
      {showAvatar && isUser && (
        <div className="message-avatar message-avatar--user">
          <User size={20} />
        </div>
      )}
    </div>
  );
};
```

---

## 8. CHATBOTCLOSEBUTTON (BOTÃO FECHAR)

### 8.1. Especificações

**Arquivo**: `/components/oraclusx-ds/ChatbotCloseButton.tsx`

```typescript
interface ChatbotCloseButtonProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
  onClick?: () => void;
}

// Componente
export const ChatbotCloseButton: React.FC<ChatbotCloseButtonProps> = ({
  theme = 'light',
  size = 'md',
  variant = 'default',
  onClick
}) => {
  const sizes = {
    sm: '32px',
    md: '40px',
    lg: '48px'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Fechar chatbot"
      className={cn(
        'chatbot-close-button',
        `chatbot-close-button--${size}`,
        `chatbot-close-button--${variant}`
      )}
      style={{
        width: sizes[size],
        height: sizes[size]
      }}
    >
      <X size={iconSizes[size]} strokeWidth={2} />
    </button>
  );
};
```

### 8.2. Estilos

```css
.chatbot-close-button {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* Shape */
  border-radius: 50%;
  
  /* Interaction */
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Reset */
  border: none;
  outline: none;
}

/* Variant Default */
.chatbot-close-button--default {
  /* Background claro sobre indigo */
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.chatbot-close-button--default:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.chatbot-close-button--default:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.95);
}

/* Variant Ghost */
.chatbot-close-button--ghost {
  background: transparent;
  color: #FFFFFF;
}

.chatbot-close-button--ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

## 9. SISTEMA DE ANEXOS

### 9.1. Especificações

```typescript
interface Attachment {
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface AttachmentsConfig {
  maxFiles: number;        // Padrão: 5
  maxSizePerFile: number;  // Padrão: 10MB
  allowedTypes: string[];  // Padrão: ['*/*']
}

const DEFAULT_CONFIG: AttachmentsConfig = {
  maxFiles: 5,
  maxSizePerFile: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['*/*']
};
```

### 9.2. Upload de Arquivos

```typescript
const handleFileUpload = useCallback((files: FileList | null) => {
  if (!files) return;
  
  // Limite de 5 arquivos
  const newFiles = Array.from(files).slice(0, 5 - attachments.length);
  
  if (attachments.length + newFiles.length > 5) {
    toast.error('Máximo de 5 arquivos permitidos');
    return;
  }

  // Validar tamanho (10MB cada)
  const oversizedFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    toast.error('Arquivos devem ter no máximo 10MB');
    return;
  }

  // Validar tipos (opcional)
  const invalidTypes = newFiles.filter(file => 
    !ALLOWED_TYPES.includes(file.type) && !ALLOWED_TYPES.includes('*/*')
  );
  
  if (invalidTypes.length > 0) {
    toast.error('Tipo de arquivo não permitido');
    return;
  }

  // Adicionar arquivos
  setAttachments(prev => [...prev, ...newFiles]);
  toast.success(`${newFiles.length} arquivo(s) anexado(s)`);
}, [attachments]);
```

### 9.3. Preview de Anexos

```tsx
const AttachmentsPreview: React.FC<{
  attachments: Attachment[];
  onRemove: (index: number) => void;
}> = ({ attachments, onRemove }) => {
  return (
    <div className="attachments-preview">
      {attachments.map((file, index) => (
        <div key={index} className="attachment-item">
          {/* Ícone baseado no tipo */}
          <div className="attachment-icon">
            {getFileIcon(file.type)}
          </div>
          
          {/* Info */}
          <div className="attachment-info">
            <span className="attachment-name">
              {file.name}
            </span>
            <span className="attachment-size">
              {formatFileSize(file.size)}
            </span>
          </div>
          
          {/* Botão Remover */}
          <button
            onClick={() => onRemove(index)}
            className="attachment-remove"
            aria-label="Remover arquivo"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 9.4. Tipos de Arquivo Suportados

```typescript
const FILE_TYPE_ICONS = {
  // Imagens
  'image/*': ImageIcon,
  
  // Documentos
  'application/pdf': FileTextIcon,
  'application/msword': FileTextIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileTextIcon,
  
  // Planilhas
  'application/vnd.ms-excel': FileSpreadsheetIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheetIcon,
  
  // Apresentações
  'application/vnd.ms-powerpoint': FilePresentationIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': FilePresentationIcon,
  
  // Compactados
  'application/zip': FileArchiveIcon,
  'application/x-rar-compressed': FileArchiveIcon,
  
  // Padrão
  'default': FileIcon
};
```

---

## 10. GRAVAÇÃO DE VOZ

### 10.1. Web Speech API

```typescript
interface VoiceRecordingState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  waveform: number[];
}

const useVoiceRecording = () => {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    audioBlob: null,
    duration: 0,
    waveform: []
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: 'audio/webm' 
        });
        
        setState(prev => ({
          ...prev,
          isRecording: false,
          audioBlob: blob
        }));

        // Parar stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0
      }));

      toast.success('Gravação iniciada');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro ao acessar microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      toast.info('Gravação finalizada');
    }
  };

  const toggleRecording = () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    toggleRecording
  };
};
```

### 10.2. Visualização de Onda (Waveform)

```tsx
const VoiceWaveform: React.FC<{
  isRecording: boolean;
  waveform: number[];
}> = ({ isRecording, waveform }) => {
  return (
    <div className="voice-waveform">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'waveform-bar',
            isRecording && 'waveform-bar--active'
          )}
          style={{
            height: isRecording 
              ? `${Math.random() * 100}%` 
              : '20%',
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );
};
```

---

## 11. DRAG & DROP

### 11.1. Implementação

```typescript
const useDragAndDrop = (onDrop: (files: FileList) => void) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Apenas resetar se sair do container principal
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onDrop(files);
    }
  }, [onDrop]);

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};
```

### 11.2. Overlay Visual

```tsx
{isDragging && (
  <div className="drag-overlay">
    <div className="drag-overlay__content">
      <Upload size={48} strokeWidth={2} />
      <p className="drag-overlay__text">
        Solte os arquivos aqui
      </p>
      <p className="drag-overlay__hint">
        Máximo 5 arquivos, 10MB cada
      </p>
    </div>
  </div>
)}
```

```css
.drag-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  
  background: rgba(99, 102, 241, 0.1);
  backdrop-filter: blur(4px);
  
  border: 2px dashed #6366F1;
  border-radius: 24px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  animation: drag-pulse 1s ease infinite;
}

@keyframes drag-pulse {
  0%, 100% { 
    background: rgba(99, 102, 241, 0.1);
  }
  50% { 
    background: rgba(99, 102, 241, 0.15);
  }
}
```

---

## 12. AUTO-SUGESTÕES

### 12.1. Sistema de Sugestões

```typescript
interface Suggestion {
  text: string;
  type: 'action' | 'question' | 'quick-reply';
  icon?: React.ComponentType;
  callback?: () => void;
}

const QUICK_SUGGESTIONS: Suggestion[] = [
  {
    text: 'Ver minhas cirurgias',
    type: 'quick-reply',
    icon: Calendar,
    callback: () => navigate('/cirurgias')
  },
  {
    text: 'Status do estoque',
    type: 'quick-reply',
    icon: Package
  },
  {
    text: 'Emitir NF-e',
    type: 'action',
    icon: FileText
  },
  {
    text: 'Rastrear entrega',
    type: 'quick-reply',
    icon: Truck
  },
  {
    text: 'Ver relatórios',
    type: 'quick-reply',
    icon: BarChart
  }
];
```

### 12.2. Componente de Sugestões

```tsx
const QuickSuggestions: React.FC<{
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}> = ({ suggestions, onSelect }) => {
  return (
    <div className="quick-suggestions">
      <p className="quick-suggestions__title">
        Sugestões rápidas:
      </p>
      
      <div className="quick-suggestions__grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="suggestion-chip"
          >
            {suggestion.icon && (
              <suggestion.icon size={16} />
            )}
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

```css
.suggestion-chip {
  /* Layout */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  
  /* Background neuromórfico */
  background: #FFFFFF;
  border-radius: 20px;
  
  /* Typography */
  font-size: 14px;
  color: #6366F1;
  
  /* Border */
  border: 1px solid rgba(99, 102, 241, 0.2);
  
  /* Shadow */
  box-shadow: 
    -2px -2px 4px rgba(255, 255, 255, 0.8),
    2px 2px 6px rgba(0, 0, 0, 0.08);
  
  /* Interaction */
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
  
  box-shadow: 
    -3px -3px 6px rgba(255, 255, 255, 0.9),
    3px 3px 8px rgba(0, 0, 0, 0.12);
}

.suggestion-chip:active {
  transform: scale(0.97);
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.08);
}
```

Vou continuar com a parte 3 (seções 13-24) em outro arquivo.

