import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zgbsfabczzqdtyvqttxv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYnNmYWJjenpxZHR5dnF0dHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDMyMjQsImV4cCI6MjA5MjYxOTIyNH0.y09L2apdW0ZtsOE-sRb2Te0W0ASsr1lUlV3vJaO9GO0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);