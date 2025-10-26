# Implementation Plan: AI Interview Coach (Cindy from Cinder)

**Branch**: `001-ai-interview-coach` | **Date**: 2025-10-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ai-interview-coach/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build Cindy from Cinder, a free AI interview and application coach featuring guest and registered practice sessions with tailored questions, audio/text recording with real-time transcription, STAR framework coaching feedback, comprehensive reports with strengths and clarifications, daily job digest emails with ≥80% match threshold, Low-Anxiety Mode for intimidated users, and recruiter funnel integration. Technical approach: Next.js full-stack application on Vercel with Supabase backend, OpenAI integration for LLM/STT/TTS, Microsoft Graph for email delivery, progressive enhancement from guest to registered features, and cost-controlled graceful degradation.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14.x (App Router)
**Primary Dependencies**: Next.js, React 18, Supabase Client, OpenAI SDK, Microsoft Graph SDK, React Hook Form, Zod (validation), TailwindCSS, Radix UI (accessible components), pdf-lib (PDF generation), ClamAV Node wrapper
**Storage**: Supabase (PostgreSQL database with Row Level Security, Auth, Storage for resume files)
**Testing**: Jest + React Testing Library (unit), Playwright (integration/e2e), NEEDS CLARIFICATION: contract testing library
**Target Platform**: Web browsers (Chrome/Firefox/Safari/Edge last 2 years), mobile responsive, hosted on Vercel
**Project Type**: Web application (frontend + backend via Next.js API routes)
**Performance Goals**:
- TTS latency ≤700ms from request to first audio chunk
- ASR partials ≤300ms, final transcript ≤2s after stop
- Per-question coaching ≤3s response time
- End-of-session report generation ≤10s
- File upload processing ≤10s for 3MB files
- Page loads ≤1.5s (p95)
**Constraints**:
- Monthly AI/audio cost cap: $300 (graceful degradation to text-only when approaching)
- Session limits: 10 questions OR 30 minutes per session, 2 sessions/day/user
- Audio recording cap: 3 minutes per question + one 30s extension
- Resume retention: one current resume per registered user (replace on upload)
- Transcripts stored, audio never persisted
- WCAG 2.2 AA compliance mandatory
**Scale/Scope**:
- Expected 100-500 sessions/day in month 1
- Target: 10k registered users by month 6
- Database: ~50k sessions, ~200k questions/answers per month
- File storage: ~5k resumes (3MB avg = 15GB)
- Email volume: ~2k digest emails/day (opt-in basis)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: Accessibility-First ✅ PASS

**Does the feature provide text-only fallback and meet WCAG 2.2 AA?**

- ✅ Text-only mode available for all users (guest default, registered toggle)
- ✅ Full transcripts and captions for all audio interactions
- ✅ Low-Anxiety Mode supports accessibility needs
- ✅ Radix UI primitives chosen for built-in ARIA compliance
- ✅ Keyboard navigation via semantic HTML and focus management
- ✅ Real-time captions during audio recording (FR-022)

**Compliance Strategy**: Use Radix UI headless components + TailwindCSS for consistent accessible markup; test with axe-core; manual keyboard navigation testing; screen reader validation (NVDA/VoiceOver).

### Gate 2: Data Privacy ✅ PASS

**Does the feature handle PII correctly and obtain proper consent?**

- ✅ Plain-English consent before first upload (FR-003)
- ✅ Location PII retained for ATS, SSN/DOB stripped (FR-011)
- ✅ Audio never stored, transcripts only (FR-025)
- ✅ One-click data deletion/export (FR-053)
- ✅ Opt-in consent for recruiter transcript access (FR-054, FR-055)
- ✅ Supabase encryption at rest (FR-052)
- ✅ AI coaching never invents facts (FR-029)

**Privacy Architecture**: Supabase Row Level Security policies per user; server-side resume parsing with PII detection regex; OpenAI API calls configured with no training data retention; consent versioning in database.

### Gate 3: Performance ✅ PASS

**Have performance targets been defined and budgeted?**

- ✅ TTS ≤700ms (FR-060)
- ✅ ASR ≤300ms partials, ≤2s final (FR-061)
- ✅ Per-question coaching ≤3s (FR-062)
- ✅ End report ≤10s (FR-063)
- ✅ Cost cap $300/month (FR-064)
- ✅ Graceful degradation plan (FR-065, FR-066)

