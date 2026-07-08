# Examples

Synthetic, illustrative material for working with TargetSpace-Bench. **None of this is real
data or a real result.**

## Synthetic demonstration harness

```bash
python targetspace_synthetic_demo.py
```

A deterministic, standard-library-only demonstration of the scoring spine: R1 (population
prior) and R2 (own-routine) baselines, strictly proper scoring (log score in bits),
calibration, and the permutation specificity check. It generates synthetic targets, runs a
walk-forward evaluation, and prints an illustrative leaderboard row (Skill over R1/R2). It
uses **no human data** and supports **no empirical claims**.

## Baseline examples (`baselines/`)

- `sample_submission.json` — the shape of a sealed-forecast submission (see
  [`../docs/submission_format.md`](../docs/submission_format.md)).
- `sample_leaderboard_row.json` — one leaderboard row with the full metric set (see
  [`../docs/public_leaderboard_format.md`](../docs/public_leaderboard_format.md)).

The full illustrative leaderboard export lives in [`../leaderboard/`](../leaderboard/).
