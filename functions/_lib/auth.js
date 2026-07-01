// Stateless admin sessions: an HMAC-SHA256-signed token in an HttpOnly cookie.
// Web Crypto only; no dependencies, no secrets in the client bundle.

const COOKIE = 'ts_admin';
const TTL_SECONDS = 60 * 60 * 8; // 8 hours
const enc = new TextEncoder();

function b64url(bytes) {
  let bin = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
async function sign(data, secret) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(sig);
}
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export const constantTimeEqual = timingSafeEqual;

export function requireSecret(env) {
  const secret = env && env.SESSION_SECRET;
  if (!secret || String(secret).length < 32) {
    throw new Error('SESSION_SECRET is not configured (need >= 32 characters / 256-bit).');
  }
  return secret;
}

export async function createSessionCookie(username, secret) {
  const payload = { u: username, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS };
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await sign(payloadB64, secret);
  const token = `${payloadB64}.${sig}`;
  return [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${TTL_SECONDS}`,
  ].join('; ');
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

export async function verifySession(request, secret) {
  const token = getCookie(request, COOKIE);
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await sign(payloadB64, secret);
  if (!timingSafeEqual(sig, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
  } catch {
    return null;
  }
  if (!payload || typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload; // { u, exp }
}
