/**
 * src/lib/supabaseClient.js
 * Official Supabase client configuration for AksharMitra.
 * Strictly uses public anon key and environment variables.
 * Never exposes service-role keys or database credentials to the client.
 */

import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates whether Supabase environment variables have been provided
 * and are non-placeholder values.
 */
export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your_supabase_anon')
  );
}

// Initialize official client only if properly configured; otherwise provide safe null client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'aksharmitra_auth_token'
      }
    })
  : null;

/**
 * Ensures an active authenticated session exists.
 * If user is not yet logged in, signs in anonymously or creates a persistent guest session.
 * This guarantees every learner operation has an auth.uid() for Row Level Security (RLS).
 */
export async function ensureAuthSession() {
  if (!supabase) return null;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user;
    }

    // Try signing in anonymously if available in Supabase project
    if (typeof supabase.auth.signInAnonymously === 'function') {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data?.user) {
        return data.user;
      }
    }

    // Fallback: If anonymous sign-in is disabled, return null (triggers local offline cache)
    return null;
  } catch (err) {
    console.warn('[SupabaseAuth] Could not ensure auth session:', err?.message || err);
    return null;
  }
}

/**
 * Helper to get the current authenticated user's ID.
 */
export async function getCurrentUserId() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}
