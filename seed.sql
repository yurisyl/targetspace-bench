-- TargetSpace-Bench portal -- seed data.
-- Apply locally:  npm run db:seed:local   (run db:schema:local first)
-- All leaderboard rows are illustrative MOCK baselines (is_mock=1). No real
-- results are claimed. Edit/extend freely from the Admin dashboard.

DELETE FROM admins;
DELETE FROM benchmark_versions;
DELETE FROM tracks;
DELETE FROM splits;
DELETE FROM leaderboard_entries;
DELETE FROM submissions;
DELETE FROM faq_items;
DELETE FROM doc_sections;
DELETE FROM announcements;

-- ---------- admins (auth is via env secrets; this is for listing/audit) ----------
INSERT INTO admins (username, role) VALUES ('admin', 'owner');

-- ---------- benchmark versions ----------
INSERT INTO benchmark_versions (tag, name, status, is_current, released_at, notes, sort_order) VALUES
 ('v1.0', 'Benchmark protocol v1.0', 'pilot', 1, '2026-06-01', 'Synthetic pre-pilot harness for the TS-Personal track. Spine frozen: sealed walk-forward forecasts, R1/R2 baselines, calibration gate, permutation specificity, evidence-tier ablation. No human-subject data; no official results.', 1),
 ('v0.2-planned', 'Pilot protocol v0.2 (planned)', 'planned', 0, NULL, 'Planned: first consented federated TS-Personal pilot and a frozen private split. Not yet released.', 2);

-- ---------- domain tracks (paper Section 9 / Table 8) ----------
INSERT INTO tracks (slug, code, name, flagship, readiness, tagline, target_object, evidence_bands, horizon, example_states, validator, description, sort_order) VALUES
 ('ts-personal','TS-Personal','Personal Intelligence',1,'current',
  'Flagship track: forecasting a consenting individual''s goal-state transitions.',
  'a consenting individual',
  'metadata, text, audio, passive multimodal, location, physiology',
  'hours-weeks',
  'commitment status, priority shift, routine deviation, task switch',
  'observed action / confirmation',
  'The flagship and most developed track. Currently a synthetic, pre-pilot apparatus: it forecasts whether and how an individual''s commitments, priorities, and routines shift over time, scored only against sealed, externally observable outcomes. No human-subject pilot has run yet.',
  1),
 ('ts-health','TS-Health','Health & Physiology',0,'planned',
  'Forecasting care-state transitions and physiological excursions for a patient.',
  'a patient',
  'vitals, labs, continuous glucose monitoring, wearables, notes',
  'minutes-days',
  'glycemic excursion, deterioration onset, care-state transition',
  'clinical onset labels / sensor thresholds',
  'Planned track with strong sealed precedent and a natural own-routine baseline (physiological history). Not implemented; no empirical results exist. Requires clinical governance before any deployment.',
  2),
 ('ts-energy','TS-Energy','Energy & Grid',0,'planned',
  'Forecasting load, renewable level, and price-regime transitions for an asset or series.',
  'a series / asset',
  'history, weather, calendar, exogenous covariates',
  'hours-days',
  'load / renewable level band, price regime',
  'realized value / market settlement',
  'Planned track. Energy and markets are one track with two regimes. Strong sealed precedent (e.g. probabilistic load forecasting) and a clear own-routine baseline. Not implemented.',
  3),
 ('ts-robotics','TS-Robotics','Embodied / Robotics',0,'research',
  'Forecasting goal-conditioned configurations and subgoal transitions for an embodied agent.',
  'embodied agent + scene',
  'proprioception, sensor stream, action log',
  'sub-second-minutes',
  'goal-conditioned configuration, subgoal transition',
  'achieved configuration',
  'Research-stage track. A distinct regime exists, but a proper-scored, sealed forecasting protocol with a strong own-routine baseline is not yet established. TargetSpace does not claim to solve robotics.',
  4),
 ('ts-enterprise','TS-Enterprise','Enterprise / Projects',0,'research',
  'Forecasting milestone state and scope/priority drift for a project, team, or workflow.',
  'a project / team / workflow',
  'trackers, commits, comms metadata, releases',
  'days-quarters',
  'milestone state, scope / priority drift',
  'observed milestone / outcome',
  'Research-stage track. Promising regime for target-state forecasting on an evolving organizational entity, but no proper-scored protocol or strong baseline is established yet.',
  5);

