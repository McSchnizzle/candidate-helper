# Data Model: AI Interview Coach (Cindy from Cinder)

**Feature**: 001-ai-interview-coach
**Date**: 2025-10-26
**Database**: Supabase PostgreSQL with Row Level Security

## Entity Relationship Overview

```
users (1) ──< (M) sessions
sessions (1) ──< (M) questions
questions (1) ──< (1) answers
sessions (1) ──< (1) reports
users (1) ──< (M) profiles
users (M) ──< (M) jobs [via matches]
users (1) ──< (M) consents
users (1) ──< (M) events
```

## Core Entities

### users

**Purpose**: Represents a job seeker account (registered users only; guest sessions have `user_id = NULL`).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier (linked to Supabase Auth) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `auth_provider` | VARCHAR(50) | NOT NULL | 'google' \| 'email_magic_link' |
| `work_auth_status` | VARCHAR(50) | NULL | Work authorization (e.g., 'US_citizen', 'H1B', 'green_card') |
| `comp_range_min` | INTEGER | NULL | Minimum compensation expectation (annual USD) |
| `comp_range_max` | INTEGER | NULL | Maximum compensation expectation (annual USD) |
| `remote_preference` | VARCHAR(20) | NULL | 'remote' \| 'hybrid' \| 'onsite' \| 'flexible' |
| `location` | VARCHAR(255) | NULL | City, State (for ATS alignment, not stripped) |
| `eligibility_confirmed` | BOOLEAN | DEFAULT FALSE | User confirmed 18+ and U.S.-based |
| `recruiter_access_granted` | BOOLEAN | DEFAULT FALSE | User opted into recruiter transcript access |
| `digest_opt_in` | BOOLEAN | DEFAULT FALSE | User requested job digest emails |
| `digest_confirmed` | BOOLEAN | DEFAULT FALSE | User confirmed digest via double opt-in email |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last profile update timestamp |

**Indexes**:
- `idx_users_email` on `email` (for login lookups)
- `idx_users_digest` on `digest_opt_in, digest_confirmed` (for cron queries)

**RLS Policies**: See research.md Section 5

---

### profiles