**Performance Strategy**: Stream OpenAI responses (TTS/LLM); use Vercel Edge Functions for low-latency API routes; optimize React rendering with React.memo and Suspense; client-side cost tracking dashboard for admin; automatic fallback toggle when budget threshold reached.

### Gate 4: Progressive Enhancement ✅ PASS

**Can guest users access some value? Do registered users get meaningful upgrades?**

- ✅ Guest mode: text-only, generic soft-skills, end feedback (US1)
- ✅ Registered upgrades: resume/JD uploads, tailored questions, audio mode, session history, job digest (US2, US4)
- ✅ Clear value ladder: guest → sign-up nudge → unlock features
- ✅ No hard gates on core coaching value

**Enhancement Architecture**: Server components for guest pages (fast initial load); client components for auth-gated features; Supabase Auth middleware for route protection; feature flags in user profile for A/B testing upgrades.

### Gate 5: Safety ✅ PASS

**Are eligibility, security, and consent flows implemented?**

- ✅ Eligibility: 18+, U.S.-based gates (FR-004)
- ✅ reCAPTCHA on forms (FR-050)
- ✅ Per-IP and per-account rate limits (FR-051)
- ✅ Virus scanning for uploads (FR-008)
- ✅ Audit logs for admin actions (FR-059)
- ✅ Double opt-in for email digest (FR-041)

**Security Architecture**: Next.js middleware for eligibility checks; Vercel rate limiting; ClamAV Docker sidecar for file scanning; Supabase audit table with triggers; reCAPTCHA v3 (invisible) on forms with score threshold; Row Level Security prevents unauthorized data access.

### Pre-Research Gate Result: ✅ ALL GATES PASS

No constitutional violations. Proceeding to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-interview-coach/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── rest-api.yaml    # OpenAPI 3.0 spec for REST endpoints
│   └── webhooks.yaml    # Webhook contracts for external integrations
├── checklists/
│   └── requirements.md  # Spec quality validation (already complete)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Selected Structure**: Web application (Next.js App Router with API routes)

