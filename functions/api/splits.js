// GET /api/splits[?track=ts-personal]  -- evaluation splits (task regimes).
import { json, methodNotAllowed, serverError, db } from '../_lib/http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return methodNotAllowed();
  try {
    const track = new URL(request.url).searchParams.get('track');
    let q = 'SELECT * FROM splits';
    const binds = [];
    if (track) { q += ' WHERE track_slug = ?'; binds.push(track); }
    q += ' ORDER BY sort_order, id';
    const { results } = await db(env).prepare(q).bind(...binds).all();
    return json({ ok: true, items: results });
  } catch (e) {
    return serverError(e.message);
  }
}
