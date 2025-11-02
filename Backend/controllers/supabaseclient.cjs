import { createClient } from '@supabase/supabase-js';
require("dotenv").config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_key;
// Use your actual anon/public API key

export const supabase = createClient(supabaseUrl, supabaseKey);

