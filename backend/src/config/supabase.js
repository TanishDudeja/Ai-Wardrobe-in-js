const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase PostgreSQL Client initialized successfully!');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not found in .env (Add SUPABASE_URL and SUPABASE_ANON_KEY to enable).');
}

const isSupabaseConfigured = () => {
  return !!(supabase && supabaseUrl && supabaseKey);
};

module.exports = {
  supabase,
  isSupabaseConfigured,
};
