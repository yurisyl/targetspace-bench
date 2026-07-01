// GET /api/faq  -- published FAQ items.
import { json, methodNotAllowed, serverError, db } from '../_lib/http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return methodNotAllowed();
  try {
    const { results } = await db(env)
      .prepare('SELECT * FROM faq_items WHERE published = 1 ORDER BY sort_order, id')
      .all();
    return json({ ok: true, items: results });
  } catch (e) {
    return serverError(e.message);
  }
}
