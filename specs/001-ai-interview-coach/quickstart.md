# Quickstart: AI Interview Coach (Cindy from Cinder)

**Feature**: 001-ai-interview-coach
**Date**: 2025-10-26
**Purpose**: Developer onboarding guide for local development and testing

## Prerequisites

- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **Supabase CLI**: v1.200.0 or later (`npm install -g supabase`)
- **Docker**: For ClamAV virus scanning service (optional for local dev)
- **OpenAI API Key**: For LLM/STT/TTS features
- **Microsoft Graph API**: For email delivery (can be mocked locally)

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/teamcinder/candidate-helper.git
cd candidate-helper
git checkout 001-ai-interview-coach
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Microsoft Graph (or mock)
GRAPH_CLIENT_ID=<your client id>
GRAPH_CLIENT_SECRET=<your client secret>
GRAPH_TENANT_ID=<your tenant id>

# ClamAV (optional for local dev)
CLAMAV_URL=http://localhost:3310

# Cost Tracking
MONTHLY_COST_CAP_USD=300
COST_ALERT_THRESHOLD_USD=285

# Vercel Cron Secret (for local testing)
CRON_SECRET=your-local-secret

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your site key>
RECAPTCHA_SECRET_KEY=<your secret key>
```

### 3. Start Supabase Locally

```bash
supabase start
```

This will:
- Start PostgreSQL database on port 54322
- Start Supabase Studio on http://localhost:54323
- Run migrations from `supabase/migrations/`
- Seed database with question bank

### 4. Run Database Migrations

```bash
supabase db reset  # Reset to clean state with migrations + seed data
```

Verify tables exist:
```bash
supabase db diff --use-migra  # Check schema
```

### 5. Start Development Server

```bash
npm run dev
```

Application will be available at http://localhost:3000

## Key Journeys to Test

### Journey 1: Guest Practice Session (US1)

1. Navigate to http://localhost:3000
2. Click "Try Practice Session" (no sign-in)
3. Select text-only mode (default for guest)
4. Choose 8 questions (default)
5. Answer questions via text input
6. View end-of-session coaching feedback
7. See sign-up nudge

**Expected behavior**:
- No resume upload option for guests
- Generic soft-skill questions only
- Text-only input
- Narrative coaching + rubric tags + example answers
- No job digest option

### Journey 2: Registered User Tailored Practice (US2)

1. Click "Sign In" → Google Sign-In or email magic link
2. Complete eligibility confirmation (18+, U.S.-based)
3. Accept Terms & Privacy (plain-English summary)
4. Navigate to "Practice Session"
5. Upload resume (PDF, <3MB)
6. Paste job description or specify target role
7. Select 8 questions (6 tailored + 2 soft-skills)
8. Complete mic test and device selection
9. Record audio answer (3-minute cap)
10. Use retake or +30s extension if needed
11. View real-time captions during recording
12. Complete all questions
13. View comprehensive report
14. Download PDF

**Expected behavior**:
- Resume upload triggers virus scan (mocked locally if ClamAV not running)
- Tailored questions generated from resume/JD via OpenAI
- Audio mode with real-time transcription
- Per-question adaptive follow-ups (if STAR elements missing)
- Three-pane report: strengths, clarifications, per-question feedback
- PDF download button

### Journey 3: Low-Anxiety Mode (US5)

1. Sign in as registered user
2. Start new practice session
3. Enable "Low-Anxiety Mode" toggle
4. Observe question count forced to 3
5. Answer 3 questions
6. Complete session
7. View coaching report with no numeric scores
8. See open-ended survey question about Low-Anxiety experience

**Expected behavior**:
- Exactly 3 questions presented
- No adaptive follow-ups
- Gentler prompts and pacing
- Coaching report hides STAR scores (narrative only)
- Additional survey question

### Journey 4: Daily Job Digest (US4)

*Note: Requires cron simulation or manual API call*

1. Sign in as registered user with resume uploaded
2. Navigate to Settings → Job Digest
3. Opt into daily digest
4. Check email for double opt-in confirmation
5. Click confirmation link
6. Wait for 5:00 PM PT (or trigger manually):
   ```bash
   curl -X POST http://localhost:3000/api/cron/send-digests \
     -H "Authorization: Bearer your-local-secret"
   ```
7. Receive digest email with ≥80% matches

**Expected behavior**:
- Double opt-in confirmation email sent
- Daily digest at 5pm PT with curated jobs
- Jobs scored ≥80% included
- One-click unsubscribe link works
- If ≥80% Cinder match, internal alert sent to recruiting@teamcinder.com

## Testing

### Unit Tests

```bash
npm run test:unit
```

Tests located in `tests/unit/`:
- `scoring/star.test.ts`: STAR framework scoring logic
- `scoring/job-match.test.ts`: Job matching algorithm
- `security/pii-detection.test.ts`: SSN/DOB detection

### Integration Tests

```bash
npm run test:integration
```

Tests located in `tests/integration/`:
- `sessions.test.ts`: Full session flow (create → questions → answers → coaching)
- `coaching.test.ts`: Coaching generation with OpenAI mocking (MSW)
- `job-digest.test.ts`: Digest email flow with Microsoft Graph mocking

### End-to-End Tests

```bash
npm run test:e2e
```

Tests located in `tests/e2e/` (Playwright):
- `guest-session.spec.ts`: Guest text-only session (US1)
- `registered-session.spec.ts`: Registered audio session (US2)
- `low-anxiety.spec.ts`: Low-Anxiety Mode (US5)

**Run with UI**:
```bash
npx playwright test --ui
```

### Accessibility Testing

```bash
npm run test:a11y
```

Runs axe-core accessibility audits on key pages:
- Landing page
- Practice session setup
- Active session
- Coaching report

**Manual testing checklist**:
- [ ] Keyboard-only navigation (Tab, Enter, Space)
- [ ] Screen reader (NVDA/VoiceOver)
- [ ] 200% zoom (no horizontal scroll on desktop)
- [ ] Color contrast (WebAIM Contrast Checker)

## Database Management

### View Data in Supabase Studio

Navigate to http://localhost:54323

- **Table Editor**: View/edit records
- **SQL Editor**: Run queries
- **Auth**: View users
- **Storage**: View uploaded resumes

### Seed Additional Data

Add questions to `supabase/seed.sql`:

```sql
INSERT INTO question_bank (category, question_text, is_generic)
VALUES
  ('soft_skills_conflict', 'Tell me about a time you resolved a conflict with a teammate.', TRUE),
  ('soft_skills_leadership', 'Describe a situation where you had to lead a project under tight deadlines.', TRUE);
