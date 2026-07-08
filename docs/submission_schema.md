# Submission schema (Version 1.0 — reference specification)

Minimum fields for a real-data submission. Line-delimited JSON unless noted.
See also [submission_format.md](submission_format.md) for tiers and attestations.

## Input: forecast instances

| Field | Meaning |
|---|---|
| `instance_id` | unique instance identifier |
| `target_id` / `subject_id` | anonymized tracked-target identifier |
| `forecast_time` | sealed time `t` (ISO 8601) |
| `resolution_time` / `horizon` | resolution time `r` or explicit horizon |
| `question_type` | task family / question class |
| `answer_space` | discrete answer set |
| `resolution_rule` | deterministic rule fixing the outcome |
| `consent_status` | consent / eligibility flag (required for human targets) |

## Input: evidence records

| Field | Meaning |
|---|---|
| `segment_id` | observation segment identifier |
| `t_start`, `t_end` | segment time window |
| `modality` | evidence tier label (L0–L6) |
| `summary` | text/transcript summary where applicable |
| `provenance` | pointer to source stream (never raw bystander media in submissions) |

## Input: withheld outcomes (organizer-held)

`instance_id`, resolved `outcome`, resolution provenance. Outcome labels are withheld
from the system under test and never share a channel with model evidence.

## Output: per forecast

| Field | Meaning |
|---|---|
| `forecast_id`, `system_id`, `instance_id` | identifiers |
| `forecast_time` | when sealed |
| `distribution` | probability for every element of `answer_space` (ranked candidates allowed for ordered spaces) |
| `sha256` | hash of the sealed payload |
| `evidence_refs` | optional segment ids supporting the forecast |

## Output: per run

- metrics file (JSON/CSV) — see [metrics.md](metrics.md)
- run manifest (data slice, config, seeds, timestamps)
- model card / system description (output adapter, retrieval/memory access, training cutoff)
- ablation report per evidence tier
- baseline comparison vs. R1 and R2

**Privacy note:** submissions carry derived, consented artifacts only. Raw audio/video and
bystander-identifying content must not be submitted; the protocol's consent, privacy, and
governance requirements are binding.
