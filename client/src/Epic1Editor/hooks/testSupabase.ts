// Quick test to verify Supabase configuration
import { createClient } from '@supabase/supabase-js';

export const testSupabaseConnection = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('Supabase Configuration Test:');
  console.log('URL configured:', !!supabaseUrl);
  console.log('Anon Key configured:', !!supabaseAnonKey);

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('✅ Supabase client created successfully');

      // Test basic auth
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.log('⚠️ Auth error:', error.message);
        } else {
          console.log(
            '✅ Auth check:',
            data.session ? 'Authenticated' : 'Not authenticated'
          );
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error);
      return false;
    }
  } else {
    console.log(
      '⚠️ Supabase not configured. File operations will use local storage only.'
    );
    return false;
  }
};
