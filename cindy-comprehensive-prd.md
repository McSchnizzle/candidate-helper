# Cindy from Cinder — Comprehensive Product Requirements Document (PRD)

> **Note:** Per guidance, this PRD intentionally avoids schedules/timelines.

## 0) Product One‑Liner
**Cindy from Cinder** (“Cindy”) is a free AI interview and application coach on **teamcinder.com** that helps job seekers practice tailored interview questions, receive supportive coaching and concrete clarifications to strengthen resumes/cover letters, and (for registered users) get a daily email digest of highly relevant job postings. Initial promotion targets Portland users, but geo is not enforced.

---

## 1) Objectives

### 1.1 Business Objective (MVP)
- **Brand goodwill**: deliver a high‑quality, ethical, and accessible coaching experience that people recommend.
- Secondary: create a light, opt‑in funnel for recruiter awareness when a candidate is a strong match for an open **Cinder** role.

### 1.2 User Outcomes
- Feel more prepared and less anxious for interviews.
- Receive concrete, non‑fabricating coaching grounded in the candidate’s own resume/JD.
- Optionally receive targeted role matches by email (registered/opt‑in).

### 1.3 Signals of Success (Directional, not KPIs)
- Steady growth in **completed sessions/week**.
- **Sign‑ups from guest mode**.
- **Job‑digest opt‑ins** and **referral link** shares/clicks.

---

## 2) Audience & Eligibility

- **Primary user**: A job seeker (initially promoted within Portland) who is intimidated by behavioral/soft‑skill interviews and wants practice plus actionable feedback.
- **Eligibility (MVP)**: Users **18+** and **U.S.** users.
- **Personas**
  - *Nervous Nora* — entry/mid, wants low‑anxiety mode.
  - *Experienced Ethan* — mid/senior, wants tailored prompts.
- **Accessibility**: WCAG **2.2 AA**. Full transcripts/captions. **Text‑only fallback** everywhere.

---

## 3) Scope — MVP Features

### 3.1 Core Journeys
1) **Practice**
   - Inputs: **Resume** and optional **Job Description (JD)**; if no JD, capture **target role/industry**.
   - User chooses **3–10** questions (default **8** = **6 tailored** + **2 soft‑skills**).
   - **Audio answers** for logged‑in users (3‑minute cap/question; **one retake**; optional **+30s** once).  
     - Logged‑in users have a discreet **text‑only accessibility toggle**.
     - **Guest mode** is **text‑only**, generic soft‑skills, no uploads.
   - **Adaptive follow‑up** (max 1 per question) to probe missing STAR elements or vague claims (**off in Low‑Anxiety Mode**).
   - **Mic test** screen with device selector; transcripts/captions always available.

2) **Coaching**
   - Default timing: **end‑of‑session feedback**; user can opt‑in to per‑question coaching.
   - Coaching tone: **supportive coach** (not cold/candid recruiter).
   - For each question: **narrative coaching** + **rubric tags** + an **example improved answer** (never invent facts).
   - **Honesty nudges**: If answers contradict resume/JD, ask a clarifying follow‑up and add a note in the final report to “make the connection clear in your documentation.”
   - **Low‑Anxiety Mode**: 3 total questions; **no adaptive follow‑ups**; **no numeric scores**; gentler prompts and pacing.

3) **Reports**
   - **Pane 1: Top 3 strengths vs JD.**
   - **Pane 2: 3 clarifications to add** to resume or cover letter to help hiring teams understand fit (encouraging framing; not penalizing).
   - Downloadable **PDF** report (strengths, clarifications, per‑question notes, example answers).

4) **Jobs (Email Only)**
   - Registered users can **opt into** a daily digest at **5:00 p.m. PT** (double opt‑in; one‑click unsubscribe).
   - Pool includes **Cinder roles** + curated external roles (≥**80%** match threshold).
   - If a user is **≥80% match** for a **Cinder role**, send an **internal email** to the recruiting team distro.  
   - Recruiter CTA/human review offer to the candidate appears **only** when performance is high (see §7.3).

