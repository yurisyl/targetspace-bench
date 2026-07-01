// Generic, column-whitelisted CRUD over D1 for admin routes.
// Table names come only from this fixed map (never user input); column writes are
// whitelisted; all values are bound parameters -> no SQL injection surface.

import { json, badRequest, notFound, methodNotAllowed, serverError, readJson, db } from './http.js';

export const TABLES = {
  tracks: {
    cols: ['slug', 'code', 'name', 'flagship', 'readiness', 'tagline', 'target_object',
      'evidence_bands', 'horizon', 'example_states', 'validator', 'description', 'sort_order'],
    order: 'sort_order, id',
  },
  splits: {
    cols: ['code', 'name', 'track_slug', 'status', 'description', 'input_format', 'output_format',
      'metrics', 'baselines', 'example_task', 'requirements', 'sort_order'],
    order: 'sort_order, id',
  },
  leaderboard_entries: {
    cols: ['system_name', 'organization', 'track_slug', 'split_code', 'version_tag', 'submission_type',
      'is_mock', 'is_baseline', 'overall_score', 'target_adaptation_gain', 'temporal_order_sensitivity',
      'wrong_target_penalty', 'calibration_error', 'evidence_attribution', 'counterfactual_consistency',
      'long_horizon_degradation', 'modality_contribution', 'paper_url', 'code_url', 'report_url',
      'submitted_at', 'notes', 'sort_order'],
    order: '(overall_score IS NULL), overall_score DESC, target_adaptation_gain DESC, id',
  },
  faq_items: { cols: ['question', 'answer', 'category', 'published', 'sort_order'], order: 'sort_order, id' },
  doc_sections: { cols: ['slug', 'title', 'category', 'body', 'published', 'sort_order'], order: 'sort_order, id' },
  announcements: { cols: ['title', 'body', 'level', 'published', 'pinned'], order: 'pinned DESC, id DESC' },
  benchmark_versions: { cols: ['tag', 'name', 'status', 'is_current', 'released_at', 'notes', 'sort_order'], order: 'sort_order, id' },
  // submissions: admin may only update triage fields.
  submissions: { cols: ['status', 'review_notes'], order: 'id DESC' },
};

export async function listAll(env, table) {
  const t = TABLES[table];
  const { results } = await db(env).prepare(`SELECT * FROM ${table} ORDER BY ${t.order}`).all();
  return results;
}

export async function createRow(env, table, body) {
  const t = TABLES[table];
  const cols = t.cols.filter((c) => body[c] !== undefined);
  if (!cols.length) throw new Error('No valid fields supplied');
  const placeholders = cols.map(() => '?').join(', ');
  const values = cols.map((c) => normalize(body[c]));
  const res = await db(env).prepare(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`
  ).bind(...values).run();
  return db(env).prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(res.meta.last_row_id).first();
}

export async function updateRow(env, table, id, body) {
  const t = TABLES[table];
  const cols = t.cols.filter((c) => body[c] !== undefined);
  if (!cols.length) throw new Error('No valid fields supplied');
  const set = cols.map((c) => `${c} = ?`).join(', ');
  const values = cols.map((c) => normalize(body[c]));
  const extra = table === 'submissions' ? ", updated_at = datetime('now')" : '';
  const res = await db(env).prepare(
    `UPDATE ${table} SET ${set}${extra} WHERE id = ?`
  ).bind(...values, id).run();
  if (!res.meta.changes) return null;
  return db(env).prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
}

export async function deleteRow(env, table, id) {
  const res = await db(env).prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  return res.meta.changes > 0;
}

// Booleans -> 0/1; everything else passes through (D1 binds strings/numbers/null).
function normalize(v) {
  if (v === true) return 1;
  if (v === false) return 0;
  return v;
}

// Route factory: GET (list) + POST (create) on a collection.
export function collection(table) {
  return async ({ request, env }) => {
    try {
      if (request.method === 'GET') return json({ ok: true, items: await listAll(env, table) });
      if (request.method === 'POST') {
        const body = await readJson(request);
        return json({ ok: true, item: await createRow(env, table, body) }, { status: 201 });
      }
      return methodNotAllowed();
    } catch (e) {
      return serverError(e.message);
    }
  };
}

// Route factory: PATCH (update) + DELETE on a single item by :id.
export function item(table) {
  return async ({ request, env, params }) => {
    try {
      const id = Number(params.id);
      if (!Number.isInteger(id) || id <= 0) return badRequest('Invalid id');
      if (request.method === 'PATCH' || request.method === 'PUT') {
        const body = await readJson(request);
        const row = await updateRow(env, table, id, body);
        if (!row) return notFound('Row not found');
        return json({ ok: true, item: row });
      }
      if (request.method === 'DELETE') {
        const okDel = await deleteRow(env, table, id);
        if (!okDel) return notFound('Row not found');
        return json({ ok: true });
      }
      return methodNotAllowed();
    } catch (e) {
      return serverError(e.message);
    }
  };
}
