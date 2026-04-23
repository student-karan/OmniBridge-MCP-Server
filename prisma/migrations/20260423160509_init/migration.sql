-- CreateTable
CREATE TABLE "tool_interactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "toolName" TEXT NOT NULL,
    "targetOwner" TEXT,
    "targetRepo" BIGINT,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "discord_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "tool_interactions_toolName_idx" ON "tool_interactions"("toolName");

-- CreateIndex
CREATE UNIQUE INDEX "discord_messages_messageId_key" ON "discord_messages"("messageId");
