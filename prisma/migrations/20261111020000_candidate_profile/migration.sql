-- Add candidate profile skills and structured education/experience records.
ALTER TABLE `candidate_profiles` ADD COLUMN `skills` JSON NULL;

CREATE TABLE `candidate_education` (
    `id` VARCHAR(191) NOT NULL,
    `profile_id` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `field_of_study` VARCHAR(191) NULL,
    `start_year` INTEGER NULL,
    `end_year` INTEGER NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `candidate_education_profile_id_idx`(`profile_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `candidate_experience` (
    `id` VARCHAR(191) NOT NULL,
    `profile_id` VARCHAR(191) NOT NULL,
    `employer` VARCHAR(191) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `candidate_experience_profile_id_start_date_idx`(`profile_id`, `start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `candidate_education` ADD CONSTRAINT `candidate_education_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `candidate_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `candidate_experience` ADD CONSTRAINT `candidate_experience_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `candidate_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
