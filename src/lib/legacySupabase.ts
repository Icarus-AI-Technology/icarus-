import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Helper que expõe o client do Supabase sem as restrições de tipagem
 * geradas automaticamente. Útil para consultar tabelas que ainda não
 * foram mapeadas em `Database`.
 */
export type LegacySupabaseClient = SupabaseClient<any>;

export const legacySupabase = supabase as unknown as LegacySupabaseClient;

