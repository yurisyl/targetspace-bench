// POST /api/admin/login  -- verify env credentials, set signed HttpOnly session cookie.
import { json, fail, unauthorized, readJson } from '../../_lib/http.js';
import { createSessionCookie, constantTimeEqual, requireSecret } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return fail(405, 'Method not allowed');
  try {
    const secret = requireSecret(env);
    const user = env.ADMIN_USERNAME;
    const pass = env.ADMIN_PASSWORD;
    if (!user || !pass) return fail(500, 'Admin credentials are not configured on the server');

    const body = await readJson(request);
    const u = String(body.username || '');
    const p = String(body.password || '');

    // constant-time compare; evaluate both to avoid early-exit signal
    const okUser = constantTimeEqual(u, user);
    const okPass = constantTimeEqual(p, pass);
    if (!okUser || !okPass) return unauthorized('Invalid username or password');

    const cookie = await createSessionCookie(user, secret);
    return json({ ok: true, user }, { headers: { 'Set-Cookie': cookie } });
  } catch (e) {
    return fail(500, e.message);
  }
}
