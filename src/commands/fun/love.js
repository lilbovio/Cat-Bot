const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'love',
    description: 'Muestra cuánto se aman dos usuarios.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription('Muestra cuánto se aman dos usuarios.')
        .addUserOption((o) =>
            o.setName('usuario1').setDescription('Primer usuario').setRequired(true)
        )
        .addUserOption((o) =>
            o.setName('usuario2').setDescription('Segundo usuario').setRequired(true)
        ),
    async execute(ctx) {
        const user1 = await ctx.getUser('usuario1');
        const user2 = await ctx.getUser('usuario2');
        if (!user1 || !user2) return ctx.reply('Por favor, menciona a dos usuarios.');
        const percentage = Math.floor(Math.random() * 101);
        await ctx.reply(`${user1} y ${user2} tienen un **${percentage}%** de compatibilidad ❤️`);
    },
};
