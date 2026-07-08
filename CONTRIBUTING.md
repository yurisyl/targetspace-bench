# Contributing to TargetSpace-Bench

Thanks for your interest. TargetSpace is a pre-pilot benchmark; contributions that improve
its clarity, rigor, and reproducibility are welcome.

## What this repo accepts
This is the **open benchmark** repo. Good contributions here:
- Corrections/improvements to the specification and docs (`docs/`).
- Improvements to the synthetic demonstration harness (`examples/`).
- Additional baseline examples and reference implementations.
- Clarifications to the submission format or leaderboard export format.

The operational website and admin console live in a separate **private** repository; please
do not send site/backend/admin code here.

## Ways to contribute
1. **Open an issue** for questions, spec ambiguities, or proposals (e.g. a new track).
2. **Submit a benchmark run** through the live site's `/submit` flow — not via pull request.
   See [`docs/submission_format.md`](docs/submission_format.md). Submissions are reviewed
   before appearing on the leaderboard.
3. **Open a pull request** for docs/harness/examples changes.

## Pull request guidelines
- Keep changes focused and described clearly.
- For harness changes, ensure `python examples/targetspace_synthetic_demo.py` still runs and
  uses no external data.
- Do not add real datasets, personal data, or secrets. The harness is synthetic by design.
- Match the existing tone: sober, precise, no overclaiming. This is a pre-pilot proposal
  with **no empirical results**; do not present mock/illustrative numbers as real.

## Evaluation integrity
The benchmark's value rests on sealed, walk-forward, leakage-free evaluation. Any
contribution that would weaken this (e.g. enabling outcome peeking or random cross-validation)
will not be accepted. See [`docs/evaluation_protocol.md`](docs/evaluation_protocol.md).

## Conduct
Be constructive and respectful. Assume good faith.

Questions: `yurisyl@gmail.com`.
