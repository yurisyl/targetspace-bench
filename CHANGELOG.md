# Changelog

All notable changes to the TargetSpace-Bench open benchmark repository.
This project is a pre-pilot proposal; versions track the benchmark protocol, not results.

## [Unreleased]

## [v1.0] - 2026-07
### Added
- Public v1.0 website source (protocol, run-harness, schemas, product-quickstart,
  governance pages), top-level `schemas/` (six JSON submission schemas), and worked `examples/`.
- Apparatus-first framing; hard target-state inclusion rule; failure-mode read-out; product-readiness guide.
### Changed
- Final Version 1.0 paper PDF. Bounded operational language throughout; "no empirical results" made unmissable.


### Changed
- **Repository split.** This repository is now the **open benchmark** only (specification,
  docs, synthetic demo, baseline examples, public leaderboard export). The operational
  website source, admin console, Cloudflare Pages Functions, and D1 schema were moved to a
  **private** operational repository.
### Added
- `LICENSE` (MIT), `CITATION.cff`, `CONTRIBUTING.md`, `SECURITY.md`.
- `docs/`: benchmark specification, evaluation protocol, submission format, public
  leaderboard format, tracks.
- `examples/`: synthetic demonstration harness + sample submission and baseline outputs.
- `leaderboard/`: static export of the public leaderboard (JSON + CSV; illustrative mock).
### Removed (from the public repo)
- `admin/`, backend `functions/`, auth/session code, `schema.sql`/`seed.sql`,
  `wrangler.toml`, website HTML/CSS/JS, deployment scripts, and env examples — all moved to
  the private operational repository.

## [v0.1-pilot] - 2026-06
### Added
- Pilot protocol v0.1: sealed walk-forward forecasts; R1 population prior and R2 own-routine
  baselines; calibration gate; permutation specificity gate; evidence-tier ablation.
- Flagship **TS-Personal** track (synthetic pre-pilot); planned/research tracks
  (TS-Health, TS-Energy, TS-Robotics, TS-Enterprise); evaluation splits (TS-Short, TS-Long,
  TS-Shift, TS-Counterfactual, TS-Multimodal, TS-Private).
- Synthetic demonstration harness. No human data; no empirical results claimed.
