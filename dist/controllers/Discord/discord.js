import discordClient from "../../lib/discord.js";
import { extractErrorMessage } from "../../utils/utility.js";
import { DiscordMessageResponseSchema } from "../../utils/types.js";
import { prisma } from "../../db/prisma.js";
import { TextChannel } from "discord.js";
/**
 * Function to send a message to a Discord channel and save it to the DB.
 * @param text The content of the message.
 */
export async function sendDiscordMessage(text) {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    try {
        // 1. Ensure the client is logged in
        if (!discordClient.token) {
            await discordClient.login(process.env.DISCORD_BOT_TOKEN);
        }
        // 2. Fetch the channel
        const channel = await discordClient.channels.fetch(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
            throw new Error("Could not find the specified text channel.");
        }
        // 3. Send the message
        const response = await channel.send(text);
        // 4. Save to our dedicated DiscordMessage relation for broadcast history
        await prisma.discordMessage.create({
            data: {
                messageId: response.id,
                channelId: channelId,
                text: response.content
            }
        });
        return DiscordMessageResponseSchema.parse({
            id: response.id,
            channelId: channelId,
            content: response.content
        });
    }
    catch (err) {
        let errorMsg = extractErrorMessage(err) || "An error occurred while sending the Discord message.";
        console.error("Discord Error:", errorMsg);
        throw err;
    }
}
/**
 * Function to fetch recently sent Discord messages from our database.
 * @param limit Number of messages to fetch.
 */
export async function listRecentDiscordMessages(limit = 10) {
    return await prisma.discordMessage.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' }
    });
}
