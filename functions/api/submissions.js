// POST /api/submissions  -- public submission intake. Writes status='pending_review'.
import {
  json, badRequest, methodNotAllowed, tooMany, serverError,
  readJson, str, isEmail, isHttpUrl, bool, sha256hex, db,
} from '../_lib/http.js';

const TYPES = new Set(['public', 'verified', 'private_eval']);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return methodNotAllowed();
  try {
    const body = await readJson(request);

    const submitter_name = str(body.submitter_name, 120);
    const email = str(body.email, 254);
    const system_name = str(body.system_name, 160);

    if (!submitter_name) return badRequest('Submitter name is required', { field: 'submitter_name' });
    if (!email || !isEmail(email)) return badRequest('A valid email is required', { field: 'email' });
    if (!system_name) return badRequest('System/model name is required', { field: 'system_name' });

    for (const f of ['paper_url', 'code_url', 'report_url', 'results_url']) {
      if (body[f] && !isHttpUrl(body[f])) return badRequest(`Invalid URL in ${f}`, { field: f });
    }
    if (!bool(body.no_leakage)) return badRequest('You must attest to the no-future-leakage policy', { field: 'no_leakage' });
    if (!bool(body.repro_agreement)) return badRequest('You must accept the reproducibility agreement', { field: 'repro_agreement' });

    let typeReq = str(body.submission_type_requested, 40);
    if (typeReq && !TYPES.has(typeReq)) typeReq = null;

    // Coarse spam / rate limit: max 5 submissions per IP per 10 minutes.
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const ip_hash = await sha256hex(ip + '|' + (env.SESSION_SECRET || 'ts'));
    const recent = await db(env)
      .prepare("SELECT COUNT(*) AS n FROM submissions WHERE ip_hash = ? AND created_at > datetime('now','-10 minutes')")
      .bind(ip_hash).first();
    if (recent && recent.n >= 5) return tooMany('Too many submissions from this client. Please wait a few minutes.');

    const fields = {
      submitter_name,
      email,
      organization: str(body.organization, 160),
      system_name,
      track_slug: str(body.track_slug, 60),
      split_code: str(body.split_code, 40),
      version_tag: str(body.version_tag, 40),
      submission_type_requested: typeReq,
      paper_url: str(body.paper_url, 600),
      code_url: str(body.code_url, 600),
      report_url: str(body.report_url, 600),
      results_url: str(body.results_url, 600),
      method_summary: str(body.method_summary, 4000),
      compute_notes: str(body.compute_notes, 1000),
      no_leakage: 1,
      repro_agreement: 1,
      ip_hash,
    };
    const cols = Object.keys(fields);
    const placeholders = cols.map(() => '?').join(', ');
    const res = await db(env)
      .prepare(`INSERT INTO submissions (${cols.join(', ')}) VALUES (${placeholders})`)
      .bind(...cols.map((c) => fields[c]))
      .run();

    return json({ ok: true, id: res.meta.last_row_id, status: 'pending_review' }, { status: 201 });
  } catch (e) {
    return serverError(e.message);
  }
}
