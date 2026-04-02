import { prisma } from "./prisma.js";

export async function logInteraction(
  toolName: string,
  input: string,
  output: string,
  executorUserIdentifier: string,
  status: "success" | "error",
  targetOwner?: string,
  targetRepo?: number | bigint | null
) {
  await prisma.toolInteraction.create({
    data: {
      toolName,
      executorUserIdentifier,
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