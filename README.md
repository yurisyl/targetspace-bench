# TargetSpace-Bench — website

The official site for **TargetSpace** / **TargetSpace-Bench**, a prospective benchmark
framework for target-specific forecasting under partial observation.

**Live:** https://targetspace.org · **Paper:** [v8.1 PDF](assets/targetspace-bench-paper-v8.1.pdf) · **Status:** pre-pilot proposal (no empirical results claimed)

> Understanding is a capability. Forecasting is a measurement.
> The target is not a profile. The target is a lived trajectory.

This is a **dependency-free static site** — plain HTML, CSS, and a few lines of vanilla
JavaScript. There is **no build step**, no framework, no Node, no Docker. It is designed to
be hosted on **Cloudflare Pages** and to remain globally reachable with no dependency on a
local machine, a tunnel, or a home server.

---

## Repository layout

```
.
├── index.html                 # the single-page site (all sections)
├── styles.css                 # design system + all styles
├── main.js                    # mobile nav, copy-cite, active-section highlight
├── 404.html                   # branded not-found page
├── _headers                   # Cloudflare Pages headers (security + caching)
├── robots.txt
├── sitemap.xml
├── targetspace_synthetic_demo.py   # the deterministic synthetic harness (stdlib only)
└── assets/
    ├── targetspace-bench-paper-v8.1.pdf   # the paper
    ├── favicon.svg
    ├── og.png                 # 1200×630 social/OpenGraph image
    └── og.html                # source used to render og.png (not served)
```

---

## Local development

No tooling required. Either:

```bash
# Option A — just open the file
open index.html

# Option B — serve locally (recommended; makes absolute /paths work)
python3 -m http.server 8000
# then visit http://localhost:8000
```

Edit `index.html` / `styles.css` and refresh. That's the whole loop.

### Regenerating the social image (optional)
`assets/og.png` is rendered from `assets/og.html` with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --screenshot="assets/og.png" "file://$(pwd)/assets/og.html"
```

---

## The synthetic harness

`targetspace_synthetic_demo.py` is a minimal, deterministic, **synthetic-only** demonstration
of the scoring spine (R1/R2 baselines, proper scoring, calibration, evidence-tier ablation,
permutation specificity). Pure Python standard library; runs in under a second:

```bash
python targetspace_synthetic_demo.py
```

It demonstrates the benchmark mechanics. **It uses no human data and reports no empirical
results.** The pre-pilot paper likewise reports none.

---

## Deploy on Cloudflare Pages (recommended path: GitHub integration)

The site is static with **no build command**, so Cloudflare just serves the files.

1. **Push this repo to GitHub** (see below).
2. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** →
   **Connect to Git**.
3. Select the **`targetspace-bench`** repository.
4. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  *(repo root)*
   - **Root directory:** `/`
5. **Save and Deploy.** You get a `*.pages.dev` preview URL within ~30s.

> Do **not** use Cloudflare Tunnel for this site. (Error 1033 on the old origin came from a
> tunnel/origin that was unreachable. A Pages static deploy has no origin to go down.)

### Alternative: direct upload via Wrangler (no GitHub)
```bash
npx wrangler pages deploy . --project-name targetspace-bench
```
(Requires `wrangler login` / a Cloudflare API token. The GitHub path above is preferred
because it auto-deploys on every push and needs no local credentials.)

---

## Custom domain: targetspace.org

In the Pages project → **Custom domains** → **Set up a custom domain**:

1. Add **`targetspace.org`** (and optionally `www.targetspace.org`).
2. If the domain is already on Cloudflare, DNS is configured automatically (a `CNAME`/alias
   to the Pages project). If prompted, accept the suggested records.
3. Wait for the certificate to issue (usually a few minutes). SSL/TLS mode: **Full** or
   **Full (strict)**.

### DNS checklist
- [ ] `targetspace.org` apex → Cloudflare Pages (auto, or `CNAME`-flattened to
      `targetspace-bench.pages.dev`), **Proxied (orange cloud)**.
- [ ] `www.targetspace.org` → `CNAME` to `targetspace.org` (or to the Pages project), proxied.
- [ ] **No** `A`/`CNAME` record pointing at a tunnel, a home IP, or a `localhost` origin.
- [ ] SSL/TLS active; HTTPS loads without warnings.
- [ ] Old origin/tunnel records for the retired site removed.

---

## Deployment acceptance checklist
- [ ] `https://targetspace.org` loads globally.
- [ ] Works with the author's Mac **offline** (static; nothing local in the path).
- [ ] No Cloudflare Tunnel, no `localhost`, no home-server dependency.
- [ ] `assets/targetspace-bench-paper-v8.1.pdf` downloads correctly.
- [ ] Metadata correct: `<title>`, description, OpenGraph, Twitter card, canonical, favicon.
- [ ] Social preview renders (`assets/og.png`).
- [ ] **No** user-facing references to the retired prototype anywhere (copy, metadata,
      filenames, links).

---

## License / contact

© 2026 Yuri Andrade Sylvester · TargetSpace · `yurisyl@gmail.com`

This is a research project; the site and the synthetic harness are provided as-is for review
and reproducibility. Issues and contributions welcome via GitHub.
