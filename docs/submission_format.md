# Submission format

Official submissions open with the first benchmark version. Today you can run the synthetic
harness, submit results on it, or request a private evaluation. Submissions are made through
the live site's `/submit` flow and are reviewed before appearing on the leaderboard.

## Submission tiers

| Tier | Meaning |
|---|---|
| **Public** (unofficial) | self-reported on the open/synthetic split; clearly labeled |
| **Verified** | the organizer reproduces the result from submitted code |
| **Private eval** | the organizer runs your system on a frozen, hidden split, end to end |

## What a submission bundles

- A **results file** of sealed forecasts (or, for private eval, a runnable system).
- **Metadata**: model/system name, output adapter, training cutoff, track, split, version.
- **Attestations**: no future leakage; reproducibility agreement.

## Sealed forecast record

Results are line-delimited JSON, one sealed forecast per line:

```json
{
  "instance_id": "p03-2026w23-001",
  "track": "ts-personal",
  "split": "TS-Long",
  "version": "v1.0",
  "forecast_time": "2026-06-08T09:00:00Z",
  "resolution_time": "2026-06-10T17:00:00Z",
  "answer_space": ["completes", "defers"],
  "distribution": [0.30, 0.70],
  "sha256": "<hash of the sealed payload>"
}
```

Rules:
- `distribution` must be a valid probability vector over `answer_space` (sums to 1; use a
  pre-registered nonzero floor).
- The record must be **sealed before the outcome exists**: only evidence timestamped
  ≤ `forecast_time` may inform it.
- Outcomes are resolved by deterministic rules and are never edited after sealing.

See [`examples/baselines/sample_submission.json`](../examples/baselines/sample_submission.json)
for a minimal example.

## No future leakage

Only evidence available at or before each `forecast_time` may be used. Random
cross-validation, outcome peeking, or training on the resolution window invalidates a
submission. See [`evaluation_protocol.md`](evaluation_protocol.md).