```text
app/
├── (auth)/                          # Route group for authenticated pages
│   ├── dashboard/
│   │   └── page.tsx                 # User session history
│   ├── settings/
│   │   └── page.tsx                 # Account, consent, data export
│   └── layout.tsx                   # Auth layout with Supabase middleware
├── (coach)/                         # Route group for coaching sessions
│   ├── practice/
│   │   ├── page.tsx                 # Session setup (questions, mode)
│   │   ├── session/[id]/
│   │   │   └── page.tsx             # Active session UI
│   │   └── results/[id]/
│   │       └── page.tsx             # Coaching report view
│   └── layout.tsx                   # Coach layout
├── (public)/                        # Route group for guest users
│   ├── page.tsx                     # Landing page
│   ├── login/
│   │   └── page.tsx                 # Google Sign-In / magic link
│   └── layout.tsx                   # Public layout
├── api/
│   ├── sessions/
│   │   ├── route.ts                 # POST /api/sessions (create)
│   │   ├── [id]/
│   │   │   ├── route.ts             # GET, PATCH, DELETE session
│   │   │   ├── questions/route.ts   # POST generate questions
│   │   │   └── coaching/route.ts    # POST generate coaching
│   ├── answers/
│   │   ├── route.ts                 # POST /api/answers (submit answer)
│   │   └── [id]/transcribe/route.ts # POST audio → transcript (Whisper)
│   ├── reports/
│   │   ├── [id]/route.ts            # GET report data
│   │   └── [id]/pdf/route.ts        # GET PDF download
│   ├── uploads/
│   │   ├── resume/route.ts          # POST resume upload + virus scan
│   │   └── jd/route.ts              # POST job description
│   ├── jobs/
│   │   ├── match/route.ts           # POST calculate match scores
│   │   └── digest/route.ts          # POST send daily digest (cron)
│   ├── admin/
│   │   ├── sessions/route.ts        # GET session summaries
│   │   ├── analytics/route.ts       # GET dashboard metrics
│   │   └── transcripts/[id]/route.ts # GET recruiter transcript access
│   ├── webhooks/
│   │   └── graph/route.ts           # POST Microsoft Graph bounce/complaint
│   └── cron/
│       ├── curate-jobs/route.ts     # Daily job email parsing
│       └── send-digests/route.ts    # Daily 5pm PT digest sender
├── layout.tsx                       # Root layout (fonts, providers)
└── globals.css                      # TailwindCSS imports

components/
├── coach/
│   ├── QuestionCard.tsx             # Display single question
│   ├── AudioRecorder.tsx            # Mic test, recording UI, captions
│   ├── AnswerInput.tsx              # Text input with accessibility
│   ├── CoachingFeedback.tsx         # Narrative + rubric tags + example
│   └── ReportPane.tsx               # Strengths, clarifications display
├── ui/                              # Radix UI + TailwindCSS primitives
│   ├── Button.tsx
│   ├── Dialog.tsx
│   ├── Form.tsx (React Hook Form + Zod)
│   └── [other Radix components]
└── shared/
    ├── Navbar.tsx
    ├── Footer.tsx
    └── ErrorBoundary.tsx

lib/
├── supabase/
│   ├── client.ts                    # Browser client
│   ├── server.ts                    # Server client
│   └── middleware.ts                # Auth middleware
├── openai/
│   ├── coaching.ts                  # LLM prompt templates
│   ├── questions.ts                 # Tailored question generation
│   ├── tts.ts                       # Text-to-speech streaming
│   └── stt.ts                       # Whisper transcription
├── microsoft-graph/
│   ├── send-email.ts                # Digest email sender
│   └── parse-jobs.ts                # Incoming email parser
├── scoring/
│   ├── star.ts                      # STAR framework scoring
│   └── job-match.ts                 # 0-100 match algorithm
├── security/
│   ├── virus-scan.ts                # ClamAV wrapper
│   ├── pii-detection.ts             # SSN/DOB regex stripper
│   └── rate-limit.ts                # Rate limiting logic
├── pdf/
│   └── generate-report.ts           # pdf-lib report generator
└── utils/
    ├── cost-tracker.ts              # Monthly spend monitoring
    └── validators.ts                # Zod schemas

types/
├── database.ts                      # Supabase generated types
├── openai.ts                        # OpenAI response types
└── models.ts                        # Domain model TypeScript types

public/
├── images/
│   └── cindy-avatar.svg             # Illustrated avatar
└── fonts/                           # Accessible web fonts

supabase/
├── migrations/                      # SQL migrations
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   └── 003_audit_triggers.sql
└── seed.sql                         # Question bank seed data

tests/
├── unit/
│   ├── scoring/star.test.ts
│   ├── scoring/job-match.test.ts
│   └── security/pii-detection.test.ts
├── integration/
│   ├── sessions.test.ts             # Full session flow
│   ├── coaching.test.ts             # Coaching generation
│   └── job-digest.test.ts           # Email digest flow
└── e2e/
    ├── guest-session.spec.ts        # Playwright: US1
    ├── registered-session.spec.ts   # Playwright: US2
    └── low-anxiety.spec.ts          # Playwright: US5
```

**Structure Decision**: Next.js 14 App Router with TypeScript. Colocation of routes in `app/` directory with route groups for auth/public/coach contexts. API routes colocated with frontend for serverless deployment on Vercel. Supabase for database, auth, and file storage. Radix UI components in `components/ui/` for accessibility compliance. Separation of concerns: `lib/` for business logic, `components/` for UI, `app/` for routing.

## Complexity Tracking

> **No constitutional violations detected. This section intentionally left empty.**

---

## Phase 0: Research (Complete)

All technical unknowns resolved. See [`research.md`](research.md) for detailed findings.

**Key Decisions**:
- Contract testing: MSW + OpenAPI
- Resume parsing: OpenAI structured output
- PII detection: Regex + age validation
- Cost tracking: Supabase table + monthly aggregation
- Virus scanning: ClamAV on Railway with HTTP API
- Job digest: Vercel Cron + Microsoft Graph
- WCAG compliance: Radix UI + axe DevTools + manual testing

---

## Phase 1: Design (Complete)

### Data Model

See [`data-model.md`](data-model.md) for complete schema.

**Core Entities**:
- `users` (registered accounts with eligibility, preferences, consent)
- `profiles` (career details, resume metadata)
- `sessions` (practice sessions with mode, anxiety flag, draft-save)
- `questions` (interview questions with category, tailoring, follow-ups)
- `answers` (user responses with STAR scores, rubric tags, honesty flags)
- `reports` (coaching feedback with strengths, clarifications, per-question guidance)
- `jobs` (curated postings with skills, must-haves, source)
- `matches` (user-job pairings with weighted scores, notification tracking)
- `events` (analytics events: session_start, coaching_viewed, etc.)
- `consents` (versioned Terms/Privacy agreements)

