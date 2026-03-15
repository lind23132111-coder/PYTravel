import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase' // This will be generated or defined

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not found. Using placeholder values for local development.')
}

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
)
