/// <reference types="vite/client" />

/**
 * Tipagem de variaveis de ambiente para o ICARUS v5.
 * - As chaves VITE_* sao expostas no client (Vite).
 * - Chaves sensiveis (SERVICE_ROLE etc.) devem ser usadas apenas no backend/scripts.
 */

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Flags (ajuste conforme necessario)
  readonly VITE_FF_MEILISEARCH?: "on" | "off"
  readonly VITE_FF_TESSERACT?: "on" | "off"
  readonly VITE_FF_OLLAMA?: "on" | "off"
  readonly VITE_FF_EMAIL_PROVIDER?: "resend" | "ses" | "off"
  readonly VITE_FF_BULLMQ?: "on" | "off"
  readonly VITE_FF_POSTHOG?: "on" | "off"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Web Speech API minimal typings (runtime-guarded in code)
interface Window {
  SpeechRecognition?: new () => SpeechRecognition
  webkitSpeechRecognition?: new () => SpeechRecognition
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult?: (event: SpeechRecognitionEvent) => void
  onerror?: (event: SpeechRecognitionErrorEvent) => void
  onend?: () => void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

// Ambiente Node para scripts/PM2 (nao usar no client)
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL?: string
    VITE_SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE?: string
    FF_MEILISEARCH?: "on" | "off"
    FF_TESSERACT?: "on" | "off"
    FF_OLLAMA?: "on" | "off"
    FF_EMAIL_PROVIDER?: "resend" | "ses" | "off"
    FF_BULLMQ?: "on" | "off"
    FF_POSTHOG?: "on" | "off"
    PORT?: string
    NODE_ENV?: "development" | "production" | "test"
  }
}
