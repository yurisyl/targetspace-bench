# Baselines (Version 1.0 — reference specification)

Every run reports against a fixed set of reference conditions.

| Condition | What it is | Role |
|---|---|---|
| **R0** | uniform-random / prevalence floor | sanity only |
| **R1** | population-prior baseline, fit leave-one-out without the scored target's history | the entry condition — beat the crowd |
| **R2** | the target's own-routine baseline (recency-weighted, walk-forward, organizer-fit, frozen) | **the decisive reference** — beat the routine |
| System | the target-specific model under test | the submission |
| Permutation null | the system's forecasts scored against matched wrong-target outcomes | skill must **collapse** |
| Ablation variants | the system re-run per evidence tier | measures what each stream buys |

## The role of R2

R2 is a strong personal routine baseline. **A claimed TargetSpace improvement must beat
R2, not merely beat random or generic replay.** R2 is admitted only where it itself beats
R1, so skill over R2 cannot be manufactured against a weak baseline; its feature set,
recency kernel, minimum history, and admission rule are pre-registered (see the paper's
R2 appendix).

## The full control battery

Zero-/short-/longitudinal-history arms, shuffled-history (temporal order) and wrong-target
(identity) controls, ablated-modality controls, oracle and human anchors, calibration, and
evidence attribution — see [evaluation_protocol.md](evaluation_protocol.md).

**Status:** reference specification; pilot validation pending. No validated leaderboard
results exist.
