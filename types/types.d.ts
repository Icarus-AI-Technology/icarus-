import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

declare module "@/*";
declare module "@/lib/*";
declare module "@/services/*";
declare module "@/api/*";
declare module "@/hooks/*";
declare module "@/components/*";
declare module "@/ui/*";
declare module "@/finance/*";
declare module "@/types/finance";

type User = SupabaseUser;
type Session = SupabaseSession;

declare namespace Finance {
  interface LancamentoFinanceiro {
    id: string;
    valor: number;
    tipo: "credito" | "debito";
    criadoEm?: string;
  }
}
