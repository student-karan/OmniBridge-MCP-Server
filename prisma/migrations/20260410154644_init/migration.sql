/*
  Warnings:

  - You are about to drop the column `executorUserIdentifier` on the `tool_interactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `tool_interactions_executorUserIdentifier_idx` ON `tool_interactions`;

-- AlterTable
ALTER TABLE `tool_interactions` DROP COLUMN `executorUserIdentifier`;

-- CreateIndex
CREATE INDEX `tool_interactions_toolName_idx` ON `tool_interactions`(`toolName`);
