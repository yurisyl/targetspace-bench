#!/usr/bin/env python3
"""
TargetSpace -- synthetic scoring-spine demonstration harness.

============================================================================
Synthetic demonstration only. No participant data. No empirical validation.
No claim that TargetSpace works on real people yet.
----------------------------------------------------------------------------
No human-participant data is used. Nothing here is a benchmark result, a
validated metric, or a claim that TargetSpace works on real people. The data
are produced by a known synthetic process. This script exists ONLY to show
that the TargetSpace scoring spine can be computed end-to-end:

  * R1  -- population-prior baseline (leave-one-out; no target identity)
  * R2  -- own-routine baseline (each target's walk-forward running rate)
  * a toy evidence-using model (own routine + a synthetic attention signal)
  * proper scoring (log score in bits, Brier)
  * skill in bits over R1 and over R2
  * a calibration summary
  * an evidence-tier ablation (does the attention signal add lift over R2?)
  * the permutation specificity check (does skill collapse on the wrong target?)

Because the generative process is known, the qualitative directions are
stable; the *magnitudes* are artifacts of the synthetic settings and carry no
external meaning.
============================================================================

Run:        python harness/targetspace_synthetic_demo.py
Runtime:    < 1 s.  Deterministic (fixed seed).  Python 3.8+ standard library only.
"""

from __future__ import annotations

import math
import random
from collections import namedtuple

# --------------------------------------------------------------------------
# Configuration (fixed -> deterministic)
# --------------------------------------------------------------------------
SEED = 12345
N_PERSONS = 20
N_DAYS = 60
EVAL_START = 20          # days [0,EVAL_START): warm-up / signal fitting.
                         # days [EVAL_START,N_DAYS): sealed evaluation window.
PROB_FLOOR = 1e-4        # nonzero probability floor -> no log(0).
LN2 = math.log(2.0)

# Synthetic generative parameters (chosen so the demo's directions are stable).
ROUTINE_DEFER_RANGE = (0.08, 0.30)   # per-person baseline 'defer' rate (the routine)
WEEKDAY_SD = 0.40                    # per-person day-of-week routine wobble (logit units)
N_TRANSITIONS = (1, 3)               # latent transition episodes per person (inclusive)
TRANSITION_LEN = (3, 6)              # episode length, days
TRANSITION_BOOST = 2.2               # logit boost to 'defer' during a transition (routine breaks)
P_ATTN_IN_TRANS = 0.85               # attention-shift signal fires during a transition...
P_ATTN_OUT_TRANS = 0.10              # ...and its off-transition false-positive rate
P_DIGITAL = 0.40                     # 'digital-exhaust' trace: routine-redundant noise

# A forecast instance scores a binary future target state: 1 = 'defer', 0 = 'complete'.
Record = namedtuple("Record", "person day weekday transition outcome attn digital")


# --------------------------------------------------------------------------
# Small numeric helpers
# --------------------------------------------------------------------------
def sigmoid(x: float) -> float:
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    z = math.exp(x)
    return z / (1.0 + z)


def clip(p: float) -> float:
    return min(max(p, PROB_FLOOR), 1.0 - PROB_FLOOR)


def logit(p: float) -> float:
    p = clip(p)
    return math.log(p / (1.0 - p))


def mean(xs):
    xs = list(xs)
    return sum(xs) / len(xs) if xs else float("nan")


