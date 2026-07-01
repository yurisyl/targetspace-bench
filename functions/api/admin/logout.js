// POST /api/admin/logout  -- clear the session cookie.
import { json, methodNotAllowed } from '../../_lib/http.js';
import { clearSessionCookie } from '../../_lib/auth.js';

export async function onRequest({ request }) {
  if (request.method !== 'POST') return methodNotAllowed();
  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}
