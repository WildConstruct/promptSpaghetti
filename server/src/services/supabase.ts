import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let supabasePublic: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return null;
  supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  return supabase;
}

export function getSupabasePublic(): SupabaseClient | null {
  if (supabasePublic) return supabasePublic;
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  supabasePublic = createClient(url, anonKey, { auth: { persistSession: false } });
  return supabasePublic;
}

/**
 * Verify a Supabase JWT access token and return the user id if valid.
 */
export async function verifySupabaseToken(token?: string): Promise<string | null> {
  if (!token) return null;
  const pub = getSupabasePublic();
  if (!pub) return null;
  try {
    const { data, error } = await pub.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