5) **Light Feedback Pulse**
   - 3 survey items (Like/Neutral/Dislike) on helpfulness, advice quality, and preparedness.
   - If Low‑Anxiety Mode was used, add one open‑ended question about that experience.
   - **Referral/share link** on results screen (tracked).

### 3.2 Role Families & Question Packs
- Role families (MVP): **Software Engineer, QA/Tester, Program Manager, DevOps, Hardware Engineer**.
- Soft‑skill themes: conflict, leadership, ownership, collaboration, failure/learning, communication.
- Technical/hard‑skill prompts: **qualitative** only in MVP (no code execution or auto‑grading).

### 3.3 Guest vs Account
- **Guest**: text‑only, generic soft‑skills, no uploads; nudged to sign in for full features.
- **Account**: Google Sign‑In or email magic link; uploads allowed; audio default with text toggle for accessibility.

### 3.4 Admin (Day‑1)
- Session summaries.
- Basic usage stats (sessions, completion rate).
- Survey tallies and referral clicks.
- Digest opt‑ins list.
- **Recruiter access to transcripts** (no audio storage) when user opted into contact or hits ≥80% Cinder‑role match.
- Admin audit logs.

### 3.5 Out of Scope (MVP)
- Live video/avatar; code execution/grading; LinkedIn import; ATS/CRM write‑backs (email only); multi‑language; voice‑selection UI; on‑demand human review button (CTA is gated by performance/match).

---

## 4) Functional Requirements

### 4.1 Onboarding, Auth & Consent
- **Guest** path: landing → practice (text‑only) → end feedback → sign‑up nudge.
- **Account** creation: **Google Sign‑In** or **email magic link**.
- **Consent gate**: plain‑English summary + full Terms/Privacy **before first upload** (and viewable at account creation).
- Eligibility gate: **18+**, **U.S.** users.

### 4.2 Uploads & Formats
- Accept **PDF, DOCX, TXT, MD**. Block **.pages** with help to export to PDF.
- Max file size: **3 MB**. All files are **virus‑scanned** (ClamAV).
- JD can be **pasted** or **uploaded**.

### 4.3 Resume Handling
- Retention: keep through session; for accounts, retain **one** current resume (replace on next upload).
- Keep **location PII** (for ATS alignment). Strip/flag **SSN** and **DOB** if present.

### 4.4 Question Generation
- Inputs: resume + optional JD (or target role/industry if no JD).
- User selects **3–10** questions (default 8: 6 tailored + 2 soft‑skills).
- **Adaptive follow‑up** up to 1 per question (disabled in Low‑Anxiety Mode).
- **Framework**: **STAR** (Situation/Task/Action/Result), 1–5 per element; tags for **specificity, impact, clarity**.

### 4.5 Answer Capture & Audio
- Logged‑in default is **audio** with **text‑only toggle** for accessibility.
- **3‑minute** cap per question; **one retake**; optional **+30s** extension.
- **Mic test** with device picker before starting; captions/transcripts always.
- **Guest** sessions are **text‑only** by design.

### 4.6 Coaching & Reports
- Default feedback timing: **end of session**; user may enable **per‑question** coaching.
- Coaching: supportive; narrative guidance; rubric tags; **example improved answer** (never invent new facts).
- Reports present **Top 3 strengths vs JD** and **3 clarifications to add** (resume/cover). Download as **PDF**.

### 4.7 Job Matching & Digest
- **Match score (0–100)** with weights: **Hard skills 50% • Soft skills 20% • Seniority/Impact 20% • Logistics 10%**; **must‑have skills** gate; **location de‑weighted**.
- **Curated pool**: AI agent auto‑parses incoming job emails (ZipRecruiter, Indeed, Mac’s List, plus Cinder roles) daily. Human review optional later.
- **Daily digest** at **5:00 p.m. PT** for registered, double‑opt‑in users; **one‑click unsubscribe**.
- **Recruiting alert**: email the recruiting team distro for **≥80% match** on a Cinder role.

