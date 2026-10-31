// ====================================================================
// KONFIGURASI SUPABASE
// ====================================================================
// Catatan keamanan:
// - Kunci di bawah ini adalah kunci "anon" (publik). Memang dirancang agar terlihat
//   di browser; yang melindungi data adalah Row Level Security (RLS) di database
//   + sistem login/sesi (fungsi login_siswa) yang sudah dibuat di Supabase.
// - JANGAN PERNAH menaruh kunci "service_role" di file mana pun di folder ini.
const SUPABASE_URL = "https://mzzcdsekhzfykcrpqzrg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16emNkc2VraHpmeWtjcnBxenJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTg5MjcsImV4cCI6MjA5OTc3NDkyN30.ThVQwvj0Tu4EwMrD5iEcqsoO3e8j9SXAthZFhfkSFf0";
