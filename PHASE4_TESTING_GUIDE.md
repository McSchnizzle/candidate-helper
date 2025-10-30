# Phase 4 Testing Guide - Registered User Practice Sessions

**Dev Server**: http://localhost:3000
**Current Status**: T081-T095 complete, T094 (sessions API) complete

---

## Testing Scenarios

### Scenario 1: Guest Session (Existing - Phase 3)

**Purpose**: Verify Phase 3 functionality still works

1. Open http://localhost:3000
2. Click "Start Free Practice"
3. Select "3 questions (~15 minutes)"
4. Toggle "Low-Anxiety Mode" ON
5. Click "Start Practice"
6. **Expected**: Session created with 3 generic behavioral questions, no scores shown
7. Answer a question with text
8. **Expected**: Text is saved, can proceed to next question
9. Complete session
10. **Expected**: Coaching feedback shown without numeric scores (Low-Anxiety Mode)

---

### Scenario 2: Register and Create Profile

**Purpose**: Test authentication and user onboarding

1. Open http://localhost:3000
2. Click "Log In"
3. Click "Sign up with Email" (or Google OAuth if configured)
4. Enter test email: `test-phase4-{random}@example.com`
5. **Expected**: Magic link sent (check terminal or email service)
6. Click magic link or paste token
7. **Expected**: Redirected to eligibility modal
8. Select eligibility: Age 18+, Location US
9. **Expected**: Consent modal appears with Terms & Privacy
10. Scroll and accept both
11. **Expected**: Redirected to `/dashboard` with empty session history

---

### Scenario 3: Upload Resume and Create Tailored Session

**Purpose**: Test resume upload, parsing, and tailored question generation

#### Part A: Upload Resume

1. From dashboard, click "Set Up Your Practice Session"
2. **Expected**: Authenticated user section visible with resume upload
3. Create a test resume file (resume.txt):

```
John Developer
Email: john@example.com
Phone: 555-1234
Location: San Francisco, CA

SKILLS
- JavaScript, TypeScript, React, Node.js
- AWS, Docker, PostgreSQL
- TDD, Agile methodologies

EXPERIENCE
Senior Software Engineer at TechCorp (2020-2025)
- Led API migration from monolith to microservices
- Mentored 3 junior developers
- Improved performance by 40%

EDUCATION
BS Computer Science, State University (2015)
```

4. Click file input and select resume.txt
5. **Expected**: Upload status shows "Uploading and parsing resume..."
6. **Wait 2-3 seconds**
7. **Expected**: Status updates to "✓ Resume parsed! Found X skills"
8. **Verify**: Checkbox "Generate tailored questions" becomes ENABLED

#### Part B: Add Job Description

1. Scroll to "Job Description" textarea
2. Paste sample job description:

```
Senior Software Engineer at DataCorp

We're looking for an experienced backend engineer to lead our infrastructure evolution.

Requirements:
- 5+ years backend development
- Expert in Node.js or Python
- Experience with PostgreSQL and Redis
- AWS or GCP cloud platform expertise
- Proven mentoring experience
- Strong communication skills

Responsibilities:
- Design scalable APIs
- Mentor junior engineers
- Optimize database performance
- Lead architectural decisions
```

3. **Expected**: Textarea accepts text, job description visible

#### Part C: Enable Tailored Questions

1. Check "Generate tailored questions" checkbox
2. Select "8 questions (~40 minutes)"
3. Toggle "Audio Mode" ON
4. **Expected**: Radio button allows selecting Audio or Text mode
5. Click "Start Practice"

#### Part D: Verify Tailored Questions Generated

1. **Wait 3-5 seconds** (OpenAI generation time)
2. **Expected**: Questions display with mix of:
   - Some questions mentioning "microservices", "Node.js", "mentoring", "performance optimization" (tailored)
   - Some generic questions about conflict handling, leadership, collaboration (generic behavioral)
3. **Inspect questions**: Look for "is_tailored: true" in some questions
4. Each question should have category: "technical", "behavioral", or "situational"

---

### Scenario 4: Test Fallback Scenarios

#### Test 4A: Session WITHOUT Job Description (Resume Only)

1. Start new session at http://localhost:3000/practice
2. Upload same resume as Scenario 3
3. **Skip** the job description (leave empty)
4. Check "Generate tailored questions"
5. Click "Start Practice"
6. **Expected**: Generic questions displayed (no JD = no tailoring possible)

#### Test 4B: Session WITHOUT Resume (Guest with Tailoring Attempt)

1. Log out (if needed)
2. Start new session
3. **Skip** resume upload
4. Paste job description
5. **Expected**: "Generate tailored questions" checkbox DISABLED (no resume)
6. Click "Start Practice"
7. **Expected**: Generic questions displayed

#### Test 4C: Low-Anxiety Mode with Tailored Questions

1. Start new session with resume and JD uploaded
2. Toggle "Low-Anxiety Mode" ON
3. **Expected**: Question count selector disappears, 3 questions selected automatically
4. Toggle "Generate tailored questions" ON
5. Click "Start Practice"
6. **Expected**:
   - 3 questions displayed (not 8)
   - Mix of tailored + generic (if OpenAI succeeded)
   - No numeric scores visible in interface

---

### Scenario 5: Text Mode vs Audio Mode

#### Test 5A: Text Mode with Tailored Questions

1. Start new session with resume and JD
2. Select "Text Mode" for response
3. Click "Start Practice"
4. **Expected**:
   - Text editor shown instead of microphone
   - Questions still tailored if JD provided
5. Answer question with text
6. Click "Next" or "Submit Answer"
7. **Expected**: Answer saved, move to next question

