const GuildConfig = require('../../models/GuildConfig');

/**
 * Sends a log embed to the guild's configured logsChannel.
 * Silently returns if no logsChannel is set or the channel isn't accessible.
 *
 * @param {import('discord.js').Client} client
 * @param {string} guildId
 * @param {import('discord.js').EmbedBuilder} embed
 */
async function guildLog(client, guildId, embed) {
    try {
        const cfg = await GuildConfig.findOne({ guildId });
        if (!cfg?.logsChannel) return;
        const channel = await client.channels.fetch(cfg.logsChannel).catch(() => null);
        if (channel?.isTextBased()) await channel.send({ embeds: [embed] });
    } catch {
        // Non-critical — swallow silently
    }
}

module.exports = { guildLog };
