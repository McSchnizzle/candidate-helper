# Feature Specification: AI Interview Coach (Cindy from Cinder)

**Feature Branch**: `001-ai-interview-coach`
**Created**: 2025-10-26
**Status**: Draft
**Input**: Comprehensive PRD for Cindy from Cinder - AI interview and application coach

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest Practice Session (Priority: P1) 🎯 MVP

Job seekers can immediately try the interview coach without creating an account, practicing with generic soft-skill questions and receiving supportive feedback.

**Why this priority**: Lowest barrier to entry; proves core value proposition; drives sign-up conversions. Essential for viral growth and initial user validation.

**Independent Test**: A visitor can land on teamcinder.com/coach, start a text-based practice session with 3-5 generic behavioral questions, receive end-of-session coaching feedback, and see a nudge to create an account for personalized features.

**Acceptance Scenarios**:

1. **Given** a visitor lands on teamcinder.com/coach without signing in, **When** they start a practice session, **Then** they are presented with 3-10 generic soft-skill questions (default 8) in text-only mode
2. **Given** a guest user answers all selected questions via text, **When** the session completes, **Then** they receive narrative coaching feedback with rubric tags and example improved answers
3. **Given** a guest user completes their session, **When** they view the results, **Then** they see a clear nudge to create an account to unlock resume uploads, audio mode, and job matching
4. **Given** a guest user is in Low-Anxiety Mode, **When** they complete the session, **Then** they answer only 3 questions with no adaptive follow-ups and see no numeric scores

---

### User Story 2 - Registered User Tailored Practice (Priority: P1) 🎯 MVP

Registered users upload their resume and job description to receive tailored interview questions and practice with audio or text responses.

**Why this priority**: Core differentiated value; demonstrates AI personalization; required for job matching pipeline. Cannot deliver on brand promise without this.

**Independent Test**: A registered user uploads a PDF resume and pastes a job description, selects 8 questions (6 tailored + 2 soft-skills), records audio answers with mic test and device selection, and receives a comprehensive end-of-session report with strengths and clarifications.

**Acceptance Scenarios**:

1. **Given** a user has signed in with Google or email magic link, **When** they upload a resume (PDF/DOCX/TXT/MD, max 3MB) and paste/upload a JD, **Then** the system accepts the files after virus scanning and generates tailored questions
2. **Given** a user has uploaded materials, **When** they select question preferences (3-10 questions, default 8), **Then** the system presents a mix of tailored questions based on their resume/JD and generic soft-skills
3. **Given** a user starts answering questions in audio mode, **When** they first begin, **Then** they complete a mic test with device selection and see real-time captions/transcripts
4. **Given** a user is recording an audio answer, **When** they reach 3 minutes or finish early, **Then** they can use one retake or request a one-time +30s extension
5. **Given** a user answers a question with missing STAR elements, **When** adaptive follow-up is enabled (default on, off in Low-Anxiety Mode), **Then** they receive one clarifying follow-up question maximum
6. **Given** a user has accessibility needs, **When** they toggle to text-only mode, **Then** all questions switch to text input with no audio recording

---

### User Story 3 - Comprehensive Coaching Report (Priority: P1) 🎯 MVP

Users receive detailed feedback identifying their top 3 strengths versus the job description and 3 concrete clarifications to add to their resume or cover letter.

**Why this priority**: Delivers actionable coaching value; differentiates from generic interview prep; builds trust through concrete examples. Without this, the tool is just practice without growth.

**Independent Test**: After completing a practice session with resume and JD, a user views a three-pane report showing (1) top 3 strengths vs JD, (2) 3 clarifications to add to application materials, and (3) per-question narrative coaching with example improved answers, all downloadable as PDF.

**Acceptance Scenarios**:

1. **Given** a user completes a practice session with uploaded resume/JD, **When** the session ends, **Then** they see a report with Top 3 Strengths clearly mapped to JD requirements
2. **Given** the same completed session, **When** the user views Pane 2 of the report, **Then** they see 3 specific, encouraging suggestions for clarifications to add (never penalizing tone)
3. **Given** the user reviews per-question feedback, **When** they read coaching for each answer, **Then** they see narrative guidance, rubric tags (STAR elements scored 1-5), and an example improved answer that never invents new facts
4. **Given** a user's answer contradicts their resume/JD, **When** the coaching is generated, **Then** they receive an honesty nudge asking a clarifying question and a note to "make the connection clear in your documentation"
5. **Given** a user wants to save their report, **When** they click download, **Then** they receive a PDF with strengths, clarifications, per-question notes, and example answers
6. **Given** a user opted for per-question coaching instead of end-of-session, **When** they finish each question, **Then** they receive immediate feedback before proceeding (optional setting)

