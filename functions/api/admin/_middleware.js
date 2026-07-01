// Auth guard for every /api/admin/* route except login/logout/session.
import { verifySession, requireSecret } from '../../_lib/auth.js';
import { unauthorized, serverError } from '../../_lib/http.js';

const OPEN = new Set(['/api/admin/login', '/api/admin/logout', '/api/admin/session']);

export async function onRequest(context) {
  const { request, env, next } = context;
  const path = new URL(request.url).pathname;
  if (OPEN.has(path)) return next();
  try {
    const session = await verifySession(request, requireSecret(env));
    if (!session) return unauthorized('Admin authentication required');
    context.data = context.data || {};
    context.data.admin = session;
    return next();
  } catch (e) {
    return serverError(e.message);
  }
}
