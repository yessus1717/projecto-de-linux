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

// ---------- PROGRESO EN LA NUBE (tabla user_progress) ----------
// Guarda el progreso del usuario logueado en Supabase, para que esté
// disponible al entrar desde otro dispositivo. `data` es cualquier
// objeto serializable (xp, racha, lecciones completadas, etc).
// Requiere la tabla user_progress creada con RLS (ver
// supabase_user_progress.sql). Devuelve true si se guardó bien.
export async function saveCloudProgress(data) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { error } = await supabase
    .from('user_progress')
    .upsert({ user_id: session.user.id, data }, { onConflict: 'user_id' });

  if (error) {
    console.error('saveCloudProgress error:', error.message);
    return false;
  }
  return true;
}

// Lee el progreso guardado en Supabase para el usuario logueado.
// Devuelve el objeto `data` guardado, o null si no hay sesión, no hay
// fila todavía (usuario nuevo) o hubo un error.
export async function loadCloudProgress() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: row, error } = await supabase
    .from('user_progress')
    .select('data')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('loadCloudProgress error:', error.message);
    return null;
  }
  return row ? row.data : null;
}
