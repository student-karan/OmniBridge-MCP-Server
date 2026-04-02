/*
  Warnings:

  - You are about to alter the column `targetRepo` on the `tool_interactions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE `tool_interactions` MODIFY `targetRepo` BIGINT NULL;
