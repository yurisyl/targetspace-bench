-- FAQ-only reseed: safe for production (touches ONLY faq_items)
DELETE FROM faq_items;
INSERT INTO faq_items (question, answer, category, sort_order) VALUES
 ('Is TargetSpace a world-model benchmark or a forecasting benchmark?',
  'A forecasting benchmark. TargetSpace measures gated, target-specific prospective skill through calibrated, sealed forecasting under partial observation. A personal world model is one architectural hypothesis for passing it -- the benchmark requires no world model, memory graph, or simulator, only sealed probabilistic forecasts under the protocol.','positioning',1),
 ('Does it replace robotics, video, or physics benchmarks?',
  'No. TargetSpace is complementary. Physical-reasoning, video-generation, embodied-control, and forecasting benchmarks evaluate generic dynamics, realism, control, and event prediction. TargetSpace evaluates target-specific adaptation over time. A strong TargetSpace score implies nothing about those other capabilities.','positioning',2),
 ('What counts as a target?',
  'A persistent, evolving entity tracked over time: a person, agent, system, organization, environment, or process. The flagship track targets a consenting individual; other tracks target patients, energy assets, embodied agents, and projects.','scope',3),
 ('Does it require private human data?',
  'Not to participate today. The current release is pre-pilot: the harness is fully synthetic and uses no human data. When human tracks run, the design is federated and consent-first: raw capture stays on the participant device; only sealed forecasts and aggregate metrics leave it.','privacy',4),
 ('How is leakage prevented?',
  'Forecasts are timestamped and sealed (SHA-256) before outcomes exist, and evaluation is strictly walk-forward: only evidence with a timestamp at or before the forecast time t may be used. Random cross-validation is prohibited.','protocol',5),
 ('How are submissions verified?',
  'Three tiers. Public: self-reported on the open/synthetic split. Verified: the organizer reproduces the result from submitted code. Private eval: the organizer runs the system on a hidden, frozen split and reports the metrics end to end.','submissions',6),
 ('Can synthetic data be used?',
  'Yes. The reference harness is synthetic and deterministic, intended for development and method validation. Synthetic results are clearly labeled and support no empirical claims about real targets.','submissions',7),
 ('How are probabilistic forecasts scored?',
  'With strictly proper scoring: log score in bits (primary) and Brier (secondary). The headline quantity is Skill -- bits over a reference baseline -- reported against R1 (population prior) and R2 (the target''s own routine), gated by calibration and the permutation specificity test.','metrics',8),
 ('What does a high score mean?',
  'Calibrated, prospective, target-specific predictive skill: the model beats the crowd and the routine, stays calibrated, and depends on the correct target. It is not understanding in a rich sense, not evidence of architecture superiority, and grants no access to a person''s inner life.','metrics',9),
 ('How do I participate before the dataset is public?',
  'Run the synthetic harness, submit results on it, request a private evaluation of your system, or propose a new track. See the Submit and Docs pages.','participation',10);
