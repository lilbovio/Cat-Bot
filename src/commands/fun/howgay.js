const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'howgay',
    description: 'Muestra qué tan gay es un usuario.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('howgay')
        .setDescription('Muestra qué tan gay es un usuario.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario a medir').setRequired(false)
        ),
    async execute(ctx) {
        const target = (await ctx.getUser('usuario')) || ctx.user;
        const percentage = Math.floor(Math.random() * 101);
        await ctx.reply(`${target} es **${percentage}% gay** 🏳️‍🌈`);
    },
};