### 4.8 Post‑Session Survey & Referral
- Show 3 quick Likert items; add an open‑ended item when Low‑Anxiety Mode was used.
- Provide a **share/referral link**; track clicks.

### 4.9 Admin
- Dashboard: session summaries, completions, survey tallies, referral clicks, digest opt‑ins.
- **Transcript access** to recruiters for eligible users (no audio stored).
- **Audit logs** for all admin views/actions.

---

## 5) Non‑Functional Requirements

### 5.1 Accessibility
- WCAG **2.2 AA** conformance.
- Full transcripts/captions; text‑only fallback everywhere.
- Low‑Anxiety Mode: gentler prompts; no scores; no adaptive follow‑ups.

### 5.2 Performance Targets (Audio Mode)
- **TTS** begins ≤ **700 ms**.
- **ASR** partials ≤ **300 ms**; final transcript ≤ **2 s** after stop.
- **Per‑question coaching** ≤ **3 s**.
- **End‑of‑session report** ≤ **10 s**.

### 5.3 Reliability & Limits
- Session limits: **10 questions / 30 minutes**; **2 sessions/day/user**.
- Graceful retry and inline status if model/ASR hiccups; draft‑save in progress.

### 5.4 Security
- **reCAPTCHA**, **per‑IP/account** rate limits, encryption at rest (Supabase), **virus scanning** for uploads.
- Eligibility gate: 18+; U.S.
- Admin access protected; **audit logs**.

### 5.5 Cost Control
- **Monthly spend cap:** **$300** for model/audio costs.
- When near cap: **degrade to text‑only** temporarily; restore automatically next cycle; inform users inline.

---

## 6) Data, Privacy & Consent

### 6.1 Storage Policy
- Store: **transcripts**, **scores**, **coaching**, and **JDs**.
- **Audio is not stored.**
- **Resume**: retained for session; for accounts, retain **one** current resume (replaced on next upload).
- Keep location PII; strip/flag SSN and DOB.

### 6.2 User Controls
- **One‑click delete/export** of user data.
- Clear consent upfront: **plain‑English** summary + full Terms/Privacy before first upload.
- Data use statement: user **owns** their content; **Cinder may use it to improve** the service.

### 6.3 Human‑in‑the‑Loop
- Recruiter access to transcripts is **opt‑in**, or when the candidate qualifies for outreach (≥80% Cinder match / strong performance). Users can revoke permission later.

---

## 7) Matching, Notifications & Recruiter Funnel

### 7.1 Matching
- Score 0–100 with weights defined in §4.7; **must‑have** skills gate.
- Sources curated daily from inbound emails (ZipRecruiter, Indeed, Mac’s List) plus Cinder roles.

### 7.2 Candidate Delivery
- **Email digest** only; **double opt‑in**; one‑click unsubscribe.
- Delivery time: daily at **5:00 p.m. PT**.

### 7.3 Recruiter Triggers
- **Strong performance** threshold (default): average **STAR ≥ 4.2/5**, **≥70%** answers “complete,” and/or **≥80%** Cinder‑role match.
- When triggered:
  - Internal email to recruiting team distro.
  - Candidate may see CTA to **request human review** or **book a 15‑min call** (only if clearly matched to an open Cinder role and/or performed strongly).

---

## 8) Analytics & Admin

### 8.1 Analytics (MVP)
- Use **Supabase logs/events only** (no GA/PostHog in MVP).
- Track events: `session_start`, `mic_check_passed`, `q_answered`, `coaching_viewed`, `survey_submitted`, `share_link_clicked`, `digest_opt_in`.

### 8.2 Admin
- See §3.4 and §4.9 for capabilities and audit logs.

---

## 9) Technology & Integrations

