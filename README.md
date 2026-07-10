# TargetSpace-Bench — benchmark portal

The site + public repo for **TargetSpace v1.0**, a **pre-pilot benchmark protocol for
target-specific forecasting under partial observation**. It evaluates whether a system can make
sealed, calibrated forecasts of a specific target's future observable state transitions —
beating R1 population priors and R2 own-routine baselines, and losing skill under target
permutation — instantiated first (synthetically) in the flagship **TS-Personal** track.

**Live:** https://targetspace.org · **Paper:** [Version 1.0 preprint (PDF)](assets/targetspace-paper-v1.0-final.pdf) · **Benchmark protocol:** v1.0 · **Schemas:** [`schemas/`](schemas/)

> **No empirical results yet.** Version 1.0 is a pre-pilot protocol proposal: protocol and synthetic
> harness available, pilot validation pending. All leaderboard rows are synthetic illustrative mock
> baselines. A high score would certify calibrated prospective predictive skill only — not
> understanding, inner life, causation, or permission to act on a person. arXiv is a preprint
> repository, not a journal.

Contents: the Version 1.0 paper PDF (`assets/`), the synthetic harness (`targetspace_synthetic_demo.py`),
the v1.0 submission **schemas** (`schemas/`), worked **examples** (`examples/`), and the website.
Cite via `paper.html` or `assets/targetspace-paper-v1.0-final.pdf`.

> The target is not a profile; it is an observed trajectory in motion.

## Architecture

A static frontend served by **Cloudflare Pages**, with a wired backend on the same free
deploy path:

- **Frontend** — dependency-free multi-page HTML/CSS, vanilla JS. Shared nav/footer are
  injected by `js/layout.js`; data pages hydrate from the API. No build step.
- **Backend** — **Cloudflare Pages Functions** in `functions/` (the API).
- **Database** — **Cloudflare D1** (SQLite), bound as `DB`.
- **Auth** — admin sessions via an HMAC-signed, HttpOnly, Secure, SameSite cookie. Admin
  credentials come from environment secrets; nothing secret ships to the browser.

```
index.html benchmark.html tracks.html leaderboard.html submit.html
docs.html baselines.html paper.html faq.html  admin/{login,index}.html
css/portal.css  js/{api,layout,home,tracks,leaderboard,submit,faq,docs,admin}.js
functions/_lib/{http,auth,crud}.js
functions/api/{tracks,splits,leaderboard,submissions,faq,docs,announcements,versions}.js
functions/api/admin/{_middleware,login,logout,session,...}  (CRUD per entity)
schema.sql  seed.sql  wrangler.toml  .env.example
```

### Data model (D1)

`admins` · `benchmark_versions` · `tracks` (domain tracks, Table 8) · `splits` (eval
regimes) · `leaderboard_entries` · `submissions` · `faq_items` · `doc_sections` ·
`announcements`.

### Track hierarchy

- **TargetSpace** = the framework.
- **TS-Personal** = flagship track (current / synthetic pre-pilot).
- **TS-Health, TS-Energy** = planned · **TS-Robotics, TS-Enterprise** = research.
- **Evaluation splits** (TS-Short / Long / Shift / Counterfactual / Multimodal / Private)
  are task regimes within the flagship track.

All tracks share one scoring spine: sealed walk-forward forecasts, R1 (population prior),
R2 (own-routine baseline), calibration gate, permutation specificity, evidence ablation,
deterministic outcome validation.

## Local development

Requires Node and [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

```bash
# 1. install Wrangler (and dev deps)
npm install

# 2. configure local secrets
cp .dev.vars.example .dev.vars     # then edit ADMIN_PASSWORD / SESSION_SECRET

# 3. create + seed a LOCAL D1 database
npm run db:reset:local             # = db:schema:local && db:seed:local

# 4. run the site + API locally (http://localhost:8788)
npm run dev

# 5. sanity check (syntax of all JS + SQL validity)
npm run check
```

### Admin login

- Visit `/admin` (redirects to `/admin/login` if not signed in).
- Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from your `.dev.vars` (or production
  secrets). The dashboard supports: triaging submissions (approve / reject / verified /
  private-eval), and full CRUD for leaderboard entries, tracks, splits, FAQ, docs,
  announcements, and benchmark versions.

## Deployment (Cloudflare Pages)

```bash
# one-time: create the production D1 database, then paste its id into wrangler.toml
npm run db:create

# apply schema + seed to the REMOTE database
npm run db:schema:remote
npm run db:seed:remote

# set production secrets (encrypted; never committed)
npx wrangler pages secret put ADMIN_USERNAME
npx wrangler pages secret put ADMIN_PASSWORD
npx wrangler pages secret put SESSION_SECRET    # openssl rand -hex 32

# deploy (static assets + Functions in one shot)
npm run deploy
```

In the Cloudflare dashboard, bind the D1 database to the Pages project
(**Settings → Functions → D1 bindings**, name `DB`) if it is not already bound via
`wrangler.toml`. `.assetsignore` keeps backend source and secrets out of the static upload.

## Environment variables

See [.env.example](.env.example). Required: `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
`SESSION_SECRET` (>= 16 chars; sign sessions). Optional: `ALLOWED_ORIGINS`.

## Notes

- **All leaderboard data is illustrative mock baselines.** No official submissions or
  empirical results are claimed. Rows are labeled `mock` and gated behind a pilot banner.
- The synthetic harness (`targetspace_synthetic_demo.py`) uses no human data.

© 2026 Yuri Andrade Sylvester · TargetSpace · `yurisyl@gmail.com`
