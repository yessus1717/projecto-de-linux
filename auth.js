// auth.js — Cliente de Supabase compartido para LinuxPath
// Incluye este script (con type="module") en cualquier página que necesite
// saber si hay sesión activa o llamar a supabase.auth.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://spaeaqzqbyvbarsotjzr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4GU6rGuZXPDBZkNfSuGwsg_lR_0VPle';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirige a login.html si no hay sesión. Úsalo en páginas protegidas
// (por ejemplo linuxpath-prototipo.html) así:
//   import { requireAuth } from './auth.js';
//   requireAuth();
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// Devuelve la sesión actual sin redirigir (para usarla en la nav, por ejemplo).
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}
