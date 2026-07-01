// GET /api/announcements  -- published announcements (pinned first).
import { json, methodNotAllowed, serverError, db } from '../_lib/http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return methodNotAllowed();
  try {
    const { results } = await db(env)
      .prepare('SELECT * FROM announcements WHERE published = 1 ORDER BY pinned DESC, id DESC')
      .all();
    return json({ ok: true, items: results });
  } catch (e) {
    return serverError(e.message);
  }
}
