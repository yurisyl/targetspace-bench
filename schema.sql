-- TargetSpace-Bench portal -- D1 (SQLite) schema.
-- Apply locally:  npm run db:schema:local
-- Apply remote:   npm run db:schema:remote
-- Safe to re-run: drops then recreates every table.

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS benchmark_versions;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS splits;
DROP TABLE IF EXISTS leaderboard_entries;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS faq_items;
DROP TABLE IF EXISTS doc_sections;
DROP TABLE IF EXISTS announcements;

-- Admin accounts. Passwords are NOT stored here; authentication is performed
-- against the ADMIN_USERNAME / ADMIN_PASSWORD environment secrets. This table
-- exists for audit/extensibility and to list who may administer the portal.
CREATE TABLE admins (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Benchmark versions (MLCommons-style governance / versioning).
CREATE TABLE benchmark_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tag         TEXT NOT NULL UNIQUE,                 -- e.g. v0.1-pilot
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pilot',        -- pilot|active|frozen|deprecated
  is_current  INTEGER NOT NULL DEFAULT 0,           -- 0/1
  released_at TEXT,
  notes       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Domain tracks: the multi-track apparatus (paper Section 9 / Table 8).
-- TargetSpace is the framework; each track instantiates the shared scoring spine.
CREATE TABLE tracks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,                -- ts-personal, ts-health ...
  code         TEXT NOT NULL,                       -- TS-Personal
  name         TEXT NOT NULL,                       -- Personal Intelligence
  flagship     INTEGER NOT NULL DEFAULT 0,          -- 0/1
  readiness    TEXT NOT NULL DEFAULT 'research',    -- current|pilot|active|planned|research|private|retired
  tagline      TEXT,
  target_object   TEXT,                             -- e.g. "a consenting individual"
  evidence_bands  TEXT,                             -- e.g. "metadata, text, audio, ..."
  horizon         TEXT,                             -- e.g. "hours-weeks"
  example_states  TEXT,                             -- example target-state transitions
  validator       TEXT,                             -- outcome / resolution rule
  description     TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Evaluation splits: task regimes instantiated within a track (currently the
-- flagship TS-Personal track). SWE-bench-style task splits.
CREATE TABLE splits (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,               -- TS-Short, TS-Long ...
  name          TEXT NOT NULL,
  track_slug    TEXT NOT NULL DEFAULT 'ts-personal',
  status        TEXT NOT NULL DEFAULT 'pilot',      -- planned|pilot|active|private|retired
  description   TEXT,
  input_format  TEXT,
  output_format TEXT,
  metrics       TEXT,                               -- comma/JSON list of metric keys
  baselines     TEXT,
  example_task  TEXT,
  requirements  TEXT,                               -- submission requirements
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Public leaderboard. Every row carries is_mock so illustrative/pilot rows are
-- never confused with real results.
CREATE TABLE leaderboard_entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  system_name   TEXT NOT NULL,
  organization  TEXT,
  track_slug    TEXT,                               -- domain track
  split_code    TEXT,                               -- evaluation split
  version_tag   TEXT,                               -- benchmark version
  submission_type TEXT NOT NULL DEFAULT 'baseline', -- public|verified|private_eval|baseline
  is_mock       INTEGER NOT NULL DEFAULT 1,         -- 0/1 (illustrative)
  is_baseline   INTEGER NOT NULL DEFAULT 0,         -- 0/1
  -- metrics (nullable; bits / [0,1] as documented on the Metrics page)
  overall_score              REAL,
  target_adaptation_gain     REAL,                  -- skill over R2 (bits)
  temporal_order_sensitivity REAL,
  wrong_target_penalty       REAL,
  calibration_error          REAL,                  -- ECE, lower is better
  evidence_attribution       REAL,
  counterfactual_consistency REAL,
  long_horizon_degradation   REAL,
  modality_contribution      REAL,
  -- provenance
  paper_url    TEXT,
  code_url     TEXT,
  report_url   TEXT,
  submitted_at TEXT,
  notes        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Incoming submissions from the public Submit form. Written with status
-- 'pending_review' and triaged by an admin.
CREATE TABLE submissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  submitter_name TEXT NOT NULL,
  email         TEXT NOT NULL,
  organization  TEXT,
  system_name   TEXT NOT NULL,
  track_slug    TEXT,
  split_code    TEXT,
  version_tag   TEXT,
  submission_type_requested TEXT,                   -- public|verified|private_eval
  paper_url     TEXT,
  code_url      TEXT,
  report_url    TEXT,
  results_url   TEXT,
  method_summary TEXT,
  compute_notes TEXT,
  no_leakage      INTEGER NOT NULL DEFAULT 0,       -- 0/1 (attestation)
  repro_agreement INTEGER NOT NULL DEFAULT 0,       -- 0/1 (attestation)
  status        TEXT NOT NULL DEFAULT 'pending_review', -- pending_review|approved|rejected|public|verified|private_eval
  review_notes  TEXT,
  ip_hash       TEXT,                               -- coarse hash for rate limiting
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT
);

CREATE TABLE faq_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'general',
  published  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE doc_sections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,                  -- quickstart, protocol ...
  title      TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'guide',
  body       TEXT NOT NULL,                         -- lightweight markdown
  published  INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE announcements (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  level      TEXT NOT NULL DEFAULT 'info',          -- info|release|warn
  published  INTEGER NOT NULL DEFAULT 1,
  pinned     INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_leaderboard_track ON leaderboard_entries(track_slug);
CREATE INDEX idx_leaderboard_split ON leaderboard_entries(split_code);
CREATE INDEX idx_leaderboard_type ON leaderboard_entries(submission_type);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_splits_track ON splits(track_slug);
