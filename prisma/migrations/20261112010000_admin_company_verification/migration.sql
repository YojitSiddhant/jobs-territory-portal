-- Record restore actions distinctly and index review history by action.
ALTER TABLE `admin_review_records` MODIFY `decision` ENUM('APPROVED', 'REJECTED', 'SUSPENDED', 'RESTORED') NOT NULL;
CREATE INDEX `admin_review_records_decision_created_at_idx` ON `admin_review_records`(`decision`, `created_at`);
