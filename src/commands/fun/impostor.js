const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'impostor',
    description: 'Determina si alguien es el impostor.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('impostor')
        .setDescription('Determina si alguien es el impostor.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario a evaluar').setRequired(false)
        ),
    async execute(ctx) {
        const target = (await ctx.getUser('usuario')) || ctx.user;
        const isImpostor = Math.random() < 0.5;
        await ctx.reply(`${target} ${isImpostor ? '**es el impostor** 🔴' : '**no es el impostor** 🟢'} 🤖`);
    },
};
