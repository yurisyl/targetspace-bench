// GET /api/leaderboard[?track=&split=&type=&version=&org=]  -- public leaderboard.
import { json, methodNotAllowed, serverError, db } from '../_lib/http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return methodNotAllowed();
  try {
    const sp = new URL(request.url).searchParams;
    // map query param -> fixed column name (never user-controlled column)
    const FILTERS = {
      track: 'track_slug',
      split: 'split_code',
      type: 'submission_type',
      version: 'version_tag',
      org: 'organization',
    };
    const where = [];
    const binds = [];
    for (const [qp, col] of Object.entries(FILTERS)) {
      const v = sp.get(qp);
      if (v) { where.push(`${col} = ?`); binds.push(v); }
    }
    let q = 'SELECT * FROM leaderboard_entries';
    if (where.length) q += ' WHERE ' + where.join(' AND ');
    q += ' ORDER BY (overall_score IS NULL), overall_score DESC, target_adaptation_gain DESC, id';
    const { results } = await db(env).prepare(q).bind(...binds).all();
    return json({ ok: true, items: results });
  } catch (e) {
    return serverError(e.message);
  }
}
