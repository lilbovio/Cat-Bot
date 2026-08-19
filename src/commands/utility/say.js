const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Haz que el bot diga algo en el canal.',
    category: 'utility',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageMessages],
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Haz que el bot diga algo en el canal.')
        .addStringOption((o) =>
            o.setName('mensaje').setDescription('El mensaje que el bot enviará.').setRequired(true)
        ),
    async execute(ctx) {
        const text = ctx.getString('mensaje');
        if (!text) return ctx.reply({ content: 'Por favor, escribe un mensaje.', ephemeral: true });
        await ctx.deleteOriginal().catch(() => {});
        await ctx.send(text);
    },
};
