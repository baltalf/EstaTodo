import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Modo Hackathon Debug: Verificamos qué está llegando realmente
console.log("=== CHECK SUPABASE ===");
console.log("URL:", supabaseUrl ? "Existe ✔️" : "VACÍA ❌");
console.log("KEY:", supabaseKey ? `Empieza con ${supabaseKey.substring(0, 10)}... ✔️` : "VACÍA ❌");

export const supabase = createClient(supabaseUrl, supabaseKey)