# --------------------------------------------------------------------------
# 1. Synthetic longitudinal data
# --------------------------------------------------------------------------
def generate_data(seed: int = SEED):
    """N_PERSONS synthetic targets, N_DAYS each, with person-specific routine,
    occasional latent transition episodes (routine breaks), an attention signal
    correlated with those transitions, and a routine-redundant digital trace."""
    rng = random.Random(seed)
    records = []
    for p in range(N_PERSONS):
        base_logit = logit(rng.uniform(*ROUTINE_DEFER_RANGE))
        weekday = [rng.gauss(0.0, WEEKDAY_SD) for _ in range(7)]

        # latent transition episodes (the deviations a good model must catch)
        in_transition = [False] * N_DAYS
        for _ in range(rng.randint(*N_TRANSITIONS)):
            length = rng.randint(*TRANSITION_LEN)
            start = rng.randint(0, N_DAYS - length)
            for d in range(start, start + length):
                in_transition[d] = True

        for d in range(N_DAYS):
            trans = in_transition[d]
            lo = base_logit + weekday[d % 7] + (TRANSITION_BOOST if trans else 0.0)
            outcome = 1 if rng.random() < sigmoid(lo) else 0
            attn = 1 if rng.random() < (P_ATTN_IN_TRANS if trans else P_ATTN_OUT_TRANS) else 0
            digital = 1 if rng.random() < P_DIGITAL else 0   # routine-redundant noise
            records.append(Record(p, d, d % 7, trans, outcome, attn, digital))
    return records


# --------------------------------------------------------------------------
# 2. Predictors (R1, R2, toy model)
# --------------------------------------------------------------------------
def population_prior(records):
    """R1: leave-one-out population 'defer' rate, fit on the warm-up window only.
    Uses no target identity and no future data."""
    train = [r for r in records if r.day < EVAL_START]
    total = sum(r.outcome for r in train)
    n = len(train)
    pd_, pn_ = {}, {}
    for r in train:
        pd_[r.person] = pd_.get(r.person, 0) + r.outcome
        pn_[r.person] = pn_.get(r.person, 0) + 1
    prior = {}
    for p in range(N_PERSONS):
        d = total - pd_.get(p, 0)
        m = n - pn_.get(p, 0)
        prior[p] = clip((d + 1.0) / (m + 2.0))   # Laplace-smoothed
    return prior


def r2_walk_forward(records):
    """R2: each target's own Laplace-smoothed running 'defer' rate over its
    STRICTLY PAST days (walk-forward; the future never informs the past)."""
    by_person = {}
    for r in records:
        by_person.setdefault(r.person, []).append(r)
    r2 = {}
    for p, recs in by_person.items():
        recs.sort(key=lambda r: r.day)
        run_defers, run_n = 0, 0
        for r in recs:
            r2[(p, r.day)] = clip((run_defers + 1.0) / (run_n + 2.0))   # uses days < r.day
            run_defers += r.outcome
            run_n += 1
    return r2


def fit_signal_shifts(records):
    """Naive-Bayes log-odds shift for each observable signal, fit on the warm-up
    window only (never on the sealed evaluation outcomes)."""
    train = [r for r in records if r.day < EVAL_START]
    base_lo = logit(mean(r.outcome for r in train))

    def cond_shifts(getter):
        hi = [r.outcome for r in train if getter(r) == 1]
        lo = [r.outcome for r in train if getter(r) == 0]
        s_lo = logit(mean(lo)) - base_lo if lo else 0.0
        s_hi = logit(mean(hi)) - base_lo if hi else 0.0
        return (s_lo, s_hi)   # indexable by the 0/1 signal value

    return {"attn": cond_shifts(lambda r: r.attn),
            "digital": cond_shifts(lambda r: r.digital)}


def toy_predict(r, r2_prob, shifts, use_digital=False, use_attn=False):
    """Toy model: start from the own-routine estimate (R2) and add the log-odds
    evidence of each enabled signal (naive-Bayes combination). It scores a
    forecast distribution only; it is not 'the benchmark' and is deliberately
    simple."""
    lo = logit(r2_prob)
    if use_digital:
        lo += shifts["digital"][r.digital]
    if use_attn:
        lo += shifts["attn"][r.attn]
    return clip(sigmoid(lo))


# --------------------------------------------------------------------------
# 3. Scoring
# --------------------------------------------------------------------------
def log_loss_bits(p_defer, y):
    """Proper score (negative log-likelihood) in bits for the realized outcome."""
    p_actual = clip(p_defer) if y == 1 else clip(1.0 - p_defer)
    return -math.log(p_actual) / LN2


def brier(p_defer, y):
    return (p_defer - y) ** 2


