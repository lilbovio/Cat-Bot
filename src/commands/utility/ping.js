const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Muestra el ping del bot.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra el ping del bot.'),
    async execute(ctx) {
        const sent = await ctx.reply({ content: '🏓 Midiendo...', fetchReply: true });
        const latency = (sent?.createdTimestamp ?? Date.now()) - ctx.createdTimestamp;
        const apiPing = ctx.client.ws.ping;
        await ctx.edit(`🏓 **Pong!**\n> Latencia: **${latency}ms**\n> API: **${apiPing}ms**`);
    },
};
