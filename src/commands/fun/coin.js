const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'coin',
    description: 'Lanza una moneda al aire.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Lanza una moneda al aire.'),
    async execute(ctx) {
        const result = Math.random() < 0.5 ? 'Cara' : 'Sello';
        await ctx.reply(`🪙 La moneda cayó en: **${result}**`);
    },
};
