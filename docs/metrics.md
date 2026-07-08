# Metrics (Version 1.0 — reference specification)

Reported **per horizon and per evidence tier**; never pooled into a single composite.

## Primary

- **Log score** (bits) — strictly proper; the primary rule.
- **Skill over R1** and **Skill over R2** — paired log-score improvement in bits per
  forecast; Skill over R2 is the headline quantity.
- **Brier score** — secondary proper-scoring robustness check.
- **Calibration** — top-label ECE bands (≤0.10 pass / ≤0.20 warn / >0.20 fail), plus
  calibration intercept/slope where sample size permits.
- **Permutation-control delta** — true-pairing Skill minus matched wrong-pairing Skill
  (absolute and proportional); target-specific skill collapses.
- **Evidence-ablation delta** — Skill over R2 per evidence tier (L0–L6).

## Secondary diagnostics (where applicable)

- AUROC / AUPRC for binary answer spaces.
- Top-k accuracy for ranked candidate states.
- Lead-time / horizon-specific performance curves.

## Reporting contract

Every run row discloses simultaneously: Skill vs R1, Skill vs R2, calibration
(pass/warn/fail), permutation result (collapses/survives), lift by evidence tier, number
of resolved forecasts, horizon, and target domain — so target-specific skill is
distinguishable from generic prediction at a glance.

**Status:** reference specification; pilot validation pending.