-- ---------- evaluation splits (task regimes; currently within TS-Personal) ----------
INSERT INTO splits (code, name, track_slug, status, description, input_format, output_format, metrics, baselines, example_task, requirements, sort_order) VALUES
 ('TS-Short','Short-window target prediction','ts-personal','pilot',
  'Near-term forecasting from a limited recent window: can the model anticipate the next concrete target state from short context?',
  'Sealed instance (i, E<=t, q, A, r) with a recent evidence window (hours-days) up to time t.',
  'A calibrated probability distribution over the discrete answer space A.',
  'overall_score, target_adaptation_gain, calibration_error',
  'zero-history (R1), short-history, own-routine (R2)',
  'Given Monday 09:00 evidence, assign P(completes this Wednesday''s review) over A = {completes, defers}.',
  'A sealed forecast file (timestamped, hashed) plus a metadata record (model, adapter, cutoff).',
  1),
 ('TS-Long','Longitudinal target prediction','ts-personal','pilot',
  'The core regime: does extended, correctly ordered target history improve calibrated forecasts of longer-horizon transitions?',
  'Sealed instance with extended longitudinal target history (days-weeks).',
  'A calibrated distribution over A at one or more horizons.',
  'overall_score, target_adaptation_gain, long_horizon_degradation, calibration_error',
  'longitudinal-history, own-routine (R2), retrieval-only',
  'From three weeks of evidence, forecast whether a recurring commitment is abandoned, resumed, or displaced by month-end.',
  'Sealed forecast file plus the history-length condition used (short vs longitudinal).',
  2),
 ('TS-Shift','Goal / behaviour transition detection','ts-personal','pilot',
  'Detect the moments target orientation changes: emergence, stabilization, competition, displacement, abandonment, resumption, opportunity-induced creation.',
  'Sealed instance with a query about a transition type and its resolution rule.',
  'A calibrated distribution over transition classes, time-stamped.',
  'overall_score, temporal_order_sensitivity, calibration_error',
  'own-routine (R2), shuffled-history control, wrong-target control',
  'Forecast whether an emerging concern displaces the current priority before an explicit commitment is made.',
  'Sealed forecast plus the temporal-order condition (ordered vs shuffled).',
  3),
 ('TS-Counterfactual','What-if target forecasting','ts-personal','planned',
  'Action-conditioned forecasting: predict the target-state distribution under a hypothetical action, event, or intervention context U.',
  'Sealed instance extended to (i, E<=t, q, A, U, r) with a candidate context U.',
  'A calibrated distribution P(z_{t+h} | E<=t, U) over A.',
  'counterfactual_consistency, calibration_error',
  'own-routine (R2), observational counterfactual control',
  'Forecast how a deadline change would shift the probability of a routine deviation, scored on later realized cases.',
  'Sealed forecast plus the conditioning context U; observational counterfactuals are not causal estimates.',
  4),
 ('TS-Multimodal','Multimodal evidence integration','ts-personal','planned',
  'Measure whether integrating multiple passive modalities improves target-specific forecasts beyond any single stream.',
  'Sealed instance across evidence tiers (metadata, text, audio, passive multimodal, location).',
  'A calibrated distribution over A per evidence tier.',
  'modality_contribution, target_adaptation_gain, calibration_error',
  'ablated-modality controls, own-routine (R2)',
  'Report skill over R2 as each modality is added or removed (the evidence-tier ablation).',
  'Sealed forecasts under each modality-ablation condition.',
  5),
 ('TS-Private','Hidden test set / private evaluation','ts-personal','private',
  'Contamination-resistant private evaluation: the organizer runs a frozen, hidden split and reports verified metrics.',
  'Organizer-held sealed instances; entrants submit a runnable system, not forecasts.',
  'Organizer-produced calibrated distributions, verified end to end.',
  'overall_score, wrong_target_penalty, calibration_error',
  'own-routine (R2), permutation specificity gate',
  'A submitted system is run by the organizer on instances it has never seen; skill must survive the permutation gate.',
  'A reproducible system (container/code) and a signed reproducibility + no-leakage attestation.',
  6);

-- ---------- leaderboard: illustrative MOCK baselines (is_mock=1) ----------
INSERT INTO leaderboard_entries
 (system_name, organization, track_slug, split_code, version_tag, submission_type, is_mock, is_baseline,
  overall_score, target_adaptation_gain, temporal_order_sensitivity, wrong_target_penalty, calibration_error,
  evidence_attribution, counterfactual_consistency, long_horizon_degradation, modality_contribution,
  paper_url, code_url, report_url, submitted_at, notes, sort_order)
