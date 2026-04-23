import { prisma } from "./prisma.js";

export async function logInteraction(
  toolName: string,
  input: string,
  output: string,
  status: "success" | "error",
  targetOwner?: string,
  targetRepo?: number | bigint | null
) {
  await prisma.toolInteraction.create({
    data: {
      toolName,
      targetOwner,
      targetRepo,
      input,
      output,
      status,
    },
  }).catch((err) => {
    console.error(`Failed to log interaction for ${toolName}:`, err);
  });
}

export async function getInteractionHistory(
  { toolName, limit, lastseenid }:
    { toolName: string, limit: number, lastseenid?: number }) {
  try {
    const interactionData = await prisma.toolInteraction.findMany({
      where: { toolName },
      ...(lastseenid !== undefined && {
        cursor: { id: lastseenid },
        skip: 1
      }),
      take: limit,
      orderBy: {
        id: "asc"
      }
    })
    const logs = interactionData.map(log => ({
      ...log,
      targetRepo: log.targetRepo?.toString() ?? null,
      executedAt: log.executedAt instanceof Date
        ? log.executedAt.toISOString()
        : String(log.executedAt),
    }));
    return logs;
  } catch (err) {
    console.error(`Failed to fetch interaction data for ${toolName}:`, err);
  }
}