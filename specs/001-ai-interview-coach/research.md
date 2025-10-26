# Research: AI Interview Coach (Cindy from Cinder)

**Feature**: 001-ai-interview-coach
**Date**: 2025-10-26
**Purpose**: Resolve technical unknowns and document architecture decisions

## Research Tasks

### 1. Contract Testing Library Selection

**Question**: Which contract testing library best fits Next.js API routes + Supabase?

**Options Evaluated**:

1. **Pact** (https://docs.pact.io/)
   - Industry standard for consumer-driven contract testing
   - Requires Pact Broker for sharing contracts
   - Overhead: separate service deployment

2. **OpenAPI + Prism** (https://stoplight.io/open-source/prism)
   - Generate OpenAPI spec from code or write manually
   - Use Prism mock server for contract validation
   - Fits well with REST API design-first approach

3. **MSW (Mock Service Worker)** (https://mswjs.io/)
   - Browser/Node interceptors for API mocking
   - TypeScript-first, lightweight
   - No separate broker needed
   - Good for frontend/backend integration tests

**Decision**: **MSW (Mock Service Worker) + OpenAPI validation**

**Rationale**:
- MSW provides runtime request/response interception for both Node (integration tests) and browser (component tests)
- TypeScript-native with excellent Next.js integration
- OpenAPI spec can still be generated for documentation (using tools like `next-rest-framework` or manual yaml)
- No additional infrastructure (Pact Broker) required for MVP
- Lightweight and fast test execution
- Supports both unit and integration testing workflows

**Alternatives Considered**:
- **Pact rejected**: Adds complexity with Broker deployment; overkill for monolithic Next.js app
- **Prism alone rejected**: Great for mocking but MSW provides better test ergonomics and TypeScript support

### 2. OpenAI Streaming Best Practices for Next.js

**Question**: How to achieve TTS ≤700ms and ASR ≤300ms latency targets with OpenAI APIs?

**Research Findings**:

**TTS (Text-to-Speech) Streaming**:
- Use OpenAI `tts-1` model (lower latency than `tts-1-hd`)
- Stream response chunks via Next.js Edge Runtime for <100ms cold starts
- Use `ReadableStream` API to pipe audio chunks directly to client
- Avoid buffering entire audio file server-side
- Target implementation:
  ```typescript
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova", // or branded voice
    input: questionText,
    response_format: "opus", // smallest file size for streaming
  });
  return new Response(response.body, {
    headers: { "Content-Type": "audio/opus" },
  });
  ```

**ASR (Automatic Speech Recognition) with Whisper**:
- Use OpenAI Whisper API with `whisper-1` model
- For real-time partials: use Web Audio API to capture audio chunks every 1-2 seconds
- Send chunks to API route for incremental transcription
- Final transcript: send complete audio blob after user stops recording
- Latency optimization:
  - Use Edge Function for `/api/answers/[id]/transcribe` route
  - Accept audio in `webm` format (native browser recording, smaller than WAV)
  - No server-side audio storage (stream directly to OpenAI)

**LLM Coaching Streaming**:
- Use `stream: true` parameter with `gpt-4-turbo` or `gpt-4o`
- Stream tokens via Server-Sent Events (SSE) to client
- Display coaching feedback incrementally (better perceived performance)
- Target 3s total response time = ~1s TTFB + 2s streaming

**Performance Strategy**:
- Edge Functions for all OpenAI API routes (Vercel Edge Runtime)
- Parallel requests where possible (e.g., TTS generation + STAR scoring)
- Client-side audio buffering for smooth playback during streaming
- Abort controllers for user cancellations (stop wasting tokens)

### 3. Cost Tracking and Graceful Degradation Architecture

**Question**: How to monitor OpenAI costs in real-time and trigger graceful degradation at $300 threshold?

**Architecture**:

**Cost Tracking**:
- Supabase table: `cost_tracking`
  ```sql
  CREATE TABLE cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start TIMESTAMPTZ NOT NULL, -- billing cycle start
    period_end TIMESTAMPTZ NOT NULL,   -- billing cycle end
    model VARCHAR(50) NOT NULL,        -- gpt-4, whisper-1, tts-1
    tokens_used INTEGER,               -- for LLM
    audio_seconds DECIMAL,             -- for STT/TTS
    estimated_cost DECIMAL(10,4),      -- in USD
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- After each OpenAI API call, insert row with usage from response headers (`x-openai-usage`)
- Aggregate current month costs via Supabase function:
  ```sql
  CREATE FUNCTION get_current_month_cost() RETURNS DECIMAL AS $$
    SELECT SUM(estimated_cost)
    FROM cost_tracking
    WHERE period_start >= date_trunc('month', CURRENT_DATE);
  $$ LANGUAGE SQL;
  ```

**Graceful Degradation Trigger**:
- Check cost before expensive operations (coaching, TTS)
- If `get_current_month_cost() >= 285` (95% of $300):
  - Set feature flag in `system_config` table: `audio_mode_enabled = FALSE`
  - Display banner to users: "Audio mode temporarily unavailable due to high demand. Text mode available."
  - Disable TTS/STT routes (return 503 with retry-after header)
  - Allow text-only sessions to continue

**Automatic Restoration**:
- Daily cron job at midnight (first of month):
  - Check if new billing period started
  - Reset `audio_mode_enabled = TRUE`
  - Clear degradation banner

**Admin Dashboard**:
- Real-time cost gauge showing $X / $300 with color coding:
  - Green: $0-$200
  - Yellow: $200-$285
  - Red: $285-$300 (degradation active)
- Breakdown by model (GPT-4 vs Whisper vs TTS)
- Projection: "At current rate, month will end at $X"

### 4. Resume Parsing and PII Detection

**Question**: How to extract structured data from PDF/DOCX/TXT/MD resumes and detect/strip SSN/DOB?

**Resume Parsing Strategy**:

**Option 1: OpenAI Structured Output** (CHOSEN)
- Use `gpt-4o` with structured output (JSON schema enforcement)
- Feed resume text to LLM with prompt:
  ```
  Extract: name, email, phone, location, skills (array), experience (array of {title, company, dates, description}), education
  ```
- Advantages: Handles varied formats, no training needed, high accuracy
- Cost: ~$0.02 per resume (well within budget)

**Option 2: Rule-based extraction + NER**
- Use libraries like `pdf-parse`, `mammoth` (DOCX), then regex + NLP
- More complex, brittle with format variations
- Rejected: Not worth engineering effort vs LLM cost

**PII Detection and Stripping**:
- **SSN Detection**: Regex patterns
  ```typescript
  const ssnPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g,       // 123-45-6789
    /\b\d{3}\s\d{2}\s\d{4}\b/g,     // 123 45 6789
    /\b\d{9}\b/g,                   // 123456789 (risky, may catch phone)
  ];
  ```
- **DOB Detection**: Regex + date validation
  ```typescript
  const dobPatterns = [
    /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}\b/g, // MM/DD/YYYY
    /\b\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b/g,   // YYYY-MM-DD
  ];
  // Validate: age between 16-100 to avoid false positives
  ```
- **Stripping**: Replace matches with `[REDACTED]` and flag in admin logs
- **Location Retention**: Keep city/state for ATS alignment (do not strip)

**File Format Handling**:
- **PDF**: `pdf-parse` library to extract text
- **DOCX**: `mammoth` library to convert to HTML then extract text
- **TXT/MD**: Read directly, no parsing needed
- **.pages**: Block upload, show error with conversion instructions

### 5. Supabase Row Level Security (RLS) Patterns

**Question**: How to enforce user isolation and recruiter access rules via RLS?

**RLS Policies**:

**Users Table**:
```sql
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Sessions Table**:
```sql
-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL); -- Allow guest sessions

-- Users can create sessions
CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all sessions (via service role key, bypass RLS)
```

**Answers Table**:
```sql
-- Users can view answers for their own sessions
CREATE POLICY "Users can view own answers"
  ON answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = answers.session_id
      AND (sessions.user_id = auth.uid() OR sessions.user_id IS NULL)
    )
  );

-- Recruiters can view transcripts if user opted in OR meets threshold
CREATE POLICY "Recruiters can view eligible transcripts"
  ON answers FOR SELECT
  USING (
    is_recruiter(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = answers.session_id
      AND (
        u.recruiter_access_granted = TRUE
        OR (s.avg_star_score >= 4.2 AND s.completion_rate >= 0.70)
      )
    )
  );

CREATE FUNCTION is_recruiter(user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1 AND role = 'recruiter'
  );
$$ LANGUAGE SQL;
```

**Consents Table**:
```sql
-- Users can view own consents
CREATE POLICY "Users can view own consents"
  ON consents FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert consents
CREATE POLICY "System can insert consents"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Audit Logs Table**:
```sql
-- Only admins can view audit logs (via service role, RLS bypass)
-- No user policies defined
```

### 6. Daily Job Digest Cron Architecture

**Question**: How to schedule daily job digest at 5:00 p.m. PT and ensure reliable delivery?

**Solution**: Vercel Cron Jobs + Supabase Edge Functions

**Vercel Cron Configuration** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/send-digests",
      "schedule": "0 17 * * *"  // 5:00 PM PT = 00:00 UTC (adjust for DST)
    },
    {
      "path": "/api/cron/curate-jobs",
      "schedule": "0 12 * * *"  // Noon PT daily job parsing
    }
  ]
}
```

**Digest Flow**:
1. Cron hits `/api/cron/send-digests` at 5pm PT
2. Query Supabase for users with `digest_opt_in = TRUE AND digest_confirmed = TRUE`
3. For each user:
   - Fetch latest resume
   - Query `jobs` table for roles added/updated in last 24h
   - Run match algorithm (hard skills 50%, soft skills 20%, seniority 20%, logistics 10%)
   - Filter jobs with score ≥80%
   - If matches found, render email template with job cards
   - Send via Microsoft Graph API
   - Insert `matches` row with `notified_at` timestamp
4. If Cinder role match ≥80%, send internal alert to recruiting@teamcinder.com

**Reliability**:
- Cron route protected by Vercel cron secret header: `Authorization: Bearer <CRON_SECRET>`
- Idempotency: Check `notified_at` to avoid duplicate sends on retry
- Error handling: Log failures to Supabase `email_failures` table for admin review
- Retry logic: Microsoft Graph SDK auto-retries transient failures

**Job Curation**:
- Cron hits `/api/cron/curate-jobs` at noon PT
- Fetch emails from dedicated mailbox via Microsoft Graph API
- Parse emails with OpenAI structured output:
  ```typescript
  const schema = z.object({
    title: z.string(),
    company: z.string(),
    skills: z.array(z.string()),
    mustHaves: z.array(z.string()),
    level: z.enum(['entry', 'mid', 'senior', 'lead']),
    location: z.string(),
    url: z.string().url(),
  });
  ```
- Insert parsed jobs into `jobs` table with `source` = 'ziprecruiter' | 'indeed' | 'macslist' | 'cinder'
- Deduplicate by URL

### 7. WCAG 2.2 AA Compliance Strategy

**Question**: How to ensure WCAG 2.2 AA compliance for MVP?

**Compliance Checklist**:

**Perceivable**:
- ✅ Text alternatives for images (alt text, ARIA labels)
- ✅ Captions for audio (real-time transcripts via Whisper)
- ✅ Adaptable layout (responsive, works at 200% zoom)
- ✅ Color contrast ≥4.5:1 for normal text, ≥3:1 for large text (TailwindCSS default palette)
- ✅ No information conveyed by color alone (icons + text labels)

**Operable**:
- ✅ Keyboard accessible (all interactive elements via Tab/Enter/Space)
- ✅ No keyboard traps (modals have focus management via Radix Dialog)
- ✅ Adjustable time limits (3-min audio cap with +30s extension option)
- ✅ Pause/stop animations (no auto-playing content)
- ✅ Skip links for screen readers ("Skip to main content")

**Understandable**:
- ✅ Page language declared (`<html lang="en">`)
- ✅ Consistent navigation (Navbar in all layouts)
- ✅ Input labels and error messages (React Hook Form + Zod)
- ✅ Focus indicators visible (TailwindCSS focus rings)

**Robust**:
- ✅ Valid HTML (semantic elements: `<main>`, `<nav>`, `<button>`, not `<div>` for clickables)
- ✅ ARIA roles and properties (Radix UI provides ARIA out of box)
- ✅ Status messages announced to screen readers (`role="status"` for coaching feedback)

**Testing Tools**:
- **Automated**: axe DevTools, Lighthouse accessibility audit (CI/CD)
- **Manual**: Keyboard-only navigation testing, NVDA (Windows) + VoiceOver (Mac) screen reader testing
- **Color contrast**: WebAIM Contrast Checker

**Known Limitations**:
- Audio recording requires microphone (no audio input fallback beyond text mode)
- TTS requires audio output (transcripts provided for deaf users)
- 200% zoom may require horizontal scrolling on small screens (acceptable per WCAG)

### 8. Virus Scanning with ClamAV

**Question**: How to integrate ClamAV for file upload scanning without blocking UX?

**Architecture**:

**Option 1: ClamAV Docker Sidecar on Vercel** (NOT SUPPORTED)
- Vercel serverless functions cannot run Docker containers
- Rejected

**Option 2: ClamAV as Separate Service** (CHOSEN)
- Run ClamAV daemon on separate server (e.g., Railway, Render, DigitalOcean)
- Next.js API route sends file to ClamAV HTTP endpoint
- ClamAV scans and returns result
- If clean, proceed with upload to Supabase Storage
- If infected, reject with error message

**Option 3: Client-side Hashing + Known Malware DB**
- Compare file hash against known malware database
- Fast but limited protection (only catches known malware)
- Rejected: Not comprehensive enough

**Implementation Plan** (Option 2):
1. Deploy ClamAV daemon on Railway (Docker container)
   ```dockerfile
   FROM clamav/clamav:latest
   EXPOSE 3310
   ```
2. Create HTTP wrapper service (Express.js) on same container:
   ```javascript
   app.post('/scan', upload.single('file'), (req, res) => {
     const scanResult = execSync(`clamscan ${req.file.path}`);
     if (scanResult.includes('OK')) {
       res.json({ clean: true });
     } else {
       res.json({ clean: false, threat: scanResult });
     }
   });
   ```
3. Next.js `/api/uploads/resume` route:
   - Receive file from client
   - Send to ClamAV service
   - If clean, upload to Supabase Storage
   - If infected, return 400 error

**Performance**:
- ClamAV scan time: ~500ms for 3MB file
- Total upload time: <1s network + 500ms scan + 500ms Supabase upload = ~2s (well under 10s target)

**Fallback**:
- If ClamAV service is down, log warning and allow upload (fail open for MVP)
- Add admin alert for manual review

## Research Summary

| Decision | Chosen Solution | Rationale |
|----------|----------------|-----------|
| Contract testing | MSW + OpenAPI | Lightweight, TypeScript-native, no broker needed |
| TTS latency | Edge Functions + streaming | Minimize cold starts, stream audio chunks |
| ASR latency | WebM chunks + Edge Functions | Native browser format, fast transcription |
| Cost tracking | Supabase table + monthly aggregation | Real-time monitoring, simple degradation trigger |
| Resume parsing | OpenAI structured output | High accuracy, handles format variations |
| PII detection | Regex + age validation | SSN/DOB patterns with false positive reduction |
| RLS policies | User isolation + recruiter conditionals | Secure by default, granular access control |
| Job digest cron | Vercel Cron + Microsoft Graph | Serverless, reliable, no infrastructure management |
| WCAG compliance | Radix UI + axe DevTools | Accessible primitives, automated + manual testing |
| Virus scanning | ClamAV on Railway + HTTP API | Comprehensive protection, acceptable latency |

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.
