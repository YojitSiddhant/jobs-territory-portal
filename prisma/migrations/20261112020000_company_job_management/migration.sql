-- Add company job-management fields and published-job visibility index.
ALTER TABLE `jobs`
    ADD COLUMN `application_deadline` DATETIME(3) NULL,
    ADD COLUMN `experience_requirement` VARCHAR(191) NULL,
    ADD COLUMN `required_skills` JSON NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `workplace_type` ENUM('ONSITE', 'HYBRID', 'REMOTE') NULL;

CREATE UNIQUE INDEX `jobs_slug_key` ON `jobs`(`slug`);
CREATE INDEX `jobs_status_application_deadline_idx` ON `jobs`(`status`, `application_deadline`);
