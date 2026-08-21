// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// passcode: cgP93XmksO6rUGXk
// Replace these with your actual Supabase URL and Anon Key from Step 1
const SUPABASE_URL = 'https://ddpkyttvoamwkrspnfvf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcGt5dHR2b2Ftd2tyc3BuZnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTQyMTksImV4cCI6MjEwMjg5MDIxOX0.WJHzSGOMPcglDM7an6qvETQmPGEXZoYjKKEZoITmJ5g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)