```

Reload seed data:
```bash
supabase db reset
```

### View Row Level Security Policies

```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

Test RLS as different users:
```sql
SET request.jwt.claims = '{"sub": "<user-uuid>", "role": "authenticated"}';
SELECT * FROM sessions;  -- Should only show user's sessions
```

## API Testing with OpenAPI

### View API Documentation

Import `specs/001-ai-interview-coach/contracts/rest-api.yaml` into:
- **Swagger Editor**: https://editor.swagger.io/
- **Postman**: Import → OpenAPI 3.0

### Test Endpoints with curl

**Create session (guest)**:
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "text",
    "questionCount": 8,
    "lowAnxietyEnabled": false
  }'
```

**Upload resume (requires auth)**:
```bash
curl -X POST http://localhost:3000/api/uploads/resume \
  -H "Authorization: Bearer <supabase-jwt-token>" \
  -F "file=@/path/to/resume.pdf"
```

**Get session details**:
```bash
curl http://localhost:3000/api/sessions/<session-id> \
  -H "Authorization: Bearer <supabase-jwt-token>"
```

## Cost Monitoring

### View Current Month Costs

Navigate to http://localhost:3000/admin/analytics (requires admin role)

Or query directly:
```sql
SELECT get_current_month_cost();
```

### Simulate Cost Cap

Set cost threshold to low value:
```sql
UPDATE system_config SET value = '5.00' WHERE key = 'monthly_cost_threshold_usd';
```

Trigger coaching generation to exceed cap:
```bash
curl -X POST http://localhost:3000/api/sessions/<session-id>/coaching \
  -H "Authorization: Bearer <supabase-jwt-token>"
