import { createClient } from '@supabase/supabase-js';

// Usamos tu URL real como fallback para que no dé el error de DNS "Failed to fetch"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dpajgsxwtnptkjxrhbrr.supabase.co';

// Usamos tu clave anon pública real como fallback para que la conexión funcione de inmediato
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWpnc3h3dG5wdGtqeHJoYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg1MTMsImV4cCI6MjA5MTgxNDUxM30.v4h9r16Z_zOmeAI0OTEzcEwp-wzw-FqpmugkmVxYBOc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