**Purpose**: User's career details and targeting preferences (1:1 with users, but nullable fields allow progressive profiling).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique profile identifier |
| `user_id` | UUID | FOREIGN KEY → users(id) ON DELETE CASCADE, NOT NULL | Owner user |
| `target_roles` | TEXT[] | NULL | Array of desired job titles (e.g., ['Software Engineer', 'Full Stack Developer']) |
| `seniority_level` | VARCHAR(20) | NULL | 'entry' \| 'mid' \| 'senior' \| 'lead' \| 'executive' |
| `resume_filename` | VARCHAR(255) | NULL | Original filename of uploaded resume |
| `resume_storage_path` | TEXT | NULL | Supabase Storage path (e.g., 'resumes/{user_id}/{uuid}.pdf') |
| `resume_uploaded_at` | TIMESTAMPTZ | NULL | Timestamp of last resume upload |
| `resume_file_size_bytes` | INTEGER | NULL | File size for storage tracking |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_profiles_user_id` on `user_id` (for profile lookups)

**Validation Rules**:
- `resume_file_size_bytes` ≤ 3_145_728 (3 MB limit from FR-006)
- `target_roles` array max length: 5 (prevent bloat)

---

### sessions

**Purpose**: A single practice interview session (guest or registered).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| `user_id` | UUID | FOREIGN KEY → users(id) ON DELETE SET NULL, NULL | Owner user (NULL for guest sessions) |
| `mode` | VARCHAR(10) | NOT NULL | 'audio' \| 'text' |
| `low_anxiety_enabled` | BOOLEAN | DEFAULT FALSE | Low-Anxiety Mode flag |
| `per_question_coaching` | BOOLEAN | DEFAULT FALSE | Show coaching after each question (vs end-of-session) |
| `job_description_text` | TEXT | NULL | Pasted/uploaded JD content |
| `target_role_override` | VARCHAR(255) | NULL | User-specified role if no JD provided |
| `question_count` | INTEGER | NOT NULL | Number of questions selected (3-10) |
| `started_at` | TIMESTAMPTZ | DEFAULT NOW() | Session start time |
| `completed_at` | TIMESTAMPTZ | NULL | Session completion time (NULL if abandoned) |
| `avg_star_score` | DECIMAL(3,2) | NULL | Average STAR score across all answers (1.00-5.00) |
| `completion_rate` | DECIMAL(3,2) | NULL | Percentage of questions answered (0.00-1.00) |
| `draft_save` | JSONB | NULL | In-progress session state for recovery (FR-067) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes**:
- `idx_sessions_user_id` on `user_id` (for user session history)
- `idx_sessions_completed_at` on `completed_at` (for analytics)
- `idx_sessions_recruiter_eligible` on `avg_star_score, completion_rate` (for recruiter access checks)

**Validation Rules**:
- `question_count` BETWEEN 3 AND 10 (from FR-013, FR-015)
- If `low_anxiety_enabled = TRUE`, `question_count` MUST = 3 (enforced in application logic)
- `avg_star_score` BETWEEN 1.00 AND 5.00
- `completion_rate` BETWEEN 0.00 AND 1.00

**State Transitions**:
1. `started_at` set → session active
2. User answers questions → `avg_star_score`, `completion_rate` updated incrementally
3. `completed_at` set → session finalized, report generated

---

### questions

**Purpose**: A single interview question within a session.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique question identifier |
| `session_id` | UUID | FOREIGN KEY → sessions(id) ON DELETE CASCADE, NOT NULL | Parent session |
| `question_order` | INTEGER | NOT NULL | Display order (1-based) |
| `question_text` | TEXT | NOT NULL | The interview question |
| `category` | VARCHAR(50) | NOT NULL | 'tailored_technical' \| 'tailored_behavioral' \| 'soft_skills_conflict' \| 'soft_skills_leadership' \| 'soft_skills_ownership' \| 'soft_skills_collaboration' \| 'soft_skills_failure' \| 'soft_skills_communication' |
| `is_tailored` | BOOLEAN | NOT NULL | TRUE if generated from resume/JD, FALSE if generic |
| `follow_up_question` | TEXT | NULL | Adaptive follow-up question text (if triggered) |
| `follow_up_used` | BOOLEAN | DEFAULT FALSE | TRUE if follow-up was asked (max 1 per question) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes**:
- `idx_questions_session_id` on `session_id` (for session question retrieval)
- `idx_questions_session_order` on `session_id, question_order` (for ordered retrieval)

**Validation Rules**:
- `question_order` unique within `session_id`
- If `follow_up_used = TRUE`, `follow_up_question` MUST NOT be NULL

---

### answers

**Purpose**: User's response to a single question (1:1 with questions).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique answer identifier |
| `session_id` | UUID | FOREIGN KEY → sessions(id) ON DELETE CASCADE, NOT NULL | Parent session |
| `question_id` | UUID | FOREIGN KEY → questions(id) ON DELETE CASCADE, UNIQUE, NOT NULL | The question being answered |
| `transcript_text` | TEXT | NOT NULL | Transcribed or typed answer text |
| `duration_seconds` | INTEGER | NULL | Audio recording duration (NULL for text answers) |
| `retake_used` | BOOLEAN | DEFAULT FALSE | TRUE if user used their one retake |
| `extension_used` | BOOLEAN | DEFAULT FALSE | TRUE if user used +30s extension |
| `star_situation_score` | INTEGER | NULL | STAR Situation score (1-5) |
| `star_task_score` | INTEGER | NULL | STAR Task score (1-5) |
| `star_action_score` | INTEGER | NULL | STAR Action score (1-5) |
| `star_result_score` | INTEGER | NULL | STAR Result score (1-5) |
| `specificity_tag` | VARCHAR(20) | NULL | 'specific' \| 'vague' \| 'unclear' |
| `impact_tag` | VARCHAR(20) | NULL | 'high_impact' \| 'medium_impact' \| 'low_impact' |
| `clarity_tag` | VARCHAR(20) | NULL | 'clear' \| 'rambling' \| 'incomplete' |
| `honesty_flag` | BOOLEAN | DEFAULT FALSE | TRUE if answer contradicts resume/JD |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Answer submission timestamp |

**Indexes**:
- `idx_answers_session_id` on `session_id` (for session answer retrieval)
- `idx_answers_question_id` on `question_id` (for 1:1 lookup)

**Validation Rules**:
- All `star_*_score` fields BETWEEN 1 AND 5 (if not NULL)
- `duration_seconds` BETWEEN 1 AND 210 (3.5 minutes max: 3 min + 30s extension)
- `specificity_tag`, `impact_tag`, `clarity_tag` are ENUM-like (enforced in app)

**Privacy Note**: `transcript_text` is visible to recruiters per RLS policy (see research.md)

---

### reports

**Purpose**: Coaching feedback summary for a completed session (1:1 with sessions).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique report identifier |
| `session_id` | UUID | FOREIGN KEY → sessions(id) ON DELETE CASCADE, UNIQUE, NOT NULL | The session this report belongs to |
| `strengths` | JSONB | NOT NULL | Top 3 strengths vs JD: [{ text: string, evidence: string }] |
| `clarifications` | JSONB | NOT NULL | 3 clarifications to add: [{ suggestion: string, rationale: string }] |
| `per_question_feedback` | JSONB | NOT NULL | Array of { question_id, narrative, example_answer } |
| `pdf_storage_path` | TEXT | NULL | Supabase Storage path for generated PDF |
| `pdf_generated_at` | TIMESTAMPTZ | NULL | Timestamp of PDF generation |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Report creation timestamp |

**JSONB Schemas**:

**strengths**:
```json
[
  {
    "text": "Strong project management experience leading cross-functional teams",
    "evidence": "Demonstrated in Q2 answer about leading API migration project"
  },
  {
    "text": "Quantifiable results in performance optimization",
    "evidence": "Reduced latency by 40% (Q5), improved throughput by 3x (Q7)"
  },
  {
    "text": "Clear communication of technical trade-offs",
    "evidence": "Explained REST vs GraphQL decision-making in Q4"
  }
]
```

**clarifications**:
```json
[
  {
    "suggestion": "Add specific metrics to your resume for the API migration project (e.g., team size, timeline, impact)",
    "rationale": "Hiring managers want to see scale and outcomes. You mentioned this in your answer but it's not clear in your resume."
  },
  {
    "suggestion": "Clarify your role in the performance optimization—were you the sole contributor or part of a team?",
    "rationale": "Your resume says 'improved performance' but doesn't specify your contribution level."
  },
  {
    "suggestion": "Connect your communication skills to a specific example in your cover letter",
    "rationale": "You demonstrated great communication in Q4, but this strength isn't highlighted in your application materials."
  }
]
```

**per_question_feedback**:
```json
[
  {
    "question_id": "uuid-here",
    "narrative": "Your answer showed a clear Situation and Task, with strong Action steps. To improve, add more specific results—what metrics changed after the project completed?",
    "example_answer": "In my role at XYZ Corp, I led a team of 5 engineers to migrate our REST API to GraphQL (Situation). Our goal was to reduce frontend query complexity and improve load times by 30% (Task). I designed the schema, set up Apollo Server, and coordinated with 3 frontend teams to update their clients (Action). After 6 months, we reduced average query count by 60% and improved page load times by 45%, leading to a 12% increase in user engagement (Result)."
  }
]
```

**Indexes**:
- `idx_reports_session_id` on `session_id` (for 1:1 lookup)

**Validation Rules**:
- `strengths` array length MUST = 3
- `clarifications` array length MUST = 3
- `per_question_feedback` array length MUST match session's `question_count`

---

### jobs

**Purpose**: A job posting in the curated pool (Cinder roles + external sources).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique job identifier |
| `source` | VARCHAR(50) | NOT NULL | 'cinder' \| 'ziprecruiter' \| 'indeed' \| 'macslist' |
| `title` | VARCHAR(255) | NOT NULL | Job title |
| `company` | VARCHAR(255) | NOT NULL | Company name |
| `skills` | TEXT[] | NOT NULL | Array of required skills (e.g., ['Python', 'Django', 'PostgreSQL']) |
| `must_have_skills` | TEXT[] | NULL | Array of non-negotiable skills (gate for matching) |
| `seniority_level` | VARCHAR(20) | NOT NULL | 'entry' \| 'mid' \| 'senior' \| 'lead' \| 'executive' |
| `location` | VARCHAR(255) | NULL | City, State (or 'Remote') |
| `posting_url` | TEXT | UNIQUE, NOT NULL | Link to original job posting |
| `curated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp when job was parsed/added |
| `active` | BOOLEAN | DEFAULT TRUE | FALSE if job expired/filled |

