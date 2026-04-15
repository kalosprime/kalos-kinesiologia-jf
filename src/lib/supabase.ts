import { createClient } from '@supabase/supabase-js';

// Usamos tu URL real como fallback para que no dé el error de DNS "Failed to fetch"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dpajgsxwtnptkjxrhbrr.supabase.co';

// Un JWT falso para que Supabase tire un error de "Clave inválida" en lugar de crashear la red si no pones la variable.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_key_para_que_no_explote_vercel.fake_signature';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
