// GET /api/admin/session  -- report whether the caller has a valid admin session.
import { json } from '../../_lib/http.js';
import { verifySession, requireSecret } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  try {
    const session = await verifySession(request, requireSecret(env));
    return json({ ok: true, authenticated: !!session, user: session ? session.u : null });
  } catch {
    return json({ ok: true, authenticated: false, user: null });
  }
}