**Indexes**:
- `idx_jobs_source` on `source` (for filtering Cinder vs external)
- `idx_jobs_active` on `active, curated_at DESC` (for recent active jobs)
- `idx_jobs_url` on `posting_url` (for deduplication)
- `idx_jobs_skills` on `skills USING GIN` (for array overlap matching)

**Validation Rules**:
- `posting_url` must be valid URL
- `skills` array max length: 20
- `must_have_skills` ⊆ `skills` (subset validation in app)

---

### matches

**Purpose**: User-job pairing with match score (for job digest and recruiting alerts).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique match identifier |
| `user_id` | UUID | FOREIGN KEY → users(id) ON DELETE CASCADE, NOT NULL | Job seeker |
| `job_id` | UUID | FOREIGN KEY → jobs(id) ON DELETE CASCADE, NOT NULL | Matched job |
| `match_score` | INTEGER | NOT NULL | 0-100 match score |
| `hard_skills_score` | INTEGER | NULL | Hard skills component (0-50) |
| `soft_skills_score` | INTEGER | NULL | Soft skills component (0-20) |
| `seniority_score` | INTEGER | NULL | Seniority/impact component (0-20) |
| `logistics_score` | INTEGER | NULL | Logistics component (0-10) |
| `match_reasons` | TEXT[] | NULL | Array of why matched (e.g., ['Python expertise', 'Senior level fit', 'Remote preference match']) |
| `notified_at` | TIMESTAMPTZ | NULL | Timestamp when user was sent digest email (for idempotency) |
| `recruiting_alert_sent` | BOOLEAN | DEFAULT FALSE | TRUE if internal alert sent to recruiting team |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Match calculation timestamp |

