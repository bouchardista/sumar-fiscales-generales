import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Configuración Supabase:', {
  url: supabaseUrl ? '✅ Configurada' : '❌ Faltante',
  key: supabaseAnonKey ? '✅ Configurada' : '❌ Faltante'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

console.log('✅ Cliente Supabase inicializado correctamente');
