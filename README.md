# TargetSpace v1.0 — public benchmark source

Public source for **TargetSpace v1.0**, a **pre-pilot benchmark protocol for target-specific forecasting under
partial observation**. It evaluates whether a system can make sealed, calibrated forecasts of a specific target's
future observable state transitions — beating R1 population priors and R2 own-routine baselines, and losing skill
under target permutation — instantiated first (synthetically) in the flagship **TS-Personal** track.

**Live:** https://targetspace.org · **Paper:** [Version 1.0 preprint (PDF)](assets/targetspace-paper-v1.0.pdf) · **Benchmark protocol:** v1.0

> **No empirical results yet.** Version 1.0 is a pre-pilot protocol proposal: the protocol and a synthetic harness are
> available; pilot validation is pending. All leaderboard rows are **synthetic illustrative mock baselines**. A high
> score would certify calibrated prospective predictive skill only — not understanding, inner life, causation, or
> permission to act on a person. arXiv is a preprint repository, not a journal.

## The four-bar decision rule
A forecast earns target-specific credit only if it **(1)** beats the population prior (R1), **(2)** beats the target's
own routine (R2), **(3)** stays calibrated, and **(4)** loses skill when scored against the wrong target (permutation
specificity). Proper scoring, calibration, sealing, and evidence ablation are adopted from prior work and cited; the
contribution is their **conjunction**, anchored on the own-routine baseline and the permutation gate.

## Repository contents
- **Website source** — the static v1.0 site (`index.html`, `protocol.html`, `run-harness.html`, `schemas.html`,
  `product-quickstart.html`, `governance.html`, `paper.html`, `benchmark.html`, `tracks.html`, `baselines.html`,
  `leaderboard.html`, `submit.html`, `docs.html`, `faq.html`), with `js/`, `styles.css`, and `css/`.
- **`schemas/`** — the six v1.0 submission JSON Schemas (participant, evidence manifest, forecast, outcome,
  submission, leaderboard) + a README. Illustrative and compatible with the v1.0 protocol; no participant data.
- **`examples/`** — worked example records and the synthetic harness `targetspace_synthetic_demo.py`.
- **`docs/`** — protocol, harness, metrics, baselines, and submission-format documentation (Markdown).
- **`leaderboard/`** — synthetic illustrative mock leaderboard exports (no real results).
- **`paper/`**, **`assets/`** — the Version 1.0 paper PDF.

## Quickstart
```bash
# Run the synthetic harness (deterministic, standard-library only, no human data, no empirical claim)
python examples/targetspace_synthetic_demo.py
```
Then read the protocol on the site (`/protocol`), the submission contract in [`schemas/`](schemas/), and the product
recipe at `/product-quickstart`. A real-data run must satisfy the consent, privacy, and governance requirements
(`/governance`): consenting adults only, on-device/federated processing, no raw-media export, aggregate-only reporting.

## Cite
```bibtex
@misc{targetspace2026,
  title  = {TargetSpace: Benchmarking Personal Intelligence by Target-Specific Forecasting Under Partial Observation},
  author = {Sylvester, Yuri Andrade},
  year   = {2026},
  note   = {Public preprint, Version 1.0; pre-pilot protocol proposal},
  url    = {https://targetspace.org/}
}
```

## Status & governance
Pre-pilot protocol proposal — no empirical results, no official submissions, personal track instantiated
synthetically only. The **inference object, not only the raw signal, is the privacy boundary**; benchmark validity
is not deployment legitimacy. See `SECURITY.md`, `CONTRIBUTING.md`, and the governance page for details.

© 2026 Yuri Andrade Sylvester · TargetSpace · MIT-licensed (see `LICENSE`).

> The target is not a profile; it is an observed trajectory in motion.
