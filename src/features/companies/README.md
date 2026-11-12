# Companies

Company registration, verification documents, approval state, and company management belong in this module.

Backend endpoints:

- `POST/GET/PATCH /api/company/profile` create, read, and update the authenticated company profile.
- Company documents are uploaded through `POST /api/company/profile/documents/upload` as multipart `file` and `type`; storage metadata is generated server-side.
- `POST /api/company/profile/submit` submits a complete profile with registration proof for later admin review.

All endpoints require a `COMPANY` session and scope data to the session owner. New and resubmitted profiles are `PENDING`. Approved and suspended profiles cannot be changed by company users. Future job endpoints must call `requireApprovedCompany()` before creating or publishing jobs.
