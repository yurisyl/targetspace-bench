// GET /api/admin/submissions[?status=]  -- list submissions for triage.
import { json, methodNotAllowed, serverError, db } from '../../_lib/http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return methodNotAllowed();
  try {
    const status = new URL(request.url).searchParams.get('status');
    let q = 'SELECT * FROM submissions';
    const binds = [];
    if (status) { q += ' WHERE status = ?'; binds.push(status); }
    q += ' ORDER BY id DESC';
    const { results } = await db(env).prepare(q).bind(...binds).all();
    return json({ ok: true, items: results });
  } catch (e) {
    return serverError(e.message);
  }
}