#### Test 5B: Audio Mode (Authenticated Users Only)

1. Start new session with resume and JD
2. Select "Audio Mode" for response
3. Click "Start Practice"
4. **Expected**:
   - Microphone recorder UI shown
   - "Start Recording" button visible
   - Question text displayed with "Speak your answer" prompt
5. **Note**: Full audio functionality (Whisper, TTS) not yet implemented (T096+)
6. **Expected**: Will show mock/placeholder for mic check (not fully functional yet)

---

## Checklist: What Should Work ✅

### Authentication & Profiles (T081-T085)

- [ ] Google OAuth login works
- [ ] Email magic link login works
- [ ] Eligibility modal appears for new users
- [ ] Consent modal shows Terms & Privacy with scrollable content
- [ ] User can accept consents and proceed
- [ ] Dashboard shows welcome message for authenticated users

### Resume Upload & Parsing (T088-T092)

- [ ] Resume file upload triggers parsing
- [ ] Parse status shows extracted skill count
- [ ] Resume parsing utility extracts skills, experience, education correctly
- [ ] "Generate tailored questions" checkbox enables/disables based on resume presence
- [ ] Job description textarea accepts multi-line text

### Tailored Question Generation (T095, T094)

- [ ] Questions API route compiles without errors
- [ ] When resume + JD provided, questions include mix of:
  - Questions mentioning specific technologies from resume
  - Questions mentioning job requirements from JD
  - Generic behavioral questions (standard soft-skills)
- [ ] Questions have proper structure: `{ text, category, isTailored, context? }`
- [ ] Low-Anxiety Mode limits questions to 3
- [ ] No JD or no resume → falls back to generic questions gracefully

### Error Handling

- [ ] Invalid resume file → shows error message
- [ ] Network error in resume upload → graceful error, allows retry
- [ ] OpenAI API failure → falls back to generic questions
- [ ] Resume download failure → falls back to generic questions

---

## How to Inspect Questions Returned

### Via Browser DevTools

1. Open http://localhost:3000/practice
2. Open DevTools (F12 → Network tab)
3. Upload resume and JD
4. Click "Start Practice"
5. Look for POST request to `/api/sessions/[id]/questions`
6. Click that request → Response tab
7. **Expected Response Structure**:

```json
{
  "questions": [
    {
      "id": "uuid",
      "text": "Tell me about a time when you led a technical initiative similar to the API migration mentioned in the job description...",
      "order": 1,
      "category": "technical",
      "isTailored": true
    },
    {
      "id": "uuid",
      "text": "Describe a situation where you handled conflict with a colleague...",
      "order": 2,
      "category": "behavioral",
      "isTailored": false
    }
    // ... more questions
  ]
}
```

### Via Terminal Logs

Watch the dev server logs for:

```
POST /api/sessions/[id]/questions 200 in Xms
```

If there's an error:

```
Error inserting tailored questions: { code: '23505', message: 'duplicate key...' }
```

---

## Expected Behavior Summary

| Scenario               | Resume | JD  | Result                                         |
| ---------------------- | ------ | --- | ---------------------------------------------- |
| Guest Session          | ❌     | ❌  | Generic questions only                         |
| Resume Only            | ✅     | ❌  | Generic questions (resume stored but not used) |
| JD Only                | ❌     | ✅  | Generic questions only                         |
| Resume + JD            | ✅     | ✅  | **75% tailored + 25% generic**                 |
| Low-Anxiety + Tailored | ✅     | ✅  | 3 questions (mix of tailored + generic)        |

---

## Known Limitations (Not Yet Implemented)

- ❌ Audio recording (T096-T099)
- ❌ Real-time captions from Whisper
- ❌ Mic test modal
- ❌ Adaptive follow-up questions
- ❌ PDF report generation for this phase

---

## Debugging Tips

If questions aren't being tailored:

1. **Check resume was actually uploaded**:
   - DevTools → Application → Supabase Storage
   - Should have entry in `resumes/` bucket

2. **Check job description was saved**:
   - DevTools → Network → POST /api/sessions
   - Look for `job_description_text` in request body

3. **Check OpenAI API**:
   - DevTools → Console → look for OpenAI errors
   - Check .env.local has valid `OPENAI_API_KEY`

4. **Check database**:
   - Supabase Studio → profiles table
   - Should show `resume_storage_path` for logged-in user

5. **Monitor cost tracking**:
   - Each OpenAI call inserts into `cost_tracking` table
   - Check monthly total vs $300 budget cap

---

## Success Criteria

**Phase 4 is working correctly if:**

1. ✅ Authenticated users can upload resumes
2. ✅ Job descriptions are captured during session setup
3. ✅ When both resume + JD present, questions include tailored content
4. ✅ Tailored questions mention specific skills/companies/requirements from documents
5. ✅ Fallback to generic questions works reliably
6. ✅ Low-Anxiety Mode works with tailored questions
7. ✅ No database constraint violations
8. ✅ Dev server logs show successful OpenAI calls with cost tracking

---

## Questions to Answer After Testing

1. **Are tailored questions appearing?** (Look for job/resume-specific content)
2. **Is the mix ratio correct?** (Should see mostly tailored, some generic)
3. **Do fallbacks work?** (Generic questions shown when tailoring unavailable)
4. **Is Low-Anxiety Mode limiting questions to 3?**
5. **Do generic questions appear consistently?** (Behavioral questions about conflict, leadership, etc.)
6. **Any errors in the dev server logs?**

---

**Test Date**: ******\_******
**Tester**: ******\_******
**Result**: ✅ PASS / ❌ NEEDS WORK
**Notes**: ********************************\_********************************
