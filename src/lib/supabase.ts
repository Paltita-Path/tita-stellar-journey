import { createClient } from "@supabase/supabase-js";

// Supabase client for the frontend
// NOTE: In Lovable, backend secrets should be stored in Supabase Secrets and used by Edge Functions.
// The anon key is public and safe to use on the client.
// For export (Vercel/GitHub), you can replace these with env vars.
const SUPABASE_URL = "https://gatkzfaguwuyxpywtbez.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdGt6ZmFndXd1eXhweXd0YmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjU1MzUsImV4cCI6MjA3MDMwMTUzNX0.0iLX7EP4UyD7tCrHudOzb50PSNkjPNYME85ipt2eF1U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
