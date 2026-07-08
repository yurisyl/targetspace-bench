# Security Policy

## Scope of this repository

This is the **open benchmark** repository: specification, documentation, the synthetic
demonstration harness, baseline examples, and a static leaderboard export. **It contains no
backend, no authentication code, no database credentials, and no operational secrets.**

The **operational website and admin console** (the deployed site source, Cloudflare Pages
Functions, admin/authentication code, and the D1 database schema) are maintained in a
**separate private repository** and are **not** published here. This is deliberate:
operational infrastructure is kept private, and the security of the admin surface does not
depend on the obscurity of any code in this repo.

Operational hardening for the deployed site includes: authenticated admin routes
(HMAC-signed, HttpOnly/Secure/SameSite session cookies), server-side input validation,
rate limiting on public write endpoints, and secrets stored only as encrypted Cloudflare
environment variables (never in source control). Cloudflare Access (or equivalent) in front
of the admin surface is recommended and tracked as operational work.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately** — do not open a public issue for
anything security-sensitive.

- Email: **yurisyl@gmail.com** (subject line: `SECURITY: TargetSpace`)
- Include: a description, reproduction steps, affected URL/endpoint, and impact.
- Please allow a reasonable time for triage and remediation before any public disclosure.

### In scope
- The live site (`https://targetspace.org`): authentication, submission handling,
  injection, access control on admin/API routes, data exposure.
- The benchmark protocol: evaluation-integrity issues (e.g. leakage or scoring flaws).

### Out of scope
- The illustrative mock leaderboard data (clearly labeled; not real results).
- Anything requiring a compromised end-user device or physical access.
- Best-practice suggestions without a demonstrable vulnerability.

## Secrets

No real secrets (`.env`, `.dev.vars`, API keys, passwords, session secrets, database
credentials, or Cloudflare tokens) should ever appear in this repository. History is
scanned with gitleaks. If you believe a secret was committed, report it privately so it can
be rotated immediately.
