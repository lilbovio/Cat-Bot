const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'reverse',
    description: 'Invierte el texto dado.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('reverse')
        .setDescription('Invierte el texto dado.')
        .addStringOption((o) =>
            o.setName('texto').setDescription('El texto a invertir.').setRequired(true)
        ),
    async execute(ctx) {
        const texto = ctx.getString('texto');
        if (!texto) return ctx.reply({ content: '❌ Escribe un texto.', ephemeral: true });
        const invertido = [...texto].reverse().join('');
        await ctx.reply(`🔄 **Original:** ${texto}\n🔃 **Invertido:** ${invertido}`);
    },
};
