-- CreateTable
CREATE TABLE `tool_interactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `toolName` VARCHAR(100) NOT NULL,
    `executorUserIdentifier` VARCHAR(100) NOT NULL,
    `targetOwner` VARCHAR(100) NULL,
    `targetRepo` VARCHAR(100) NULL,
    `input` VARCHAR(191) NOT NULL,
    `output` VARCHAR(191) NOT NULL,
    `status` ENUM('success', 'error') NOT NULL,
    `executedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tool_interactions_executorUserIdentifier_idx`(`executorUserIdentifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
