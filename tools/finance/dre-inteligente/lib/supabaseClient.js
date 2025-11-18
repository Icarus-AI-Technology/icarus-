import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[DRE-INTELIGENTE] Variáveis de ambiente do Supabase não configuradas. " +
      "Defina SUPABASE_URL e SUPABASE_ANON_KEY (ou equivalente)."
  );
}

export const supabase = createClient(url, anonKey);

