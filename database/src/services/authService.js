/**
 * database/src/services/authService.js
 * Dedicated Phone and Password Authentication Service for AksharMitra.
 * Provides user registration, login, and multi-user data isolation.
 * Works seamlessly with Supabase Auth when configured, with robust offline local storage.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const STORAGE_ACCOUNTS_KEY = 'aksharmitra_accounts_v1';
const STORAGE_AUTH_USER_KEY = 'aksharmitra_auth_user_v1';

// Demo judge account constant
export const DEMO_JUDGE_USER = {
  id: 'user_judge_demo',
  name: 'Evaluator / Judge Demo',
  phone: '9999999999',
  isDemo: true,
  createdAt: '2026-01-01T00:00:00.00Z'
};

/**
 * Normalizes phone numbers to standard 10 digits
 */
export function sanitizePhone(phone = '') {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Generates an email alias from phone for Supabase Auth compatibility
 */
function phoneToEmail(phone) {
  const clean = sanitizePhone(phone);
  return `user_${clean}@aksharmitra.app`;
}

/**
 * Retrieves the local accounts database
 */
function getLocalAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[AuthService] Error reading local accounts:', err);
    return [];
  }
}

/**
 * Saves local accounts database
 */
function saveLocalAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('[AuthService] Error saving local accounts:', err);
  }
}

/**
 * Gets currently logged in user session from storage
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Registers a new parent/educator account with phone and password.
 */
export async function registerWithPhone({ name, phone, password }) {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const cleanName = (name || '').trim() || `Parent ${cleanPhone.slice(-4)}`;
  const accounts = getLocalAccounts();

  // Check if account already exists
  const existing = accounts.find((acc) => acc.phone === cleanPhone);
  if (existing) {
    throw new Error('An account with this phone number already exists. Please log in.');
  }

  let userId = `user_${cleanPhone}_${Date.now()}`;

  // If Supabase is connected, attempt remote sign-up
  if (isSupabaseConfigured() && supabase) {
    try {
      const email = phoneToEmail(cleanPhone);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone: cleanPhone,
            name: cleanName
          }
        }
      });

      if (!error && data?.user?.id) {
        userId = data.user.id;
      }
    } catch (err) {
      console.warn('[AuthService] Supabase sign up notice:', err?.message || err);
    }
  }

  const newAccount = {
    id: userId,
    name: cleanName,
    phone: cleanPhone,
    password: password, // Stored for local offline validation
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  saveLocalAccounts(accounts);

  const authUser = {
    id: newAccount.id,
    name: newAccount.name,
    phone: newAccount.phone,
    isDemo: false,
    createdAt: newAccount.createdAt
  };

  localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(authUser));
  return authUser;
}

/**
 * Authenticates an existing user via phone and password.
 */
export async function loginWithPhone({ phone, password }) {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  if (!password) {
    throw new Error('Please enter your password.');
  }

  // 1. Try Supabase sign in if online
  if (isSupabaseConfigured() && supabase) {
    try {
      const email = phoneToEmail(cleanPhone);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data?.user) {
        const authUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || `Parent ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          isDemo: false,
          createdAt: data.user.created_at
        };
        localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(authUser));
        return authUser;
      }
    } catch (err) {
      console.warn('[AuthService] Supabase login error fallback to local:', err?.message || err);
    }
  }

  // 2. Validate against local registry
  const accounts = getLocalAccounts();
  const matched = accounts.find((acc) => acc.phone === cleanPhone);

  if (!matched) {
    throw new Error('No account found with this phone number. Please sign up first.');
  }

  if (matched.password !== password) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  const authUser = {
    id: matched.id,
    name: matched.name,
    phone: matched.phone,
    isDemo: false,
    createdAt: matched.createdAt
  };

  localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(authUser));
  return authUser;
}

/**
 * Logs in as demo judge / evaluator
 */
export function loginDemoJudge() {
  localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(DEMO_JUDGE_USER));
  return DEMO_JUDGE_USER;
}

/**
 * Terminates active user session
 */
export async function logoutUser() {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthService] Sign out error:', err);
    }
  }
  localStorage.removeItem(STORAGE_AUTH_USER_KEY);
}
