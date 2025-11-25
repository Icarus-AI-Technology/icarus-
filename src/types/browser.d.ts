/**
 * Browser API Type Declarations
 * Adiciona tipagem para APIs do browser não incluídas no TypeScript padrão
 */

// ============================================
// SpeechRecognition API
// ============================================

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error:
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';
  message: string;
}

interface Window {
  SpeechRecognition?: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new (): SpeechRecognition;
  };
  IntersectionObserver?: new (
    callback: (entries: Array<{ isIntersecting: boolean }>, observer: IntersectionObserver) => void
  ) => IntersectionObserver;
  ResizeObserver?: new (
    callback: (
      entries: Array<{ target: Element; contentRect: DOMRectReadOnly }>,
      observer: ResizeObserver
    ) => void
  ) => ResizeObserver;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare const webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

// ============================================
// WebKit Vendor Prefixes
// ============================================

interface CSSStyleDeclaration {
  WebkitBackdropFilter?: string;
  webkitBackdropFilter?: string;
}

// Ambiente genérico (browser + Vite)
declare const process: {
  env?: Record<string, string | undefined>;
};
