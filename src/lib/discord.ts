import "dotenv/config";
import { Client, GatewayIntentBits } from 'discord.js';

(() => {
    const requiredEnvVars = ['DISCORD_BOT_TOKEN', 'DISCORD_CHANNEL_ID'];
    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error("Missing Environment variables " + missing.join(" , "));
    }
})();

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Exporting the client to be used in controllers
export default discordClient;
