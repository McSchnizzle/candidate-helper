<!--
Sync Impact Report:
- Version Change: Initial (template) → 1.0.0
- Ratification Date: 2025-10-26
- Scope: Initial constitution for Cindy from Cinder MVP

Modified Principles:
- All placeholder principles replaced with project-specific principles

Added Sections:
1. Accessibility-First (Principle I)
2. Ethical AI & Data Privacy (Principle II)
3. Performance & Cost Control (Principle III)
4. Progressive Enhancement (Principle IV)
5. User Safety & Consent (Principle V)
6. Technology Stack Standards
7. Quality Gates
8. Development Workflow

Templates Status:
✅ plan-template.md - Constitution Check section aligns with new principles
✅ spec-template.md - User Scenarios align with accessibility and user safety principles
✅ tasks-template.md - Task structure supports independent testing per accessibility requirements

Follow-up TODOs:
- None - all placeholders resolved
-->

# Cindy from Cinder Constitution

## Core Principles

### I. Accessibility-First

**Every feature MUST be fully accessible and provide text-only fallback options.**

Requirements:
- WCAG 2.2 AA conformance is MANDATORY for all user-facing features
- Full transcripts and captions MUST be provided for all audio content
- Text-only fallback MUST exist for every feature (no audio-only experiences)
- Low-Anxiety Mode variations MUST be considered during design
- Keyboard navigation and screen reader compatibility are NON-NEGOTIABLE

Rationale: The target audience includes users who may be intimidated or have accessibility
needs. Providing multiple interaction modes ensures the product is inclusive and reaches
the widest possible audience.

### II. Ethical AI & Data Privacy

**User data ownership and transparency are paramount; AI must never fabricate information.**

Requirements:
- Users OWN their content; Cinder may use it to improve the service (with explicit consent)
- AI coaching MUST NOT invent facts, experiences, or details not present in user inputs
- When honesty nudges are needed, ask clarifying questions rather than making assumptions
- Audio recordings MUST NOT be stored (transcripts only)
- Personally identifiable information (PII) handling:
  - Keep location data (for ATS alignment)
  - Strip/flag SSN and DOB if present
  - Virus scan all uploads (ClamAV)
- One-click data deletion and export MUST be available
- Plain-English consent summaries before first upload (Terms/Privacy viewable at account
  creation)

Rationale: Building trust with job seekers requires absolute transparency about data use
and ensuring AI assistance enhances rather than replaces authentic candidate experiences.

### III. Performance & Cost Control

**Real-time interactions must feel responsive; monthly costs must stay within budget caps.**

Performance Targets (Audio Mode):
- Text-to-Speech (TTS) begins ≤ 700 ms
- Automatic Speech Recognition (ASR) partials ≤ 300 ms; final transcript ≤ 2s after stop
- Per-question coaching ≤ 3s
- End-of-session report ≤ 10s

Cost Controls:
- Monthly spend cap: $300 for model/audio costs
- When approaching cap: gracefully degrade to text-only mode temporarily
- Restore audio automatically next billing cycle
- Inform users inline with clear messaging (no silent failures)

Session Limits:
- Maximum 10 questions per session or 30 minutes
- Maximum 2 sessions per day per user
- Graceful retry logic for model/ASR hiccups
- Draft-save functionality for in-progress sessions

Rationale: Users expect responsive AI interactions. Budget constraints require intelligent
degradation strategies that maintain core value while controlling costs.

### IV. Progressive Enhancement

**Guest users get immediate value; registered users unlock richer features.**

Guest Mode:
- Text-only interaction (no uploads, no audio)
- Generic soft-skills questions
- End-of-session feedback and coaching
- Nudges to sign in for full features

Registered Account:
- Google Sign-In or email magic link authentication
- Resume and Job Description uploads (PDF, DOCX, TXT, MD; max 3 MB)
- Audio recording with transcription (default)
- Discreet text-only accessibility toggle available
- Tailored questions based on uploaded materials
- Session history retention
- Optional daily job digest email (double opt-in)

Rationale: Lowering barriers to entry (no sign-up required) increases trial usage, while
account features provide clear upgrade value without gatekeeping core functionality.

### V. User Safety & Consent

**Eligibility, security, and opt-in controls protect both users and the platform.**

Eligibility Gates:
- Users MUST be 18+ years old
- Users MUST be U.S.-based (MVP scope)

Security Requirements:
- reCAPTCHA protection on forms
- Per-IP and per-account rate limits
- Encryption at rest (Supabase managed)
- Virus scanning for all file uploads (ClamAV)
- Admin access protected with audit logs

Consent & Control:
- Double opt-in for email digests; one-click unsubscribe
- Clear consent gates before first upload
- Recruiter access to transcripts is opt-in OR triggered by performance/match thresholds
  (users can revoke later)
- All admin views and actions logged in audit trail

Rationale: Protecting vulnerable job seekers from exploitation and ensuring compliance
with data privacy expectations builds platform credibility.

## Technology Stack Standards

### Core Stack (NON-NEGOTIABLE for MVP)

