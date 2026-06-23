import { createClient } from '@supabase/supabase-js';
import { authStorageAdapter } from '@/store/authStore';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: authStorageAdapter,
      storageKey: 'cee_token',
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
