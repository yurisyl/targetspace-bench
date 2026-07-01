// PATCH/DELETE /api/admin/submissions/:id  -- triage a submission.
import { json, badRequest, notFound, methodNotAllowed, serverError, readJson, db } from '../../../_lib/http.js';

const STATUSES = new Set(['pending_review', 'approved', 'rejected', 'public', 'verified', 'private_eval']);

export async function onRequest({ request, env, params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('Invalid id');

    if (request.method === 'DELETE') {
      const r = await db(env).prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
      return r.meta.changes ? json({ ok: true }) : notFound('Submission not found');
    }

    if (request.method === 'PATCH' || request.method === 'PUT') {
      const body = await readJson(request);
      const sets = [];
      const binds = [];
      if (body.status !== undefined) {
        if (!STATUSES.has(String(body.status))) return badRequest('Invalid status value');
        sets.push('status = ?');
        binds.push(String(body.status));
      }
      if (body.review_notes !== undefined) {
        sets.push('review_notes = ?');
        binds.push(body.review_notes == null ? null : String(body.review_notes).slice(0, 2000));
      }
      if (!sets.length) return badRequest('Nothing to update');
      sets.push("updated_at = datetime('now')");
      const r = await db(env).prepare(`UPDATE submissions SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, id).run();
      if (!r.meta.changes) return notFound('Submission not found');
      const row = await db(env).prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first();
      return json({ ok: true, item: row });
    }

    return methodNotAllowed();
  } catch (e) {
    return serverError(e.message);
  }
}
