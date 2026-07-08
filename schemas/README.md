# TargetSpace v1.0 submission schemas

Version 1.0 public submission schemas for the TargetSpace benchmark protocol. They are **illustrative and compatible
with the v1.0 protocol** — a machine-readable contract for formatting a run, not an empirical result.

- **The paper is authoritative** if there is any conflict:
  *TargetSpace: Benchmarking Personal Intelligence by Target-Specific Forecasting Under Partial Observation* (Version 1.0, pre-pilot preprint).
- **No participant data is included.** These are schema definitions only.
- **Worked example records** live in [`../examples/`](../examples/); the synthetic harness is `targetspace_synthetic_demo.py`.

## Files

| Schema | Holds |
|---|---|
| `participant.schema.json` | target instance: `participant_id`, timezone, routine profile, allowed tasks |
| `evidence_manifest.schema.json` | evidence tier (L0–L6), modalities, `evidence_cutoff_time`, hash manifest |
| `forecast.schema.json` | sealed probability vector over the answer space, `evidence_cutoff_time`, metadata |
| `outcome.schema.json` | deterministically resolved label (`observed_answer`, resolver, method) |
| `submission.schema.json` | run manifest: environment, seeds, reproducibility notes |
| `leaderboard.schema.json` | reporting row: Skill vs R1/R2, calibration, permutation, tier lift, counts |

## Abstract forecast unit → concrete fields
The paper's forecast unit `(i, E≤t, q, A, r)` instantiates in the TS-Personal schemas as: target `i` → `participant_id`,
instance → `task_id`, query type `q` → `task_type`, answer space `A` → `answer_space`, resolved label → `observed_answer`,
evidence window/modality → `modalities` with `evidence_cutoff_time`.

## Status
Version 1.0 is a **pre-pilot protocol proposal**: no empirical results, no official submissions, and the personal track is
instantiated synthetically only. A high score would certify calibrated prospective predictive skill only — not
understanding, access to inner life, causation, or permission to act on a person.
