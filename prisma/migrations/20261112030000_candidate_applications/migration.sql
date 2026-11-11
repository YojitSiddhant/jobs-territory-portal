ALTER TABLE `applications`
  ADD COLUMN `resume_key` VARCHAR(191) NULL,
  MODIFY `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN') NOT NULL DEFAULT 'APPLIED';

UPDATE `applications` SET `status` = 'APPLIED' WHERE `status` = 'SUBMITTED';
UPDATE `applications` SET `status` = 'REVIEWING' WHERE `status` = 'UNDER_REVIEW';

ALTER TABLE `applications`
  MODIFY `status` ENUM('APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN') NOT NULL DEFAULT 'APPLIED';

CREATE INDEX `applications_job_id_status_idx` ON `applications`(`job_id`, `status`);

CREATE TABLE `application_status_history` (
  `id` VARCHAR(191) NOT NULL,
  `application_id` VARCHAR(191) NOT NULL,
  `status` ENUM('APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN') NOT NULL,
  `actor_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `application_status_history_application_id_created_at_idx` (`application_id`, `created_at`),
  INDEX `application_status_history_actor_id_created_at_idx` (`actor_id`, `created_at`),
  CONSTRAINT `application_status_history_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `application_status_history_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