**Supporting Tables**:
- `cost_tracking` (OpenAI API usage by model/period)
- `system_config` (feature flags: audio_mode_enabled, cost_threshold)
- `audit_logs` (admin action trail)

**Relationships**:
- users (1) ──< (M) sessions
- sessions (1) ──< (M) questions
- questions (1) ──< (1) answers
- sessions (1) ──< (1) reports
- users (M) ──< (M) jobs [via matches]

**Row Level Security**:
- User isolation on sessions, answers, reports, profiles
- Recruiter access to transcripts conditionally (opt-in OR performance threshold)
- Admin-only access to audit_logs via service role

### API Contracts

See [`contracts/rest-api.yaml`](contracts/rest-api.yaml) for OpenAPI 3.0 specification.

**Endpoint Groups**:
- **Sessions**: Create, retrieve, update, generate questions, generate coaching
- **Answers**: Submit answer, transcribe audio (Whisper)
- **Reports**: Retrieve report, download PDF
- **Uploads**: Resume (with virus scan + PII detection), JD
- **Jobs**: Calculate match scores, send daily digest (cron)
- **Admin**: Session summaries, analytics dashboard, recruiter transcript access

**Authentication**:
- Supabase JWT bearer tokens
- Cron endpoints protected by Vercel cron secret

**Rate Limiting**:
- Per-IP and per-account limits enforced in middleware
- 429 responses with retry-after header

### Quickstart Guide

See [`quickstart.md`](quickstart.md) for developer onboarding.

**Local Development Setup**:
1. Install dependencies (Node 20+, Supabase CLI, Docker)
2. Configure environment variables (OpenAI, Supabase, Microsoft Graph)
3. Start Supabase locally (`supabase start`)
4. Run migrations and seed data (`supabase db reset`)
5. Start Next.js dev server (`npm run dev`)

**Key Test Journeys**:
- Guest practice session (text-only, generic questions)
- Registered user tailored practice (audio, resume/JD uploads)
- Low-Anxiety Mode (3 questions, no scores)
- Daily job digest (cron simulation)

**Testing Strategy**:
- Unit tests (Jest): STAR scoring, job matching, PII detection
- Integration tests (MSW mocking): Sessions, coaching, job digest
- E2E tests (Playwright): Guest session, registered session, Low-Anxiety Mode
- Accessibility tests (axe-core + manual): Keyboard nav, screen readers, color contrast

---

## Post-Design Constitution Check ✅ RE-VALIDATED

*Re-evaluation after Phase 1 design completion*

### Gate 1: Accessibility-First ✅ PASS

**Verification**:
- ✅ Text-only mode in data model (`sessions.mode = 'text'`)
- ✅ Real-time captions via Whisper ASR (`/api/answers/[id]/transcribe`)
- ✅ Low-Anxiety Mode flag in sessions table (`low_anxiety_enabled`)
- ✅ Radix UI components specified in dependencies (TailwindCSS + Radix UI)
- ✅ Accessibility testing in quickstart (axe-core + manual checklist)

**Architecture Compliance**: All UI components in `components/ui/` use Radix primitives. ARIA labels and semantic HTML enforced in code review checklist.

### Gate 2: Data Privacy ✅ PASS

**Verification**:
- ✅ Consent versioning in `consents` table (terms_version, privacy_version)
- ✅ PII detection function in `lib/security/pii-detection.ts` (SSN/DOB regex)
- ✅ Resume parsing stores location but strips SSN/DOB (FR-011)
- ✅ Audio never stored (answers table stores `transcript_text` only, `duration_seconds` metadata)
- ✅ One-click delete via `/api/users/[id]/delete` (cascade deletes across tables)
- ✅ RLS policies enforce user isolation and recruiter conditionals
- ✅ OpenAI configured with no training data retention flag

**Architecture Compliance**: Supabase RLS prevents unauthorized data access. Audit logs track all admin views of transcripts.

### Gate 3: Performance ✅ PASS