- **Frontend/Backend:** **Next.js** (Vercel).  
- **Database/Auth/Storage:** **Supabase** (encryption at rest).  
- **LLM/STT/TTS:** **OpenAI** (LLM + Whisper/TTS).  
- **Email:** **Microsoft Graph** sending from **AI-Cindy@teamcinder.com** (Reply‑To **recruiting@teamcinder.com**). SPF/DKIM configured; bounces/complaints to recruiting@teamcinder.com.  
- **Security:** **reCAPTCHA**, **ClamAV**, per‑IP/account rate limits.  
- **Curation:** Inbound mailbox parser for ZipRecruiter/Indeed/Mac’s List; daily AI parsing into jobs pool.

---

## 10) Data Model (MVP Sketch)

```text
users(id, email, auth_provider, work_auth, comp_range, remote_preference, created_at)
profiles(user_id, target_roles[], seniority, location, resume_meta)
sessions(id, user_id?, mode(audio|text), low_anxiety, started_at, completed_at, question_count)
questions(id, session_id, text, category, tailored, followup_used)
answers(id, session_id, question_id, transcript_text, duration_sec, score_star_s,t,a,r, tags[])
reports(id, session_id, strengths[], clarifications[], pdf_url)
jobs(id, source, title, company, skills[], must_haves[], level, location, url, curated_at)
matches(id, user_id, job_id, score, reasons[], notified_at)
events(id, user_id?, type, payload_json, created_at)
consents(id, user_id, terms_version, privacy_version, timestamp)
```

---

## 11) Acceptance Criteria (MVP)

- **AC‑1:** Guest completes a **text‑only** session (≥3 Qs) and sees an end report with narrative coaching.  
- **AC‑2:** Registered user uploads **PDF/DOCX** resume + pasted JD, completes **audio** session (transcripts saved); mic test and device selection work.  
- **AC‑3:** End report shows **Top 3 strengths** and **3 clarifications to add**; includes **example improved answers**; **PDF download** works.  
- **AC‑4:** **Low‑Anxiety Mode** shows no numeric scores, no adaptive follow‑ups, and includes gentler prompts.  
- **AC‑5:** **Survey (3 Qs)** appears; responses stored; an extra open‑ended item appears for Low‑Anxiety sessions.  
- **AC‑6:** Registered user can **double opt‑in** and receives the **daily digest** at 5:00 p.m. PT; **unsubscribe** works in one click.  
- **AC‑7:** When a user is **≥80% match** for a **Cinder role**, recruiting team receives an internal email; if the user is eligible, recruiters can **view transcripts** via admin.  
- **AC‑8:** **One‑click delete/export** removes/returns all user data (except legal logs).  
- **AC‑9:** Uploads ≤ **3 MB**; accepted formats enforced; **.pages** blocked with helper; all uploads **virus‑scanned**.  
- **AC‑10:** Cost controls: system gracefully **degrades to text‑only** when near the **$300/month** cap and resumes audio next cycle.

---

## 12) Open Questions (Non‑Blocking)
- Voice options UI: which branded voice(s) to expose and how to choose?
- Admin role granularity beyond day‑1 (e.g., separate analyst role).
- Expansion beyond U.S.; add role families; multi‑language timeline.
- Employer‑facing view for clients to invite candidates to use Cindy and share results (with consent).
- ATS/CRM write‑backs and lead auto‑creation (post‑MVP).

---

## 13) Branding & URLs
- Name/persona: **Cindy from Cinder** (she/her), friendly professional voice; **illustrated** avatar (non‑photoreal) for MVP.  
- Candidate‑facing URLs: **teamcinder.com/coach** and/or **teamcinder.com/cindy**.  
- Email sender: **AI-Cindy@teamcinder.com**; Reply‑To **recruiting@teamcinder.com**.

---

## 14) Appendix: Example Survey Questions (MVP)
- “Did this session help you prepare for your interview?” (Like / Neutral / Dislike)
- “Was the advice useful and actionable?” (Like / Neutral / Dislike)
- “Do you feel more confident about your prep for this job?” (Like / Neutral / Dislike)
- (Low‑Anxiety sessions) “Anything we should improve about Low‑Anxiety Mode?” (open‑ended)
