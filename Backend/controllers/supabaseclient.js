import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
dotenv.config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eGh3enRrbWh6eXJjd291cG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTQ1MTMsImV4cCI6MjA2NzE5MDUxM30.87GhA7C5b9RVsp49EnwZBq-LRDsbviEPSsE1bFjkYOM';
// Use your actual anon/public API key

export const supabase = createClient(supabaseUrl, supabaseKey);

