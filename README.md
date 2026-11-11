# Jobs Territory

Jobs Territory is a Next.js candidate job portal foundation for candidates, companies, and administrators. The initial setup establishes the full-stack boundaries without implementing the product workflows yet.

## Local setup

Requirements: Node.js 20+, npm, and a MySQL database.

```bash
npm install
cp .env.example .env.local
# Set DATABASE_URL and a long AUTH_SECRET in .env.local.
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

The app runs at <http://localhost:3000>. The starter health endpoint is available at `/api/health`.

## Commands

```bash
npm run dev       # development server
npm run lint      # ESLint
npm run typecheck # TypeScript without emitting files
npm run build     # production build
npx prisma studio # inspect local data
```

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
