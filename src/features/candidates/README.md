# Candidates

Candidate profile, private photo/resume metadata, job search, applications, and application tracking belong in this module.

The current candidate profile API is `GET`/`PATCH /api/candidate/profile`. It requires a session whose server-side role is `CANDIDATE`; the route always scopes data to that session user.