VALUES
 ('Human self-report','Human baseline (anchor)','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.82,2.60,0.71,0.90,0.06,0.80,0.74,0.28,0.66,
  NULL,NULL,NULL,'2026-06-02','Anchor, not ranked: the target (or an expert) predicting itself. Illustrative.',1),
 ('TargetSpace reference','TargetSpace','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.61,1.40,0.55,0.82,0.09,0.62,0.58,0.41,0.52,
  '/paper','https://github.com/yurisyl/targetspace-bench',NULL,'2026-06-02','Reference pipeline on the synthetic harness. Illustrative.',2),
 ('Agent + memory','Reference baseline','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.49,0.90,0.40,0.60,0.13,0.45,0.43,0.50,0.40,
  NULL,NULL,NULL,'2026-06-02','Tool-using agent with target-specific memory. Illustrative.',3),
 ('Long-context LLM','Reference baseline','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.38,0.40,0.18,0.30,0.17,0.30,0.31,0.62,0.25,
  NULL,NULL,NULL,'2026-06-02','Holds more history in context; little gain over routine. Illustrative.',4),
 ('Generic LLM','Reference baseline','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.34,0.25,0.12,0.22,0.19,0.26,0.28,0.66,0.20,
  NULL,NULL,NULL,'2026-06-02','Prompted LLM, no target-specific adaptation. Illustrative.',5),
 ('Retrieval-only','Reference baseline','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.30,0.10,0.05,0.12,0.22,0.35,0.20,0.70,0.18,
  NULL,NULL,NULL,'2026-06-02','Surfaces what happened; does not model why. Illustrative.',6),
 ('Random','Control baseline','ts-personal','TS-Long','v1.0','baseline',1,1,
  0.00,0.00,0.00,0.00,0.50,0.00,0.00,1.00,0.00,
  NULL,NULL,NULL,'2026-06-02','Population-uniform control. Illustrative lower bound.',7);

-- ---------- FAQ ----------
INSERT INTO faq_items (question, answer, category, sort_order) VALUES
 ('Is TargetSpace a world-model benchmark or a forecasting benchmark?',
  'Both, at different layers. TargetSpace evaluates whether a system can maintain and use a target-specific predictive representation, measured through calibrated, sealed forecasting under partial observation. Understanding is the capability; forecasting is the measurement -- a high score certifies calibrated prospective predictive skill only, not understanding itself.','positioning',1),
 ('Does it replace robotics, video, or physics benchmarks?',
  'No. TargetSpace is complementary. Physical-reasoning, video-generation, embodied-control, and forecasting benchmarks evaluate generic dynamics, realism, control, and event prediction. TargetSpace evaluates target-specific adaptation over time. A strong TargetSpace score implies nothing about those other capabilities.','positioning',2),
 ('What counts as a target?',
  'A persistent, evolving entity tracked over time: a person, agent, system, organization, environment, or process. The flagship track targets a consenting individual; other tracks target patients, energy assets, embodied agents, and projects.','scope',3),
 ('Does it require private human data?',
  'Not to participate today. The current pilot is fully synthetic and uses no human data. When human tracks run, the design is federated and consent-first: raw capture stays on the participant device; only sealed forecasts and aggregate metrics leave it.','privacy',4),
 ('How is leakage prevented?',
  'Forecasts are timestamped and sealed (SHA-256) before outcomes exist, and evaluation is strictly walk-forward: only evidence with a timestamp at or before the forecast time t may be used. Random cross-validation is prohibited.','protocol',5),
 ('How are submissions verified?',
  'Three tiers. Public: self-reported on the open/synthetic split. Verified: the organizer reproduces the result from submitted code. Private eval: the organizer runs the system on a hidden, frozen split and reports the metrics end to end.','submissions',6),
 ('Can synthetic data be used?',
  'Yes. The pilot harness is synthetic and deterministic, intended for development and method validation. Synthetic results are clearly labeled and support no empirical claims about real targets.','submissions',7),
 ('How are probabilistic forecasts scored?',
  'With strictly proper scoring: log score in bits (primary) and Brier (secondary). The headline quantity is Skill -- bits over a reference baseline -- reported against R1 (population prior) and R2 (the target''s own routine), gated by calibration and the permutation specificity test.','metrics',8),
 ('What does a high score mean?',
  'Calibrated, prospective, target-specific predictive skill: the model beats the crowd and the routine, stays calibrated, and depends on the correct target. It is not understanding in a rich sense, not evidence of architecture superiority, and grants no access to a person''s inner life.','metrics',9),
 ('How do I participate before the dataset is public?',
  'Run the synthetic harness, submit results on it, request a private evaluation of your system, or propose a new track. See the Submit and Docs pages.','participation',10);