def skill_bits(model_probs, ref_probs, ys):
    """Skill = mean log-loss(reference) - mean log-loss(model), in bits.
    Positive => the model is better calibrated/sharper than the reference."""
    ref = mean(log_loss_bits(p, y) for p, y in zip(ref_probs, ys))
    mod = mean(log_loss_bits(p, y) for p, y in zip(model_probs, ys))
    return ref - mod


def calibration_table(probs, ys, nbins=5):
    bins = [[] for _ in range(nbins)]
    for p, y in zip(probs, ys):
        bins[min(int(p * nbins), nbins - 1)].append((p, y))
    rows, ece, N = [], 0.0, len(ys)
    for b in range(nbins):
        label = "[{:.1f},{:.1f})".format(b / nbins, (b + 1) / nbins)
        if not bins[b]:
            rows.append((label, 0, float("nan"), float("nan")))
            continue
        mp = mean(p for p, _ in bins[b])
        oy = mean(y for _, y in bins[b])
        rows.append((label, len(bins[b]), mp, oy))
        ece += (len(bins[b]) / N) * abs(mp - oy)
    return rows, ece


# --------------------------------------------------------------------------
# 4. Permutation specificity
# --------------------------------------------------------------------------
def permutation_test(eval_recs, toy_l2, r1, outcome_map):
    """Score each target's toy forecast against a DIFFERENT target's outcome on
    the same day (a fixed derangement). Target-specific skill should collapse:
    the attention signal carries information about *this* target, not another."""
    true_terms, perm_terms = [], []
    for r in eval_recs:
        i, d, y_i = r.person, r.day, r.outcome
        j = (i + 1) % N_PERSONS                      # matched wrong target, same day
        y_j = outcome_map[(j, d)]
        p_i = toy_l2[(i, d)]
        true_terms.append(log_loss_bits(r1[i], y_i) - log_loss_bits(p_i, y_i))
        perm_terms.append(log_loss_bits(r1[j], y_j) - log_loss_bits(p_i, y_j))
    return mean(true_terms), mean(perm_terms)


# --------------------------------------------------------------------------
# 5. Report
# --------------------------------------------------------------------------
DISCLAIMER = (
    "Synthetic demonstration only. No participant data. No empirical "
    "validation. No claim that TargetSpace works on real people yet."
)


