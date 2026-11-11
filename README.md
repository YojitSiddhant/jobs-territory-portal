# Jobs Territory

Jobs Territory is a Next.js candidate job portal foundation for candidates, companies, and administrators. The initial setup establishes the full-stack boundaries without implementing the product workflows yet.

## Local setup

Requirements: Node.js 20+, npm, and a MySQL database.

```bash
npm install
cp .env.example .env.local
# Set DATABASE_URL, AUTH_SECRET, and SESSION_TTL_DAYS in .env.local.
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The app runs at <http://localhost:3000>. The starter health endpoint is available at `/api/health`.

## Company verification API

Company profile and verification endpoints are restricted to the authenticated company owner. Registration creates a pending company shell during company account registration; the profile endpoint completes the required company details. A company remains `PENDING` until a later admin workflow approves it, and only `APPROVED` companies may use future job-management endpoints.

```text
POST  /api/company/profile
GET   /api/company/profile
PATCH /api/company/profile
POST  /api/company/profile/documents
POST  /api/company/profile/submit
```

`/documents` records metadata and an already-created private storage reference only. It does not upload or expose files. Document keys must belong to the current company’s private namespace. No admin approval endpoint is included in this phase.

## Commands

```bash
npm run dev       # development server
npm run lint      # ESLint
npm run typecheck # TypeScript without emitting files
npm run build     # production build
npm test          # focused auth unit tests
npx prisma studio # inspect local data
```

## Authentication API

Candidate and company registration are separate endpoints so roles are assigned by the server; registration input never accepts a role. Admin accounts are not publicly registered and must be provisioned through a controlled database/operations process, then can use the admin login endpoint.

```text
POST /api/auth/register/candidate  { email, password, fullName }
POST /api/auth/register/company    { email, password, companyName, contactEmail }
POST /api/auth/login               { email, password }
POST /api/auth/admin/login         { email, password }
POST /api/auth/logout
GET  /api/auth/me
```

Successful registration/login creates a server-side session and sets an HttpOnly, SameSite cookie. Only a SHA-256 hash of the random session token is stored in MySQL. Passwords are hashed with bcrypt and password hashes are never returned. Invalid credentials return `401`; duplicate emails return `409`; unauthenticated protected requests return `401` and role failures return `403`.

Use `requireAuthenticatedUser()` or `requireRole("CANDIDATE")`, `requireRole("COMPANY")`, or `requireRole("ADMIN")` from `src/server/auth/authorization.ts` inside future protected Route Handlers. Do not trust role values from request bodies.

## Candidate profile API

The candidate profile endpoint is private to the currently authenticated candidate; it does not accept a user ID and cannot be used by companies, admins, or another candidate to select someone else’s profile.

```text
GET   /api/candidate/profile
PATCH /api/candidate/profile
```

`PATCH` accepts personal details, `skills`, education entries, experience entries, and private `profilePhotoKey`/`resumeKey` references. The response includes `completionPercentage`. File objects themselves are not stored in MySQL or committed to the repository; only private storage keys are stored. Future upload handlers must use the private storage abstraction and must never place files under `public/`.

## Architecture

- `src/app` contains App Router pages and Route Handlers. Backend endpoints use `route.ts` files and the Web Request/Response APIs.
- `src/components` contains reusable UI components.
- `src/features/{candidates,companies,jobs,applications,admin}` keeps product modules separated by role and workflow.
- `src/server/db` contains the shared Prisma client; `prisma/schema.prisma` defines the MySQL relational model and migrations belong in `prisma/migrations`.
- `src/server/auth` contains the session and role-authorization boundary. The session implementation is deliberately a placeholder until an authentication strategy is selected and tested.
- `src/server/config` validates server-only environment variables with Zod.
- `src/server/http` contains consistent API error formatting.
- `src/server/storage` defines the private storage boundary for candidate resumes/photos and company verification documents. Uploaded objects must remain outside `public/`.
- `src/shared` contains validation schemas and shared API types.

## Data model decisions

The initial schema covers users and roles, candidate profiles, companies and approval status, private verification-document metadata, jobs, applications, and admin review records. A company must reach `APPROVED` before job-publishing logic should be enabled. Rejection reasons and suspension states are stored for review workflows. No production credentials, default admin password, fake verification data, or uploaded documents are included.

## Environment and privacy

`.env.local` is ignored by Git. Only placeholders belong in `.env.example`. Resumes, profile photos, and company verification files should be uploaded to private object storage and accessed through authorized, short-lived download URLs; they must never be served from `public/` or exposed by public job endpoints.
