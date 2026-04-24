import { prisma } from "./prisma.js";
export async function logInteraction(toolName, input, output, status, targetOwner, targetRepo) {
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
export async function getInteractionHistory({ toolName, limit, lastseenid }) {
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
        });
        const logs = interactionData.map(log => ({
            ...log,
            targetRepo: log.targetRepo?.toString() ?? null,
            executedAt: log.executedAt instanceof Date
                ? log.executedAt.toISOString()
                : String(log.executedAt),
        }));
        return logs;
    }
    catch (err) {
        console.error(`Failed to fetch interaction data for ${toolName}:`, err);
    }
}
