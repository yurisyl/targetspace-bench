# Benchmark harness (Version 1.0 — reference specification)

The **minimal synthetic harness** is a public, runnable reference implementation for:

- validating instance and forecast schemas,
- exercising proper-score and Skill computation,
- checking the R1 and R2 baselines,
- running the permutation control,
- running calibration checks,
- running evidence ablations,
- producing a submission report.

It is a **smoke test plus reference path**: it is *not* the empirical validation dataset,
and it is *not* evidence that the benchmark has been experimentally validated. It uses no
human data. **Pilot validation is pending; nothing here is a validated leaderboard result.**

## Runnable today

```bash
python examples/targetspace_synthetic_demo.py
```

Deterministic, standard-library-only; generates synthetic targets, runs a walk-forward
evaluation with R1/R2, proper scoring, calibration, and the permutation check, and prints
an illustrative leaderboard row.

## Mapping to ambient capture and personal-AI logs

The harness mirrors, in synthetic form, the pipeline any ambient target-state system
induces:

```
raw capture (audio / video / digital exhaust)
  -> segmented observations
  -> timestamped evidence
  -> target episodes
  -> candidate target states
  -> sealed forecasts
  -> scored outcomes
```

A team can substitute its own **compliant** longitudinal passive-observation data at the
evidence layer without changing the scoring machinery. Real-world submissions must follow
the schema, privacy, consent, and evaluation requirements of the protocol
([submission_format.md](submission_format.md)).

## Reference CLI (specification)

The stepwise reference layout the specification targets (per the paper's harness appendix):

```bash
python generate_synthetic_targets.py --config example_config.yaml   # or validate your own data
python run_walk_forward_eval.py --config example_config.yaml --baselines r0,r1,r2
python scoring.py --predictions runs/system/forecasts.jsonl --truth data/outcomes.jsonl
python permutation_test.py --predictions runs/system/forecasts.jsonl --matching matched
python run_walk_forward_eval.py --config example_config.yaml --ablate evidence_tier
```

The single-file demo implements this flow end-to-end today. The stepwise modules above are
the **intended command structure** for the full submission harness --- a reference CLI
specification only; they are **not shipped as separate modules in Version 1.0**.

## Submission readiness

A team with compliant longitudinal passive-observation data should be able to use this
specification to format a submission, run the reference checks, compare against R1/R2, and
generate a benchmark report. The synthetic harness verifies the mechanics; it does not
itself constitute a benchmark result.

Schemas: [submission_schema.md](submission_schema.md) · Baselines: [baselines.md](baselines.md) · Metrics: [metrics.md](metrics.md)