- **Frontend/Backend**: Next.js (hosted on Vercel)
- **Database/Auth/Storage**: Supabase (with encryption at rest)
- **AI/Voice Services**: OpenAI (GPT models + Whisper STT + TTS)
- **Email Delivery**: Microsoft Graph sending from AI-Cindy@teamcinder.com
  - Reply-To: recruiting@teamcinder.com
  - SPF/DKIM configured
  - Bounces/complaints routed to recruiting@teamcinder.com
- **Security Tools**: reCAPTCHA (forms), ClamAV (file scanning)
- **Analytics**: Supabase logs/events only (no Google Analytics or PostHog in MVP)

### File Format Support

Accepted formats: PDF, DOCX, TXT, MD
Blocked formats: .pages (with helper message to export as PDF)
Maximum file size: 3 MB

### Integration Constraints

- No LinkedIn import in MVP
- No ATS/CRM write-backs (email delivery only)
- No live video or avatar rendering
- No code execution or auto-grading for technical questions
- No multi-language support in MVP

Rationale: A constrained, proven stack reduces integration risk and allows rapid iteration
on core user value before expanding scope.

## Quality Gates

### Constitution Check (MANDATORY before Phase 0 research and after Phase 1 design)

Every feature plan MUST verify compliance with:

1. **Accessibility Gate**: Does the feature provide text-only fallback and meet WCAG 2.2 AA?
2. **Data Privacy Gate**: Does the feature handle PII correctly and obtain proper consent?
3. **Performance Gate**: Have performance targets been defined and budgeted?
4. **Progressive Enhancement Gate**: Can guest users access some value? Do registered
   users get meaningful upgrades?
5. **Safety Gate**: Are eligibility, security, and consent flows implemented?

If a gate fails, document in the Complexity Tracking table why the violation is necessary
and what simpler alternatives were rejected.

### Acceptance Criteria (MVP Launch Requirements)

All 10 acceptance criteria from PRD Section 11 MUST pass before launch:

- AC-1: Guest text-only session with end report
- AC-2: Registered user uploads + audio session with mic test
- AC-3: End report with strengths, clarifications, examples, PDF download
- AC-4: Low-Anxiety Mode (no scores, no follow-ups, gentler prompts)
- AC-5: Survey with extra open-ended item for Low-Anxiety sessions
- AC-6: Daily digest double opt-in at 5:00 p.m. PT; one-click unsubscribe
- AC-7: ≥80% Cinder role match triggers recruiting email; recruiter transcript access
- AC-8: One-click delete/export of user data
- AC-9: File size/format enforcement; .pages blocked; virus scanning
- AC-10: Graceful degradation to text-only at $300/month cap; auto-restore next cycle

## Development Workflow

### Spec-Driven Process

1. **Specify**: Define user scenarios, requirements, success criteria (no implementation
   details)
2. **Plan**: Map requirements to technical architecture; verify Constitution Check gates
3. **Tasks**: Generate dependency-ordered, independently testable task list organized by
   user story
4. **Implement**: Execute tasks with continuous validation against acceptance criteria

### User Story Independence

Each user story MUST be:
- Implementable independently (can start after foundational phase completes)
- Testable independently (acceptance scenarios validate the story in isolation)
- Deployable independently (delivers standalone value even if other stories are incomplete)
- Prioritized (P1 = MVP-critical, P2 = high value, P3 = nice-to-have)

### Testing Discipline

- Tests are OPTIONAL unless explicitly requested in feature specification
- When tests are requested: TDD approach (write tests → verify they fail → implement →
  verify they pass)
- Test categories: Contract tests (API/interface compliance), Integration tests (user
  journey flows), Unit tests (isolated component logic)

### Branching & Commits

- Feature branches named: `###-feature-name` (auto-numbered by `/speckit.specify`)
- Commit after each logical task or task group
- Stop at checkpoints to validate user stories independently before proceeding

### Admin & Observability

- All user events tracked in Supabase: `session_start`, `mic_check_passed`, `q_answered`,
  `coaching_viewed`, `survey_submitted`, `share_link_clicked`, `digest_opt_in`
- Admin dashboard MUST show: session summaries, completion rates, survey tallies, referral
  clicks, digest opt-ins
- Recruiter access to transcripts for eligible users (no audio storage)
- Audit logs for all admin actions

## Governance

### Amendment Process

1. Proposed changes MUST document:
   - Rationale for change
   - Impact on existing features
   - Migration plan (if breaking change)
2. Constitution version incremented per semantic versioning:
   - MAJOR: Backward-incompatible governance or principle removal/redefinition
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording fixes, non-semantic refinements
3. All dependent templates (.specify/templates/) MUST be reviewed and updated to align
   with amendments

### Compliance Enforcement

- All PRs and design reviews MUST verify compliance with this constitution
- Complexity MUST be justified in the Complexity Tracking table when constitutional
  violations are unavoidable
- The constitution supersedes ad-hoc practices and preferences

### Living Document

This constitution guides the Cindy from Cinder project through MVP and beyond. As the
product evolves, amendments should reflect learnings while preserving the core principles
of accessibility, ethical AI, user safety, and cost discipline.

**Version**: 1.0.0 | **Ratified**: 2025-10-26 | **Last Amended**: 2025-10-26
