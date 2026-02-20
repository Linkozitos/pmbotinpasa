import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const STORAGE_KEYS = {
  URL: 'SUPABASE_URL',
  ANON_KEY: 'SUPABASE_ANON_KEY',
};

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const isPlaceholder = (val: string | undefined) => 
    !val || val.includes('your-supabase') || val === '';

  // Prioridade 1: ENV válidas
  if (!isPlaceholder(envUrl) && !isPlaceholder(envKey)) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  // Prioridade 2: LocalStorage
  const localUrl = localStorage.getItem(STORAGE_KEYS.URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, source: 'local' };
  }

  return null;
};

const config = getSupabaseConfig();

export const supabase = config 
  ? createClient<Database>(config.url, config.key, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

export const assertSupabase = () => {
  if (!supabase) {
    throw new Error("Configuração do Supabase necessária.");
  }
  return supabase;
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  window.location.href = '/setup';
};
