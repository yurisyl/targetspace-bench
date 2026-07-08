# Evaluation protocol

TargetSpace is an **evaluation protocol**, not just a dataset. A result is meaningful only
as a battery of conditions — not a single number.

## The scoring spine (every track shares it)

- **Sealed forecasts** — timestamped and hashed (SHA-256) before outcomes exist.
- **Walk-forward (prequential)** — only evidence with timestamp ≤ `t` is visible; indices
  are rebuilt per slice. Random cross-validation is prohibited.
- **R1** — population-prior baseline (the entry condition); estimated without the scored
  target's own history.
- **R2** — the target's recency-weighted, walk-forward own routine (the target-specific
  condition); pre-registered, organizer-fit, frozen, admitted only where it beats R1.
- **Calibration gate** — confidence must track uncertainty.
- **Permutation specificity gate** — skill must collapse when a system's model for `i` is
  scored against another instance's outcomes; skill that does not collapse was not
  target-specific.
- **Evidence-tier ablation** — report skill over R2 as a function of the evidence tier.

## Scoring

Strictly proper scoring: **log score in bits** (primary) and **Brier** (secondary). The
headline quantity is **Skill** — bits over a reference baseline:

```
Skill = (mean_logscore_system - mean_logscore_reference) / ln 2
```

reported against **R1** and **R2**. No composite score is used for adjudication.

## The control battery (recommended for any evaluation)

The central signal is **not** merely whether a model predicts the future, but whether
prediction **improves when the model is given the correct target's history in the correct
temporal order**.

| Control | What it isolates | Expected signal |
|---|---|---|
| Zero-history (R1) | the crowd base rate | entry condition |
| Short-history | where added history first pays | onset of longitudinal value |
| Longitudinal-history | the core regime | the condition the benchmark rewards |
| Own-routine (R2) | routine vs. genuine adaptation | skill over R2 (bits) = headline |
| Shuffled-history | temporal *order* | skill should drop if order matters |
| Wrong-target (permutation) | target *identity* | skill should collapse |
| Ablated-modality | each modality's marginal value | the evidence-tier ablation |
| Retrieval-only | recall vs. understanding | little skill over R2 |
| Human | the achievable range | anchor, not ranked |
| Oracle / context | ceiling performance | approximate upper bound |

## Ablation logic

If target history, temporal order, target identity, or modality do not improve performance,
the benchmark is not measuring its intended capability and the result should be read as
**null**. If performance **improves** under longitudinal, target-specific conditions and
**degrades** under the shuffled-history and wrong-target controls, the system is using
target-specific dynamics rather than generic priors.

## What a positive result establishes

Calibrated, prospective, target-specific predictive skill — *not* understanding in a rich
sense, *not* the superiority of any architecture, and *no* access to a target's inner life.
