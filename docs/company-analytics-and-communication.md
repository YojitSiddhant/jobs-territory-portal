# Company analytics and communication audit

## Analytics endpoint

`GET /api/company/analytics` requires an authenticated, approved company user. It returns the standard `{ data: { analytics } }` envelope with job totals by status, application totals by status, application counts per job, published jobs with counts, bounded recent applications, bounded recent job/status activity, and a conversion summary (`applications`, `shortlisted`, `hired`). Every query is scoped through `job.companyId`; recent collections are limited to 10 records.

The endpoint exposes only application/job identifiers, job titles/slugs, statuses, and timestamps. It does not return candidate profiles, resume keys, storage paths, or private company data.

## Communication feasibility

The existing schema was inspected for `Application`, `ApplicationStatusHistory`, `CandidateProfile`, `VerificationDocument`, `Job`, `Company`, and `User`. No model safely represents a conversation, message body, sender, assignment deadline, or an attachment reference. `ApplicationStatusHistory` must remain an immutable status audit trail; resume and verification storage references have different ownership and meaning.

Chat and assignments are therefore not implemented and no fake persistence or placeholder write endpoint is provided. A future schema would minimally need an application-scoped conversation/message model with sender, text, created/updated timestamps, optional assignment deadline/instructions, and an attachment metadata/reference model with ownership and access policy. It would also need private-storage authorization for those attachment references.