**Indexes**:
- `idx_matches_user_id` on `user_id, match_score DESC` (for top matches per user)
- `idx_matches_job_id` on `job_id` (for job popularity analytics)
- `idx_matches_digest` on `user_id, notified_at` (for digest idempotency)
- `idx_matches_recruiting` on `match_score, recruiting_alert_sent` (for ≥80% Cinder alerts)

**Validation Rules**:
- `match_score` BETWEEN 0 AND 100
- `hard_skills_score + soft_skills_score + seniority_score + logistics_score = match_score`
- If `match_score` ≥ 80 AND `job.source = 'cinder'`, `recruiting_alert_sent` should be TRUE

---

### events

**Purpose**: Analytics event log (Supabase-only tracking, no GA/PostHog in MVP).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique event identifier |
| `user_id` | UUID | FOREIGN KEY → users(id) ON DELETE SET NULL, NULL | User who triggered event (NULL for guest) |
| `event_type` | VARCHAR(50) | NOT NULL | 'session_start' \| 'mic_check_passed' \| 'q_answered' \| 'coaching_viewed' \| 'survey_submitted' \| 'share_link_clicked' \| 'digest_opt_in' |
| `session_id` | UUID | FOREIGN KEY → sessions(id) ON DELETE SET NULL, NULL | Related session (if applicable) |
| `payload` | JSONB | NULL | Event-specific data (e.g., { question_id, score, source: 'referral' }) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |

**Indexes**:
- `idx_events_user_id` on `user_id, created_at DESC` (for user activity history)
- `idx_events_type` on `event_type, created_at DESC` (for analytics dashboards)
- `idx_events_session_id` on `session_id` (for session funnel analysis)

**Sample Payloads**:

**session_start**:
```json
{ "mode": "audio", "low_anxiety": false, "guest": false }
```

**q_answered**:
```json
{ "question_id": "uuid", "duration_seconds": 145, "retake_used": true }
```

**share_link_clicked**:
```json
{ "referral_code": "abc123", "source": "email" }
```

---

### consents

**Purpose**: User agreement to Terms of Service and Privacy Policy (versioned for GDPR-like compliance).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique consent identifier |
| `user_id` | UUID | FOREIGN KEY → users(id) ON DELETE CASCADE, NOT NULL | User who consented |
| `terms_version` | VARCHAR(20) | NOT NULL | Terms of Service version (e.g., 'v1.0', 'v1.1') |
| `privacy_version` | VARCHAR(20) | NOT NULL | Privacy Policy version (e.g., 'v1.0') |
| `ip_address` | INET | NULL | IP address at time of consent (for legal compliance) |
| `user_agent` | TEXT | NULL | Browser user agent string (for legal compliance) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Consent timestamp |

**Indexes**:
- `idx_consents_user_id` on `user_id, created_at DESC` (for consent history)

**Validation Rules**:
- User must have at least one consent record before uploading files (FR-003)

---

## Supporting Tables

### cost_tracking