def main():
    records = generate_data(SEED)
    eval_recs = [r for r in records if r.day >= EVAL_START]
    outcome_map = {(r.person, r.day): r.outcome for r in records}

    r1 = population_prior(records)
    r2 = r2_walk_forward(records)
    shifts = fit_signal_shifts(records)

    # Build forecast distributions for every sealed evaluation instance.
    ys = [r.outcome for r in eval_recs]
    p_r1 = [r1[r.person] for r in eval_recs]
    p_r2 = [r2[(r.person, r.day)] for r in eval_recs]
    p_l1 = [toy_predict(r, r2[(r.person, r.day)], shifts, use_digital=True, use_attn=False)
            for r in eval_recs]
    p_l2 = [toy_predict(r, r2[(r.person, r.day)], shifts, use_digital=True, use_attn=True)
            for r in eval_recs]
    toy_l2_by_inst = {(r.person, r.day): p for r, p in zip(eval_recs, p_l2)}

    predictors = [
        ("R1  population prior", p_r1),
        ("R2  own routine     ", p_r2),
        ("L1  R2 + digital    ", p_l1),
        ("L2  R2 + attention  ", p_l2),
    ]

    out = []
    w = out.append
    w("=" * 74)
    w("TargetSpace synthetic scoring-spine demonstration")
    w(DISCLAIMER)
    w("=" * 74)
    w("seed={}  targets={}  days/target={}  eval window=days[{}..{})"
      .format(SEED, N_PERSONS, N_DAYS, EVAL_START, N_DAYS))
    w("sealed forecast instances scored: {}".format(len(eval_recs)))
    transition_share = mean(1 if r.transition else 0 for r in eval_recs)
    w("eval instances inside a latent transition (routine break): {:.1%}".format(transition_share))
    w("")

    # ---- proper scores -------------------------------------------------
    w("Proper scores over the sealed evaluation set")
    w("-" * 74)
    w("{:<22} {:>12} {:>9} {:>14} {:>14}"
      .format("predictor", "logloss(bit)", "Brier", "skill/R1(bit)", "skill/R2(bit)"))
    for name, probs in predictors:
        ll = mean(log_loss_bits(p, y) for p, y in zip(probs, ys))
        br = mean(brier(p, y) for p, y in zip(probs, ys))
        s1 = skill_bits(probs, p_r1, ys)
        s2 = skill_bits(probs, p_r2, ys)
        w("{:<22} {:>12.4f} {:>9.4f} {:>14.4f} {:>14.4f}".format(name, ll, br, s1, s2))
    w("(skill = mean logloss[reference] - mean logloss[model]; positive => better)")
    w("")

    # ---- evidence-tier ablation ---------------------------------------
    w("Evidence-tier ablation (lift over the own-routine baseline R2)")
    w("-" * 74)
    lift_l1 = skill_bits(p_l1, p_r2, ys)
    lift_l2 = skill_bits(p_l2, p_r2, ys)
    w("  L1  routine + digital-exhaust trace : {:+.4f} bits/forecast over R2".format(lift_l1))
    w("  L2  routine + attention signal      : {:+.4f} bits/forecast over R2".format(lift_l2))
    w("  => the routine-redundant digital trace adds ~no lift; the attention")
    w("     signal (which tracks routine breaks) adds the lift. Synthetic by design.")
    w("")

    # ---- calibration ---------------------------------------------------
    w("Calibration summary -- Toy L2 (R2 + attention)")
    w("-" * 74)
    rows, ece = calibration_table(p_l2, ys, nbins=5)
    w("  {:<12} {:>6} {:>12} {:>12}".format("pred bin", "n", "mean pred", "obs rate"))
    for label, n, mp, oy in rows:
        if n == 0:
            w("  {:<12} {:>6} {:>12} {:>12}".format(label, 0, "-", "-"))
        else:
            w("  {:<12} {:>6} {:>12.3f} {:>12.3f}".format(label, n, mp, oy))
    w("  expected calibration error (ECE, top-label): {:.4f}".format(ece))
    w("")

    # ---- permutation specificity --------------------------------------
    w("Permutation specificity (toy L2 skill over R1: true vs wrong-target)")
    w("-" * 74)
    skill_true, skill_perm = permutation_test(eval_recs, toy_l2_by_inst, r1, outcome_map)
    w("  true target-specific skill   : {:+.4f} bits/forecast".format(skill_true))
    w("  permuted (wrong-target) skill: {:+.4f} bits/forecast".format(skill_perm))
    surviving = 100.0 * max(0.0, skill_perm) / skill_true if skill_true > 0 else float("nan")
    w("  target-specific skill surviving permutation: {:.1f}%".format(surviving))
    w("  => the skill was specific to THIS target; matched to another target it"
      " vanishes (here it even goes negative: confident attention-driven forecasts"
      " are wrong for the other person).")
    w("")
    w("=" * 74)
    w(DISCLAIMER)
    w("=" * 74)

    report = "\n".join(out)
    print(report)

    # ---- smoke test / internal assertions (the demo's directions must hold) ----
    all_probs = p_r1 + p_r2 + p_l1 + p_l2
    assert all(math.isfinite(p) and 0.0 < p < 1.0 for p in all_probs), "non-finite probability"
    assert all(math.isfinite(log_loss_bits(p, y)) for p, y in zip(p_l2, ys)), "non-finite score"
    assert lift_l2 > 0.0, "attention signal should add lift over R2"
    assert lift_l2 > lift_l1, "attention should add more lift than the routine-redundant trace"
    assert skill_true > 0.0, "toy model should beat the population prior on the correct target"
    assert skill_perm < 0.5 * skill_true, "skill should materially collapse under permutation"
    print("\n[smoke test] PASSED: scores finite; attention adds lift; permutation collapses.")
    return report


if __name__ == "__main__":
    main()
