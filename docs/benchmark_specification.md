# Benchmark specification

TargetSpace evaluates **target-specific forecasting under partial observation**: whether a model
can build and update a predictive model of a *specific* target from passive, multimodal,
non-IID observation, and forecast the target's future state.

This is a pre-pilot specification. No empirical results are claimed.

## Objects

- **Target-system instance** — a specific, partially observed adaptive system tracked over
  time (a person, agent, system, organization, environment, or process).
- **Target state** — a latent configuration the target acts to reach or maintain (a
  commitment, priority, constraint, or regime), evaluated only through externally observable
  consequences.
- **Transition** — a change between target states (emergence, stabilization, competition,
  displacement, abandonment, resumption, opportunity-induced creation). Transitions are the
  object to forecast.

## The forecast unit

A benchmark instance is the tuple **(i, E≤t, q, A, r)**:

| Symbol | Meaning |
|---|---|
| `i` | the target-system instance |
| `E≤t` | evidence available up to forecast time `t` |
| `q` | a query about a future target state |
| `A` | a discrete answer space |
| `r` | resolution time (`r > t`) with a deterministic resolution rule |

The system outputs a **probability distribution over `A`**. The unit of analysis is the
**resolved forecast**; because forecasts nest within an instance and are serially dependent,
statistical inference is performed at the **instance** level.

## Assumptions

- **A1** — the future is partially predictable (bounded above).
- **A2** — latent target states are evaluated only through observable consequences.
- **A3** — the instance changes over time, so the benchmark rewards adaptation.

## What is scored (and what is not)

Scored: **predicted future states and their transitions**, as calibrated distributions over
`A`, against sealed outcomes.

Not scored: stated goals, next-action mimicry, internal representations, or a system's own
rollout self-consistency. Latent goals, constraints, and attention are treated as
*evidence-bearing structure*, credited only when mapped to a pre-registered, externally
resolvable target.

## Evidence ladder (person domain)

Cumulative tiers, ordered from already-interpreted residue toward pre-interpretive
observation. Whether a richer tier helps is an empirical question answered by the ablation.

| Tier | Evidence | Sensitivity |
|---|---|---|
| L0 | calendar + comms metadata, routine, digital exhaust | social graph / rhythms |
| L1 | text traces (chat, notes, documents) | high |
| L2 | audio / transcripts | very high |
| L3 | passive multimodal (egocentric/scene video, ambient audio, screen) | extreme |
| L4 | location / mobility traces | extreme |
| L5 | physiological / specialized sensors | extreme |

## Positioning

TargetSpace is **complementary**, not a replacement, for physical-reasoning /
intuitive-physics, video-generation, embodied-robotics, and symbolic-forecasting benchmarks.
Those evaluate generic dynamics, realism, control, and event prediction; TargetSpace
evaluates **target-specific dynamics** — whether prediction improves given the correct
target's history in the correct temporal order. See the paper for the full comparison.
