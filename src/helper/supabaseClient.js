import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// Create a Supabase client instance
const supabase = createClient(supabaseURL, supabaseAnonKey);

export default supabase;