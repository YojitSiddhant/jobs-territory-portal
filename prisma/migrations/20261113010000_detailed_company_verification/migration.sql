ALTER TABLE `verification_documents`
  MODIFY `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

CREATE TABLE `company_verification_item_reviews` (
  `id` VARCHAR(191) NOT NULL,
  `company_id` VARCHAR(191) NOT NULL,
  `document_id` VARCHAR(191) NULL,
  `field` ENUM('NAME', 'REGISTRATION_NUMBER', 'WEBSITE', 'CONTACT_EMAIL', 'PHONE', 'ADDRESS', 'INDUSTRY', 'DESCRIPTION') NULL,
  `decision` ENUM('VERIFIED', 'REJECTED') NOT NULL,
  `reason` TEXT NULL,
  `reviewer_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `cv_item_reviews_company_field_created_idx`(`company_id`, `field`, `created_at`),
  INDEX `cv_item_reviews_document_created_idx`(`document_id`, `created_at`),
  INDEX `cv_item_reviews_reviewer_created_idx`(`reviewer_id`, `created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `company_verification_item_reviews_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_verification_item_reviews_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `verification_documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_verification_item_reviews_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
