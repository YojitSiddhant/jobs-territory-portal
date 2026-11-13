# Local demo data (development only)

`npm run db:seed:demo` fills the local database with a connected, fictional
dataset so every page has realistic content for UI testing.

**This is for local development only.** The script refuses to run when
`NODE_ENV=production`, never deletes or updates existing records, and only
creates accounts under the reserved `.test` domain `example.test`. Every name,
company, document, and phone number in the dataset is fictional.

## Running it

```bash
npm run db:seed:demo
```

The command loads `.env.local`, uses the existing Prisma client, password
hashing, and local private-storage driver, and is idempotent: running it again
finds every record by its deterministic demo key (email, slug, registration
number, or job slug) and creates nothing new. It is never run automatically.

## Demo credentials (local only — do not reuse anywhere)

All demo accounts share one local-only password: `Demo!Local12345`

| Role | Email |
| --- | --- |
| Admin | `admin.demo@example.test` |
| Candidates | `candidate01@example.test` … `candidate14@example.test` |
| Companies | `company01@example.test` … `company08@example.test` |

Company account ↔ company mapping:

| Account | Company | Verification state |
| --- | --- | --- |
| company01 | NovaByte Labs | APPROVED |
| company02 | BlueOrbit Technologies | APPROVED |
| company03 | PixelForge Studio | APPROVED |
| company04 | CloudNest Systems | APPROVED |
| company05 | CodeHarbor Solutions | PENDING |
| company06 | BrightStack Innovations | PENDING |
| company07 | DataSpring Analytics | REJECTED (with reason) |
| company08 | NextWave Digital | SUSPENDED (with reason) |

## What gets created

- 1 admin, 14 candidates (full and partial profiles, some with demo resumes
  and profile photos in local private storage), 8 company accounts.
- 44 jobs across all companies: 24 open published jobs (enough for two pages
  in public discovery), plus drafts, closed jobs, and published jobs whose
  deadlines have already passed. Only approved companies have published jobs;
  pending/rejected/suspended companies hold drafts only and never appear in
  public discovery.
- 60+ applications with full status histories covering APPLIED, REVIEWING,
  SHORTLISTED, REJECTED, and HIRED, spread over the last month so company
  analytics and recent-activity views have data.
- Verified field reviews, registration-certificate documents, document reviews,
  and admin audit records for approved companies; a pending queue, a rejected
  document review, and a suspension audit trail for the others.

## Limitations

- Demo resumes, profile photos, and registration certificates are minimal
  generated files written through the local private-storage driver
  (`STORAGE_LOCAL_DIR`, default `.private-storage`). If local storage is
  unavailable the script leaves those file references empty and reports it.
- No AI output is seeded. Match scores, cover-letter generation, and resume
  analysis always run through the real Groq integration against actual
  uploaded files.
- The script never deletes demo data. To reset, drop and re-migrate the local
  database, then re-run the seed.