```

Verify degradation:
- Audio mode routes should return 503
- Text mode routes should continue working
- Banner displayed to users

## Troubleshooting

### OpenAI API Errors

**Error**: `401 Unauthorized`
**Fix**: Check `OPENAI_API_KEY` in `.env.local`

**Error**: `429 Rate Limit Exceeded`
**Fix**: Add retry logic or wait before next request

### Supabase Connection Issues

**Error**: `Connection refused`
**Fix**: Ensure Supabase is running:
```bash
supabase status
```

If not running:
```bash
supabase start
```

### ClamAV Not Found (Resume Upload Fails)

**Workaround**: Disable virus scanning for local dev

In `lib/security/virus-scan.ts`:
```typescript
if (process.env.NODE_ENV === 'development' && !process.env.CLAMAV_URL) {
  console.warn('ClamAV disabled in development');
  return { clean: true };
}
```

### Audio Recording Not Working

**Error**: Microphone permission denied
**Fix**: Grant browser microphone access in settings

**Error**: WebM format not supported
**Fix**: Use Chrome/Firefox (Safari may require polyfill)

### Playwright Tests Failing

**Error**: `Target page, context or browser has been closed`
**Fix**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000,  // 10 seconds
}
```

## Development Workflow

### Feature Development

1. Create feature branch from `001-ai-interview-coach`
2. Make changes in `app/`, `components/`, `lib/`
3. Write unit tests in `tests/unit/`
4. Write integration tests in `tests/integration/`
5. Run all tests: `npm run test`
6. Check accessibility: `npm run test:a11y`
7. Commit with descriptive message
8. Open PR for review

### Database Schema Changes

1. Create migration:
   ```bash
   supabase migration new <migration-name>
   ```
2. Edit SQL in `supabase/migrations/<timestamp>_<migration-name>.sql`
3. Apply migration:
   ```bash
   supabase db reset
   ```
4. Update TypeScript types:
   ```bash
   npm run db:types
   ```

### Updating API Contracts

1. Edit `specs/001-ai-interview-coach/contracts/rest-api.yaml`
2. Validate OpenAPI spec:
   ```bash
   npx swagger-cli validate specs/001-ai-interview-coach/contracts/rest-api.yaml
   ```
3. Regenerate TypeScript types (if using code generation)
4. Update corresponding route handlers in `app/api/`

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test`)
- [ ] Accessibility audit passing (`npm run test:a11y`)
- [ ] Environment variables set in Vercel
- [ ] Supabase project created and connected
- [ ] OpenAI API key configured
- [ ] Microsoft Graph API credentials configured
- [ ] ClamAV service deployed (Railway/Render)
- [ ] Domain configured (teamcinder.com/coach)
- [ ] SPF/DKIM configured for AI-Cindy@teamcinder.com
- [ ] reCAPTCHA keys configured
- [ ] Vercel cron jobs configured (send-digests, curate-jobs)
- [ ] Cost tracking dashboard accessible to admins
- [ ] Terms of Service and Privacy Policy pages live
- [ ] WCAG 2.2 AA compliance validated

## Additional Resources

- **Spec**: `specs/001-ai-interview-coach/spec.md`
- **Data Model**: `specs/001-ai-interview-coach/data-model.md`
- **Research**: `specs/001-ai-interview-coach/research.md`
- **API Contracts**: `specs/001-ai-interview-coach/contracts/rest-api.yaml`
- **Constitution**: `.specify/memory/constitution.md`

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Team Slack**: #candidate-helper channel
- **Technical Docs**: See `docs/` directory (if exists)
- **PRD**: `cindy-comprehensive-prd.md`