-- ---------- docs ----------
INSERT INTO doc_sections (slug, title, category, body, sort_order) VALUES
 ('quickstart','Quickstart','guide',
'## Quickstart

TargetSpace-Bench is an evaluation protocol, not just a dataset. To try it today:

1. Clone the synthetic harness (ancillary to the paper).
2. Generate deterministic synthetic targets.
3. Run a baseline (R1/R2) and your system under walk-forward sealing.
4. Score with proper scoring and the permutation gate.

```bash
python targetspace_synthetic_demo.py
# emits an illustrative leaderboard row: Skill over R1 and R2, in bits
```

The harness uses no human data and supports no empirical claims.',1),
 ('protocol','Evaluation protocol','guide',
'## Evaluation protocol

Every track shares one scoring spine:

- **Sealed forecasts** -- timestamped and hashed (SHA-256) before outcomes exist.
- **Walk-forward** -- only evidence with timestamp <= t is visible; no random CV.
- **R1** -- population-prior baseline (the entry condition).
- **R2** -- the target''s own recency-weighted routine (the target-specific condition).
- **Calibration gate** -- confidence must track uncertainty.
- **Permutation specificity gate** -- skill must collapse on the wrong target.
- **Evidence-tier ablation** -- report skill over R2 as a function of evidence.

A forecast is a tuple (i, E<=t, q, A, r): instance, evidence up to t, query, answer space, resolution time.',2),
 ('data-format','Data format','reference',
'## Data format

A sealed forecast record is line-delimited JSON:

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

Outcomes are resolved by deterministic rules and never edited after sealing.',3),
 ('metrics','Metrics','reference',
'## Metrics

- **Overall score** -- an illustrative pilot roll-up for display; the canonical signal is skill over R2.
- **Target adaptation gain** -- Skill in bits over the own-routine baseline R2.
- **Temporal-order sensitivity** -- skill lost when the target''s history is shuffled.
- **Wrong-target penalty** -- skill lost under the permutation gate (higher is better).
- **Calibration error** -- top-label ECE (lower is better).
- **Evidence attribution** -- whether cited evidence supports the forecast.
- **Counterfactual consistency** -- coherence of action-conditioned forecasts.
- **Long-horizon degradation** -- skill decay at long horizon (lower is better).
- **Modality contribution** -- marginal skill from each evidence stream.

Scoring is strictly proper: log score (bits) primary, Brier secondary. No composite is used for adjudication.',4),
 ('baselines','Baselines & controls','reference',
'## Baselines and controls

The central signal is not whether a model predicts the future, but whether prediction improves when it is given the correct target''s history in the correct temporal order.

- Zero-history (R1), short-history, longitudinal-history.
- Shuffled-history control (temporal order), wrong-target control (permutation gate).
- Ablated-modality controls, retrieval-only, human baseline, oracle/context upper bound.

See the Baselines page for the full battery and ablation logic.',5),
 ('submission-format','Submission format','reference',
'## Submission format

A submission bundles:

- A results file (sealed forecasts) or, for private eval, a runnable system.
- Metadata: model/system, adapter, training cutoff, track, split, version.
- Attestations: no future leakage; reproducibility agreement.

Submit via the Submit page. Entries land as `pending_review` and are triaged by the organizer.',6),
 ('reproducibility','Reproducibility','guide',
'## Reproducibility

- Pin the benchmark version and the R2 recipe (Appendix R2 of the paper).
- Disclose retrieval/memory/tool access and the output adapter; the adapter is part of the system under test.
- Verified and private-eval tiers require organizer-side reproduction.
- Because evaluation is federated and prospective, results are holder-reproducible; we mitigate with a versioned protocol and a shared harness.',7),
 ('privacy-governance','Privacy & governance','guide',
'## Privacy and governance

The safeguards are design commitments; no human pilot has run.

- Informed, revocable consent; federation so raw data never leaves the target''s control.
- Aggregate-only reporting; institutional review before any human-subjects deployment.
- A prohibition on evaluating systems that act on the target during the window.
- Benchmark validity is kept strictly separate from deployment legitimacy.',8),
 ('api-reference','API reference','reference',
'## API reference (placeholder)

Read-only public endpoints:

```
GET /api/tracks          GET /api/splits        GET /api/leaderboard
GET /api/faq             GET /api/docs          GET /api/announcements
GET /api/versions        POST /api/submissions
```

A stable, documented public API will ship with the first official benchmark version.',9);

-- ---------- announcements ----------
INSERT INTO announcements (title, body, level, pinned, published) VALUES
 ('TargetSpace v1.0 online -- synthetic illustrative data only','The TargetSpace-Bench portal is live on benchmark protocol v1.0. All leaderboard rows are illustrative mock baselines; no official submissions or empirical results exist yet.','release',1,1),
 ('Call for pilot submissions on the synthetic harness','You can run the synthetic harness today and submit results, or request a private evaluation of your system. See the Submit and Docs pages.','info',0,1);
