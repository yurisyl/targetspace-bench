#!/usr/bin/env node
// Lightweight build check (no framework): syntax-check every JS file with
// `node --check`, and validate schema.sql + seed.sql against sqlite3.
import { readdirSync, statSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let fails = 0;
const note = (ok, msg) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) fails++; };

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.git' || e === '.wrangler') continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (['.js', '.mjs'].includes(extname(p))) out.push(p);
  }
  return out;
}

console.log('== syntax check (node --check) ==');
const jsFiles = [
  ...walk(join(root, 'functions')),
  ...walk(join(root, 'js')),
  ...walk(join(root, 'scripts')),
  ...(existsSync(join(root, 'main.js')) ? [join(root, 'main.js')] : []),
];
for (const f of jsFiles) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  note(r.status === 0, f.replace(root, '') + (r.status ? '\n        ' + (r.stderr || '').trim().split('\n')[0] : ''));
}

console.log('== SQL validation (sqlite3) ==');
const hasSqlite = spawnSync('sqlite3', ['--version'], { encoding: 'utf8' }).status === 0;
if (!hasSqlite) {
  note(true, 'sqlite3 not installed; skipping SQL validation (non-blocking)');
} else {
  const db = join(tmpdir(), `ts-check-${process.pid}.sqlite`);
  try { rmSync(db, { force: true }); } catch {}
  const runSql = (file) => spawnSync('sqlite3', [db], { input: readFileSync(join(root, file), 'utf8'), encoding: 'utf8' });
  for (const file of ['schema.sql', 'seed.sql']) {
    if (!existsSync(join(root, file))) { note(false, `${file} missing`); continue; }
    const r = runSql(file);
    const errOut = (r.stderr || '').trim();
    note(r.status === 0 && !errOut, file + (errOut ? ': ' + errOut.split('\n')[0] : ' valid'));
  }
  try { rmSync(db, { force: true }); } catch {}
}

console.log(`\ncheck: ${fails ? 'FAIL' : 'PASS'} (${fails} failure(s), ${jsFiles.length} JS files)`);
process.exit(fails ? 1 : 0);
