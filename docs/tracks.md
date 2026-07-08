# Tracks and evaluation splits

**TargetSpace is a multi-track apparatus.** Every track shares the same scoring spine
(sealed forecasts, R1/R2, calibration, permutation specificity, evidence ablation,
deterministic outcome validation) and differs in target, evidence, horizon, and readiness.

## Domain tracks

Readiness is stated honestly: only the flagship track is currently instantiated (as a
synthetic pre-pilot). No empirical validation exists for the other tracks yet.

| Track | Readiness | Target object | Example evidence | Horizon | Example target states | Validator / outcome |
|---|---|---|---|---|---|---|
| **TS-Personal** (flagship) | **current** / synthetic pre-pilot | a consenting individual | metadata, text, audio, passive multimodal, location, physiology | hours–weeks | commitment status, priority shift, routine deviation, task switch | observed action / confirmation |
| **TS-Health** | planned | a patient | vitals, labs, CGM, wearables, notes | minutes–days | glycemic excursion, deterioration onset, care-state transition | clinical onset labels / sensor thresholds |
| **TS-Energy** | planned | a series / asset | history, weather, calendar, exogenous covariates | hours–days | load / renewable level band, price regime | realized value / market settlement |
| **TS-Robotics** | research | embodied agent + scene | proprioception, sensor stream, action log | sub-second–minutes | goal-conditioned configuration, subgoal transition | achieved configuration |
| **TS-Enterprise** | research | a project / team / workflow | trackers, commits, comms metadata, releases | days–quarters | milestone state, scope / priority drift | observed milestone / outcome |

## Evaluation splits

Task regimes — SWE-bench-style splits — currently instantiated within the flagship
**TS-Personal** track. Each split has its own input/output, metrics, baselines, example, and
submission requirements.

| Split | Status | What it tests |
|---|---|---|
| **TS-Short** | pilot | short-window target prediction from a limited recent window |
| **TS-Long** | pilot | longitudinal prediction: does extended, correctly-ordered history help? |
| **TS-Shift** | pilot | goal/behaviour transition detection (emergence, displacement, abandonment, resumption) |
| **TS-Counterfactual** | planned | action-conditioned "what-if" target forecasting, `P(z | E≤t, U)` |
| **TS-Multimodal** | planned | multimodal evidence integration, measured by the evidence-tier ablation |
| **TS-Private** | private | hidden test set / organizer-run private evaluation |

## Adding a track

A track is admitted only when it requires a **distinct** validator, evidence band, and
horizon profile **and** admits a strong own-routine baseline (R2) — otherwise it is a regime
within an existing track, or not yet a track. Propose one via an issue.
