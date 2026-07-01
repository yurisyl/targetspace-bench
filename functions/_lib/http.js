// Shared HTTP + validation helpers for Pages Functions.
// (Underscore-prefixed directory => ignored by the Pages router, import-only.)

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

export function json(data, init = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...SECURITY_HEADERS,
    ...(init.headers || {}),
  };
  return new Response(JSON.stringify(data), { status: init.status || 200, headers });
}

export const fail = (status, message, extra = {}) =>
  json({ ok: false, error: message, ...extra }, { status });
export const badRequest = (m, e) => fail(400, m || 'Bad request', e);
export const unauthorized = (m) => fail(401, m || 'Unauthorized');
export const forbidden = (m) => fail(403, m || 'Forbidden');
export const notFound = (m) => fail(404, m || 'Not found');
export const methodNotAllowed = () => fail(405, 'Method not allowed');
export const tooMany = (m) => fail(429, m || 'Too many requests');
export const serverError = (m) => fail(500, m || 'Server error');

// --- value coercion / validation ---
export function str(v, max = 2000) {
  if (v === undefined || v === null) return null;
  let s = String(v).trim();
  if (!s.length) return null;
  if (s.length > max) s = s.slice(0, max);
  return s;
}
export function reqStr(v, max) {
  return str(v, max);
}
export function isEmail(v) {
  return typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
export function isHttpUrl(v) {
  if (!v) return true; // optional fields pass
  if (String(v).length > 600) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
export function bool(v) {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
}

export async function readJson(request, maxBytes = 96 * 1024) {
  const text = await request.text();
  if (text.length > maxBytes) throw new Error('Payload too large');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new Error('Invalid JSON body');
  }
}

export async function sha256hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Guard that the D1 binding exists; gives a clear error instead of a opaque crash.
export function db(env) {
  if (!env || !env.DB) {
    throw new Error('Database not configured (missing D1 binding "DB").');
  }
  return env.DB;
}