**Verification**:
- ✅ Performance targets documented in Technical Context (TTS ≤700ms, ASR ≤300ms, coaching ≤3s, report ≤10s)
- ✅ Cost tracking table with monthly aggregation function (`get_current_month_cost()`)
- ✅ System config table with `audio_mode_enabled` feature flag
- ✅ Graceful degradation logic in `/api/sessions` (check cost before enabling audio)
- ✅ Admin cost dashboard in `/api/admin/analytics`

**Architecture Compliance**: Vercel Edge Functions for OpenAI routes minimize latency. Streaming TTS/LLM responses improve perceived performance. Cost tracker runs after each API call with usage from response headers.

### Gate 4: Progressive Enhancement ✅ PASS

**Verification**:
- ✅ Guest sessions with `user_id = NULL` in sessions table
- ✅ Generic soft-skill questions for guests (seeded in question_bank)
- ✅ Resume upload gated by authentication (`/api/uploads/resume` requires Supabase JWT)
- ✅ Audio mode default for registered, text mode for guests (`sessions.mode`)
- ✅ Job digest opt-in tracked in users table (`digest_opt_in`, `digest_confirmed`)

**Architecture Compliance**: Route groups in `app/(public)/` vs `app/(auth)/` separate guest and registered experiences. Middleware enforces auth on gated routes.

### Gate 5: Safety ✅ PASS

**Verification**:
- ✅ Eligibility confirmation in users table (`eligibility_confirmed` boolean)
- ✅ reCAPTCHA integration in forms (site key in env vars)
- ✅ Rate limiting logic in `lib/security/rate-limit.ts`
- ✅ Virus scanning via ClamAV HTTP API (`lib/security/virus-scan.ts`)
- ✅ Audit logs table with admin action tracking
- ✅ Double opt-in for digest (users.digest_opt_in + users.digest_confirmed)

**Architecture Compliance**: Next.js middleware enforces eligibility checks before session creation. Vercel rate limiting applied at edge. ClamAV deployed on Railway as separate service.

---

## Post-Design Gate Result: ✅ ALL GATES PASS

No constitutional violations detected after design phase. Architecture decisions align with all five core principles:
1. **Accessibility-First**: Text fallbacks, Radix UI, axe-core testing
2. **Ethical AI & Data Privacy**: RLS policies, PII detection, no audio storage, consent versioning
3. **Performance & Cost Control**: Edge Functions, streaming, cost tracking, graceful degradation
4. **Progressive Enhancement**: Guest mode, auth-gated features, value ladder
5. **User Safety & Consent**: Eligibility gates, virus scanning, reCAPTCHA, audit logs

**Ready for `/speckit.tasks` to generate implementation task list.**

---

## Phase 2: Implementation Planning

**Next Command**: `/speckit.tasks`

This will generate `tasks.md` with dependency-ordered implementation tasks organized by user story (P1/P2/P3 priorities).

Expected task phases:
1. **Setup**: Project initialization, dependencies, linting
2. **Foundational**: Database schema, auth middleware, base models (BLOCKS all user stories)
3. **User Story 1 (P1)**: Guest practice session
4. **User Story 2 (P1)**: Registered user tailored practice
5. **User Story 3 (P1)**: Comprehensive coaching report
6. **User Story 4 (P2)**: Daily job digest email
7. **User Story 5 (P2)**: Low-Anxiety Mode
8. **User Story 6 (P3)**: Post-session feedback & referral
9. **Polish**: Documentation, performance optimization, security hardening

Each user story phase includes:
- Tests (if requested in spec)
- Models/entities
- Services/business logic
- API routes
- UI components
- Integration with previous stories

**Parallel Execution Strategy**: Once Foundational phase completes, user stories can be implemented in parallel by different developers (or sequentially in priority order for solo dev).

---

## Artifacts Generated

| Artifact | Path | Status |
|----------|------|--------|
| Implementation Plan | `specs/001-ai-interview-coach/plan.md` | ✅ Complete |
| Research Document | `specs/001-ai-interview-coach/research.md` | ✅ Complete |
| Data Model | `specs/001-ai-interview-coach/data-model.md` | ✅ Complete |
| API Contracts (REST) | `specs/001-ai-interview-coach/contracts/rest-api.yaml` | ✅ Complete |
| Quickstart Guide | `specs/001-ai-interview-coach/quickstart.md` | ✅ Complete |
| Agent Context | `CLAUDE.md` | ✅ Updated |
| Tasks | `specs/001-ai-interview-coach/tasks.md` | ⏳ Pending `/speckit.tasks` |
