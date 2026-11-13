# AI feature architecture

## Plan and boundaries

AI results are generated on demand and are not persisted. The current schema has no safe model for derived resume analyses, recommendations, match reports, or editable cover-letter drafts; adding unrelated fields to `CandidateProfile`, `Job`, or `Application` would mix source data with generated data. No Prisma model or migration was added.

All AI routes require a candidate session and call the provider only from the server. Resume bytes are read through the existing private storage adapter using the authenticated candidate's own `resumeKey`. Storage keys, filesystem paths, emails, passwords, tokens, and raw documents are never returned to the browser or written to logs.

## Routes

- `POST /api/candidate/ai/resume-analysis` — structured summary, skills, education, experience, strengths, missing information, and suggestions.
- `GET /api/candidate/ai/recommendations` — AI-ranked published, non-expired jobs from approved companies, with bounded match metadata.
- `POST /api/candidate/ai/match` with `{ jobId }` — informational 0–100 resume/profile-to-job comparison.
- `POST /api/candidate/ai/cover-letter` with `{ jobId }` — validated editable cover-letter text. It never submits an application.

The provider-neutral `AiProvider` interface selects the Gemini or Groq adapter through `AI_PROVIDER`. Responses are JSON-parsed and validated with Zod. Requests have a timeout and an in-process per-user rate limit. Missing keys return `AI_NOT_CONFIGURED` with HTTP 503; no fake response is generated.

## Environment

Set server-only values in `.env.local`:

```text
GEMINI_API_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
AI_PROVIDER=gemini
```

To connect Groq, set `AI_PROVIDER=groq` and provide `GROQ_API_KEY`. `GROQ_MODEL` is optional and defaults to the supported production model `llama-3.3-70b-versatile`; update it when Groq changes its model catalog. To connect Gemini, set `AI_PROVIDER=gemini` and provide `GEMINI_API_KEY`. These variables must never use a `NEXT_PUBLIC_` prefix.
