# Public leaderboard export format

The public leaderboard is exported as static files under [`../leaderboard/`](../leaderboard/):

- `public_leaderboard.json` — machine-readable, with a metadata header.
- `public_leaderboard.csv` — flat table, one row per entry.

> **All rows are illustrative mock baselines** (`is_mock: true`). No official submissions or
> empirical results exist yet. Do not present these numbers as real results.

## JSON shape

```json
{
  "benchmark": "TargetSpace-Bench",
  "version": "v1.0",
  "status": "pre-pilot",
  "note": "Illustrative mock baselines only. No empirical results are claimed.",
  "entries": [
    {
      "system_name": "TargetSpace reference",
      "organization": "TargetSpace",
      "track": "ts-personal",
      "split": "TS-Long",
      "version": "v1.0",
      "submission_type": "baseline",
      "is_mock": true,
      "metrics": { "...": 0.0 }
    }
  ]
}
```

## Fields

| Field | Meaning |
|---|---|
| `system_name`, `organization` | the entry and its owner |
| `track`, `split`, `version` | domain track, evaluation split, benchmark version |
| `submission_type` | `baseline` \| `public` \| `verified` \| `private_eval` |
| `is_mock` | `true` for illustrative/pilot rows |

## Metrics (direction noted)

| Metric | Meaning | Better |
|---|---|---|
| `overall_score` | illustrative pilot roll-up (display only) | higher |
| `target_adaptation_gain` | Skill in bits over R2 (**headline**) | higher |
| `temporal_order_sensitivity` | skill lost under shuffled history | higher |
| `wrong_target_penalty` | skill lost under the permutation gate | higher |
| `calibration_error` | top-label ECE | **lower** |
| `evidence_attribution` | whether cited evidence supports the forecast | higher |
| `counterfactual_consistency` | coherence of action-conditioned forecasts | higher |
| `long_horizon_degradation` | skill decay at long horizon | **lower** |
| `modality_contribution` | marginal skill from added evidence streams | higher |

The canonical signal is `target_adaptation_gain` (skill over R2), gated by calibration and
target specificity. `overall_score` is an illustrative roll-up, not an adjudication composite.