---

### User Story 4 - Daily Job Digest Email (Priority: P2)

Registered users opt into a daily email digest of highly relevant job postings matched to their resume and performance, delivered at 5:00 p.m. PT.

**Why this priority**: Extends platform value beyond practice sessions; creates retention touchpoint; enables recruiter funnel. Secondary to core coaching but critical for business model.

**Independent Test**: A registered user with an uploaded resume opts into the job digest, receives a double opt-in confirmation email, and at 5:00 p.m. PT receives a curated list of jobs scoring ≥80% match with clear one-click unsubscribe.

**Acceptance Scenarios**:

1. **Given** a registered user with a resume on file, **When** they opt into the job digest, **Then** they receive a double opt-in confirmation email before being added to the daily send
2. **Given** a user has confirmed opt-in, **When** 5:00 p.m. PT arrives each day, **Then** they receive an email from AI-Cindy@teamcinder.com with jobs scoring ≥80% match (Reply-To: recruiting@teamcinder.com)
3. **Given** a user receives the digest email, **When** they click a job listing, **Then** they are directed to the original job posting (Cinder roles or external sources like ZipRecruiter, Indeed, Mac's List)
4. **Given** a user no longer wants the digest, **When** they click the one-click unsubscribe link, **Then** they are immediately removed from future sends
5. **Given** a user matches ≥80% with a Cinder role, **When** the match is detected, **Then** an internal email is sent to the recruiting team distribution list with candidate summary and transcript access (if user opted in or meets performance threshold)

---

### User Story 5 - Low-Anxiety Mode (Priority: P2)

Users who feel intimidated by traditional interviews can enable Low-Anxiety Mode for a gentler experience with only 3 questions, no adaptive follow-ups, and no numeric scores.

**Why this priority**: Addresses a key persona (Nervous Nora); demonstrates ethical AI design; increases accessibility. Differentiates brand but not blocking for core value.

**Independent Test**: A user selects Low-Anxiety Mode at session start, answers 3 questions with gentler prompts and pacing, receives supportive narrative feedback with no numeric scores, and completes an optional open-ended survey question about the experience.

**Acceptance Scenarios**:

1. **Given** a user starts a new practice session, **When** they enable Low-Anxiety Mode, **Then** they are limited to exactly 3 questions regardless of other selections
2. **Given** Low-Anxiety Mode is enabled, **When** the user answers questions, **Then** no adaptive follow-ups are triggered even if STAR elements are missing
3. **Given** Low-Anxiety Mode is enabled, **When** the user views their coaching report, **Then** no numeric scores appear (only narrative guidance and qualitative rubric tags)
4. **Given** a user completes a Low-Anxiety Mode session, **When** they reach the post-session survey, **Then** they see an additional open-ended question: "Anything we should improve about Low-Anxiety Mode?"
5. **Given** Low-Anxiety Mode is active, **When** questions are presented, **Then** prompts use gentler language and allow more time for reflection

---

### User Story 6 - Post-Session Feedback & Referral (Priority: P3)

Users provide quick feedback on session helpfulness and can share a referral link to invite others, with clicks tracked for growth metrics.

**Why this priority**: Enables product iteration and viral growth; lightweight implementation. Nice-to-have for MVP but not blocking core value delivery.

**Independent Test**: After completing a session, a user rates helpfulness on three Likert items (Like/Neutral/Dislike), sees a shareable referral link, and shares it with a friend whose click is tracked in admin analytics.

**Acceptance Scenarios**:

1. **Given** a user completes any practice session, **When** they finish viewing results, **Then** they see a 3-item survey asking about helpfulness, advice quality, and preparedness (Like/Neutral/Dislike scale)
2. **Given** a user completes the survey, **When** their responses are submitted, **Then** the data is stored and aggregated in admin dashboard survey tallies
3. **Given** a user views the results screen, **When** they look for sharing options, **Then** they see a referral/share link with tracking parameters
4. **Given** a user shares the referral link, **When** someone clicks it, **Then** the click is tracked in admin analytics under referral clicks

---

### Edge Cases

- What happens when a user uploads a .pages file instead of PDF/DOCX/TXT/MD? → System blocks the upload and displays a helper message: "Please export your .pages file to PDF and upload again."
- How does the system handle a resume containing SSN or date of birth? → System strips/flags SSN and DOB during parsing and logs a warning for admin review.
- What happens when a user's audio answer contains long pauses or silence? → System waits up to the 3-minute cap, includes silence in transcript, and prompts user to confirm completion or use retake option.
- How does the system respond when monthly cost cap ($300) is reached mid-session? → System completes the current session in audio mode but gracefully degrades all new sessions to text-only with inline notification; restores audio automatically at next billing cycle.
- What happens when a user tries to start a 3rd session in the same day? → System displays a friendly message: "You've reached your limit of 2 sessions today. Come back tomorrow to continue practicing!"
- How does the system handle a user answering in a way that contradicts their resume/JD? → System flags the inconsistency, asks a clarifying adaptive follow-up if enabled, and includes a note in the report: "Consider making this connection clearer in your resume or cover letter to help hiring teams understand your fit."
- What happens when virus scanning detects malware in an uploaded file? → Upload is rejected immediately with error message: "We detected a security issue with your file. Please check the file and try again."
- How does the system handle a user with no internet during audio recording? → Draft-save functionality preserves in-progress answers; user can resume session when connection is restored (within 30-minute session limit).

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Onboarding

- **FR-001**: System MUST support guest mode allowing text-only practice sessions without account creation
- **FR-002**: System MUST support account creation via Google Sign-In or email magic link
- **FR-003**: System MUST display plain-English consent summary and full Terms/Privacy before first file upload
- **FR-004**: System MUST enforce eligibility gate requiring users to be 18+ years old and U.S.-based
- **FR-005**: System MUST nudge guest users to create an account after session completion to unlock full features

#### File Uploads & Processing

- **FR-006**: System MUST accept resume uploads in PDF, DOCX, TXT, and MD formats with maximum file size of 3 MB
- **FR-007**: System MUST block .pages file uploads and display helper message to export as PDF
- **FR-008**: System MUST virus-scan all uploaded files using ClamAV before processing
- **FR-009**: System MUST allow job description input via paste or file upload
- **FR-010**: System MUST retain uploaded resume through session; for registered users, retain one current resume (replace on next upload)
- **FR-011**: System MUST keep location PII for ATS alignment but strip/flag SSN and DOB if present

#### Question Generation & Practice Sessions

- **FR-012**: System MUST generate tailored questions based on uploaded resume and optional JD (or target role/industry if no JD provided)
- **FR-013**: System MUST allow users to select 3-10 questions per session (default 8: 6 tailored + 2 soft-skills)
- **FR-014**: System MUST present generic soft-skill questions only for guest users (no tailored questions without resume)
- **FR-015**: System MUST support Low-Anxiety Mode with exactly 3 questions, no adaptive follow-ups, and gentler prompts
- **FR-016**: System MUST support adaptive follow-up (max 1 per question) when enabled to probe missing STAR elements
- **FR-017**: System MUST disable adaptive follow-ups in Low-Anxiety Mode
- **FR-018**: System MUST enforce session limits: maximum 10 questions or 30 minutes per session, 2 sessions per day per user

#### Audio & Accessibility

- **FR-019**: System MUST default to audio recording mode for logged-in users with 3-minute cap per question
- **FR-020**: System MUST provide discreet text-only accessibility toggle for registered users
- **FR-021**: System MUST present mic test screen with device selector before first audio recording
- **FR-022**: System MUST display real-time captions and transcripts during audio recording
- **FR-023**: System MUST allow one retake per question and optional one-time +30s extension
- **FR-024**: System MUST support text-only input for guest users (no audio option)
- **FR-025**: System MUST store transcripts only; audio recordings MUST NOT be stored

#### Coaching & Feedback

- **FR-026**: System MUST provide end-of-session coaching feedback by default; users MAY opt into per-question coaching
- **FR-027**: System MUST use supportive coach tone (not cold/candid recruiter) in all feedback
- **FR-028**: System MUST generate narrative coaching, rubric tags (STAR elements scored 1-5), and example improved answers for each question
- **FR-029**: System MUST NOT invent facts, experiences, or details in example improved answers
- **FR-030**: System MUST provide honesty nudges when user answers contradict resume/JD, asking clarifying follow-ups and adding note to report
- **FR-031**: System MUST hide all numeric scores in Low-Anxiety Mode (narrative feedback only)

#### Coaching Reports

- **FR-032**: System MUST generate three-pane report with (1) Top 3 Strengths vs JD, (2) 3 Clarifications to add to resume/cover letter, (3) Per-question feedback
- **FR-033**: System MUST frame clarifications with encouraging tone (not penalizing)
- **FR-034**: System MUST provide downloadable PDF report including strengths, clarifications, per-question notes, and example answers
- **FR-035**: System MUST include STAR framework scoring (Situation/Task/Action/Result, 1-5 per element) in coaching feedback
- **FR-036**: System MUST tag answers for specificity, impact, and clarity

#### Job Matching & Digest

- **FR-037**: System MUST calculate match score (0-100) with weights: Hard skills 50%, Soft skills 20%, Seniority/Impact 20%, Logistics 10%
- **FR-038**: System MUST enforce must-have skills gate; if missing, job cannot match regardless of score
- **FR-039**: System MUST de-weight location in matching algorithm (remote-first approach)
- **FR-040**: System MUST curate job pool from daily incoming emails (ZipRecruiter, Indeed, Mac's List) plus Cinder roles using AI parsing
- **FR-041**: System MUST send daily job digest at 5:00 p.m. PT for registered users with double opt-in confirmation
- **FR-042**: System MUST provide one-click unsubscribe link in every digest email
- **FR-043**: System MUST include only jobs scoring ≥80% match in daily digest
- **FR-044**: System MUST send internal recruiting alert email when user achieves ≥80% match with any Cinder role
- **FR-045**: System MUST display CTA to request human review or book 15-min call ONLY when user meets strong performance threshold (avg STAR ≥4.2/5, ≥70% answers complete) AND/OR ≥80% Cinder-role match

#### Post-Session Survey & Sharing

- **FR-046**: System MUST display 3-item post-session survey with Likert scale (Like/Neutral/Dislike) on helpfulness, advice quality, and preparedness
- **FR-047**: System MUST add one open-ended question to survey when Low-Anxiety Mode was used: "Anything we should improve about Low-Anxiety Mode?"
- **FR-048**: System MUST provide shareable referral link on results screen with click tracking
- **FR-049**: System MUST store survey responses and aggregate tallies in admin dashboard

#### Security & Privacy

- **FR-050**: System MUST implement reCAPTCHA protection on forms
- **FR-051**: System MUST enforce per-IP and per-account rate limits
- **FR-052**: System MUST encrypt all data at rest (via Supabase)
- **FR-053**: System MUST allow one-click data deletion and export for all users
- **FR-054**: System MUST obtain opt-in consent before granting recruiter access to transcripts
- **FR-055**: System MUST allow users to revoke recruiter transcript access at any time

#### Admin & Analytics

- **FR-056**: System MUST track events in Supabase: session_start, mic_check_passed, q_answered, coaching_viewed, survey_submitted, share_link_clicked, digest_opt_in
- **FR-057**: System MUST display admin dashboard with session summaries, completion rates, survey tallies, referral clicks, and digest opt-ins
- **FR-058**: System MUST provide recruiter access to transcripts (not audio) for eligible users
- **FR-059**: System MUST maintain audit logs for all admin views and actions

#### Performance & Cost Controls

- **FR-060**: System MUST begin Text-to-Speech (TTS) within 700ms
- **FR-061**: System MUST deliver Automatic Speech Recognition (ASR) partials within 300ms and final transcript within 2s after stop
- **FR-062**: System MUST deliver per-question coaching within 3s
- **FR-063**: System MUST generate end-of-session report within 10s
- **FR-064**: System MUST enforce monthly cost cap of $300 for model/audio costs
- **FR-065**: System MUST gracefully degrade to text-only mode when approaching monthly cap, with inline user notification
- **FR-066**: System MUST automatically restore audio mode at next billing cycle after cost cap triggered
- **FR-067**: System MUST implement draft-save functionality for in-progress sessions
- **FR-068**: System MUST implement graceful retry logic for model/ASR failures

### Key Entities

- **User**: Represents a job seeker; attributes include email, authentication provider (Google/email), work authorization status, compensation range preference, remote preference, target roles, seniority level, location, created timestamp
- **Profile**: User's career details; attributes include target roles array, seniority level, location, resume metadata (filename, upload timestamp, file size)
- **Session**: A single practice session; attributes include user ID (nullable for guest), mode (audio/text), low-anxiety flag, start timestamp, completion timestamp, question count
- **Question**: A single interview question; attributes include session ID, question text, category (tailored/soft-skill), tailored flag, follow-up used flag
- **Answer**: User's response to a question; attributes include session ID, question ID, transcript text, duration in seconds, STAR scores (situation/task/action/result, each 1-5), rubric tags array (specificity/impact/clarity)
- **Report**: Coaching feedback summary; attributes include session ID, strengths array (top 3 vs JD), clarifications array (3 suggestions), PDF URL, generated timestamp
- **Job**: A job posting in the curated pool; attributes include source (Cinder/ZipRecruiter/Indeed/Mac's List), title, company, skills array, must-haves array, seniority level, location, posting URL, curated timestamp
- **Match**: User-job pairing with score; attributes include user ID, job ID, match score (0-100), reasons array (why matched), notified timestamp
- **Event**: Analytics event log; attributes include user ID (nullable), event type, payload JSON, created timestamp
- **Consent**: User agreement record; attributes include user ID, terms version accepted, privacy version accepted, acceptance timestamp

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Guest users can complete a text-only practice session with at least 3 questions and receive end-of-session feedback within 15 minutes of starting
- **SC-002**: Registered users can upload a resume and job description, complete an audio practice session with 8 questions, and download a PDF report within 30 minutes total
- **SC-003**: At least 70% of guest users who complete a session see the account creation nudge (measured by display event)
- **SC-004**: Users in Low-Anxiety Mode complete sessions with no numeric scores displayed and answer exactly 3 questions with gentler prompts
- **SC-005**: Users receive daily job digest emails at 5:00 p.m. PT ±5 minutes with at least one job listing scoring ≥80% match (when matches exist)
- **SC-006**: One-click unsubscribe removes users from job digest within 24 hours (no additional emails sent)
- **SC-007**: Users with ≥80% match to a Cinder role trigger internal recruiting alert email within 1 hour of session completion
- **SC-008**: Recruiter access to transcripts is granted only for users who opted in or meet performance thresholds (avg STAR ≥4.2, ≥70% answers complete)
- **SC-009**: Users can delete all their data (except legal audit logs) via one-click action, with confirmation completed within 5 seconds
- **SC-010**: File uploads under 3MB in accepted formats (PDF/DOCX/TXT/MD) pass virus scanning and processing within 10 seconds
- **SC-011**: System gracefully degrades to text-only mode with user notification when monthly cost approaches $300 cap, and automatically restores audio mode at next billing cycle
- **SC-012**: Audio mode performance meets targets: TTS begins ≤700ms, ASR partials ≤300ms, per-question coaching ≤3s, end report ≤10s
- **SC-013**: At least 60% of completed sessions result in submitted post-session surveys (helpfulness/advice/preparedness ratings)
- **SC-014**: Users who share referral links generate at least 10% click-through rate among recipients (measured via tracked share links)
- **SC-015**: Admin dashboard displays real-time session summaries, completion rates, survey tallies, and referral clicks with data updated within 1 minute of events occurring

---

## Assumptions

1. **Email Infrastructure**: Microsoft Graph API is already configured with SPF/DKIM for AI-Cindy@teamcinder.com domain; bounce/complaint handling routes to recruiting@teamcinder.com
2. **Job Curation**: Incoming job emails (ZipRecruiter, Indeed, Mac's List) arrive in a dedicated mailbox accessible via API for daily parsing; AI parsing accuracy is sufficient for MVP without human review
3. **OpenAI API Availability**: OpenAI services (GPT models, Whisper STT, TTS) maintain 99%+ uptime; API rate limits are sufficient for expected user volume (estimated 100-500 sessions/day in first month)
4. **Supabase Capacity**: Supabase free or pro tier can handle expected storage (resumes, transcripts, session data) and concurrent users without performance degradation
5. **User Device Capabilities**: Users have access to modern browsers (Chrome/Firefox/Safari/Edge from last 2 years) with microphone support for audio mode; fallback to text mode available for older browsers
6. **Accessibility Compliance**: WCAG 2.2 AA conformance can be achieved through Next.js accessibility best practices, semantic HTML, ARIA labels, and keyboard navigation without requiring specialized accessibility testing tools initially
7. **Virus Scanning**: ClamAV open-source antivirus provides sufficient malware detection for file uploads; false positive rate is acceptable (<1%)
8. **Legal Compliance**: Standard Terms of Service and Privacy Policy templates cover required disclosures for U.S. users 18+; no additional GDPR compliance needed for MVP (U.S.-only scope)
9. **Interview Question Database**: Sufficient repository of generic soft-skill questions exists (conflict, leadership, ownership, collaboration, failure/learning, communication) for guest mode and tailored question generation
10. **STAR Framework Application**: AI models can reliably identify and score STAR elements (Situation/Task/Action/Result) from user answers with reasonable accuracy (≥80% inter-rater reliability with human coaches)
11. **Performance Targets**: Performance targets (TTS ≤700ms, ASR ≤300ms, coaching ≤3s, report ≤10s) are achievable with OpenAI API latencies and optimized Next.js server-side rendering
12. **Cost Modeling**: $300/month budget cap is based on estimated costs of $0.50-$1.50 per audio session (Whisper STT + TTS + GPT-4 coaching) with expected 200-600 sessions/month; text-only sessions cost ~$0.10-$0.30 (GPT-4 only)

---

## Scope Boundaries

### In Scope (MVP)

- Guest mode text-only practice sessions with generic soft-skills
- Registered user accounts via Google Sign-In or email magic link
- Resume and JD uploads (PDF/DOCX/TXT/MD, max 3MB) with virus scanning
- Tailored question generation based on uploaded materials
- Audio recording with transcription (registered users) + text-only toggle
- Mic test and device selection
- Adaptive follow-ups (max 1 per question, disabled in Low-Anxiety Mode)
- Low-Anxiety Mode (3 questions, no scores, gentler prompts)
- End-of-session and optional per-question coaching feedback
- Three-pane coaching report (strengths, clarifications, per-question notes)
- Downloadable PDF reports
- STAR framework scoring (1-5 per element)
- Daily job digest email at 5:00 p.m. PT (double opt-in, ≥80% match threshold)
- Job matching algorithm (0-100 score with weighted criteria)
- Internal recruiting alerts for ≥80% Cinder role matches
- Post-session survey (3 Likert items + Low-Anxiety open-ended)
- Referral/share link with click tracking
- Admin dashboard (sessions, surveys, referrals, digest opt-ins, recruiter transcript access)
- Performance targets and cost controls (graceful degradation to text-only at $300 cap)
- Security (reCAPTCHA, rate limits, encryption at rest, audit logs)
- One-click data deletion/export
- WCAG 2.2 AA accessibility compliance

### Out of Scope (Post-MVP)

- Live video or avatar rendering
- Voice selection UI (branded voice options)
- LinkedIn resume import
- Code execution or auto-grading for technical questions
- Multi-language support
- ATS/CRM write-backs (email delivery only in MVP)
- On-demand human review button (CTA is performance/match-gated only)
- Employer-facing view for clients to invite candidates
- Expansion beyond U.S. users
- Additional role families beyond MVP set (Software Engineer, QA/Tester, Program Manager, DevOps, Hardware Engineer)
- Advanced analytics platforms (Google Analytics, PostHog)

---

## Dependencies

1. **External Services**:
   - OpenAI API (GPT models, Whisper STT, TTS)
   - Supabase (database, auth, storage, encryption at rest)
   - Microsoft Graph API (email delivery from AI-Cindy@teamcinder.com)
   - Google OAuth (for Google Sign-In)
   - reCAPTCHA (form protection)
   - ClamAV (virus scanning)

2. **Infrastructure**:
   - Vercel hosting for Next.js application
   - Domain configuration for teamcinder.com/coach or teamcinder.com/cindy
   - Email domain SPF/DKIM setup for AI-Cindy@teamcinder.com

3. **Content & Data**:
   - Interview question database (generic soft-skills for guest mode)
   - Job posting curation mailbox (ZipRecruiter, Indeed, Mac's List inbound emails)
   - Cinder internal job postings API or database access
   - Terms of Service and Privacy Policy legal documents

4. **Design Assets**:
   - Cindy persona branding (illustrated non-photoreal avatar)
   - WCAG 2.2 AA compliant UI components (accessible forms, buttons, navigation)

5. **Team Access**:
   - Recruiting team email distribution list for internal alerts
   - Admin user credentials for dashboard access and audit log reviews

---

## Open Questions

*None - all critical decisions have been documented in the PRD and formalized in this specification. If implementation reveals ambiguities, use `/speckit.clarify` to address them before planning.*
