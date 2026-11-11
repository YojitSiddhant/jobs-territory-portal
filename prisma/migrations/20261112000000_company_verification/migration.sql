-- Add company registration and verification profile fields.
ALTER TABLE `companies`
    ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `industry` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `registration_number` VARCHAR(191) NULL,
    ADD COLUMN `verification_submitted_at` DATETIME(3) NULL;

CREATE UNIQUE INDEX `companies_registration_number_key` ON `companies`(`registration_number`);
