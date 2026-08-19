const { SlashCommandBuilder } = require('discord.js');

const SEXUALITIES = ['Gay', 'Lesbiana', 'Femboy', 'Trans', 'Bisexual', 'Pansexual', 'Heterosexual'];

module.exports = {
    name: 'sexualidad',
    description: 'Muestra la sexualidad de alguien.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('sexualidad')
        .setDescription('Muestra la sexualidad de alguien.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario a evaluar').setRequired(false)
        ),
    async execute(ctx) {
        const target = (await ctx.getUser('usuario')) || ctx.user;
        const result = SEXUALITIES[Math.floor(Math.random() * SEXUALITIES.length)];
        await ctx.reply(`${target} es **${result}**.`);
    },
};