**Purpose**: Track OpenAI API usage and costs for monthly budget cap monitoring.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique cost tracking identifier |
| `period_start` | TIMESTAMPTZ | NOT NULL | Billing cycle start (e.g., 2025-10-01 00:00:00 UTC) |
| `period_end` | TIMESTAMPTZ | NOT NULL | Billing cycle end (e.g., 2025-10-31 23:59:59 UTC) |
| `model` | VARCHAR(50) | NOT NULL | 'gpt-4o' \| 'gpt-4-turbo' \| 'whisper-1' \| 'tts-1' |
| `tokens_used` | INTEGER | NULL | Total tokens consumed (for LLM models) |
| `audio_seconds` | DECIMAL(10,2) | NULL | Total audio seconds processed (for STT/TTS) |
| `estimated_cost_usd` | DECIMAL(10,4) | NOT NULL | Estimated cost in USD |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes**:
- `idx_cost_tracking_period` on `period_start, period_end` (for monthly aggregation)
- `idx_cost_tracking_model` on `model, period_start` (for model breakdown)

**Functions**:
```sql
CREATE FUNCTION get_current_month_cost() RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(estimated_cost_usd), 0.00)
  FROM cost_tracking
  WHERE period_start >= date_trunc('month', CURRENT_DATE)
    AND period_end < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
$$ LANGUAGE SQL;
```

---

### system_config

**Purpose**: Feature flags and system-wide configuration.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `key` | VARCHAR(100) | PRIMARY KEY | Configuration key (e.g., 'audio_mode_enabled') |
| `value` | TEXT | NOT NULL | Configuration value (JSON string for complex values) |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Example Rows**:
```sql
INSERT INTO system_config (key, value) VALUES
  ('audio_mode_enabled', 'true'),
  ('monthly_cost_threshold_usd', '285.00'),
  ('max_sessions_per_day', '2'),
  ('max_questions_per_session', '10');
```

---

### audit_logs

**Purpose**: Admin action audit trail (who did what, when).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique audit log identifier |
| `admin_user_id` | UUID | FOREIGN KEY → users(id) ON DELETE SET NULL, NULL | Admin who performed action |
| `action_type` | VARCHAR(100) | NOT NULL | 'view_transcript' \| 'download_report' \| 'update_config' \| 'send_recruiting_alert' |
| `resource_type` | VARCHAR(50) | NULL | 'session' \| 'user' \| 'job' \| 'system_config' |
| `resource_id` | UUID | NULL | ID of affected resource |
| `details` | JSONB | NULL | Action-specific details (e.g., { transcript_id, reason: 'high match' }) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Action timestamp |

**Indexes**:
- `idx_audit_logs_admin` on `admin_user_id, created_at DESC` (for admin activity history)
- `idx_audit_logs_resource` on `resource_type, resource_id` (for resource audit trail)

**RLS**: No user policies (admin-only via service role)

---

## Relationships Summary

| Parent | Child | Relationship | Cascade |
|--------|-------|--------------|---------|
| users | sessions | 1:M | ON DELETE SET NULL (preserve guest sessions) |
| users | profiles | 1:1 | ON DELETE CASCADE |
| users | matches | 1:M | ON DELETE CASCADE |
| users | consents | 1:M | ON DELETE CASCADE |
| users | events | 1:M | ON DELETE SET NULL (preserve analytics) |
| sessions | questions | 1:M | ON DELETE CASCADE |
| sessions | reports | 1:1 | ON DELETE CASCADE |
| questions | answers | 1:1 | ON DELETE CASCADE |
| jobs | matches | 1:M | ON DELETE CASCADE |

---

## Data Retention Policy

| Entity | Retention | Rationale |
|--------|-----------|-----------|
| users | User-controlled (one-click delete) | FR-053 |
| sessions | 1 year after completion | Analytics, recruiter access |
| answers (transcripts) | 1 year after completion | Recruiter access, coaching improvement |
| reports | 1 year after generation | User reference |
| jobs | 90 days after `active = FALSE` | Digest history |
| matches | 1 year | Recruiting pipeline |
| events | 2 years | Analytics, product improvement |
| consents | Indefinite | Legal compliance |
| audit_logs | 7 years | Legal/security compliance |
| cost_tracking | Indefinite | Financial records |

---

## Migrations Plan

**Migration 001**: Initial schema
- Create all tables with fields as defined above
- Create indexes for performance
- Seed `system_config` with default values

**Migration 002**: Row Level Security policies
- Enable RLS on all user-facing tables
- Create policies per research.md Section 5
- Test RLS with sample users

**Migration 003**: Audit triggers
- Create trigger on `audit_logs` for admin actions
- Create trigger to update `sessions.avg_star_score` when answers are inserted/updated
- Create trigger to update `sessions.completion_rate` when answers are inserted

**Seed Data**:
- Generic soft-skill questions (conflict, leadership, ownership, collaboration, failure/learning, communication)
- Sample Cinder job postings
- Default system config values
