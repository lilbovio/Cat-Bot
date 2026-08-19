const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    name: 'invite',
    description: 'Proporciona el enlace para invitar el bot a tu servidor.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Proporciona el enlace para invitar el bot a tu servidor.'),
    async execute(ctx) {
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands`;
        await ctx.reply({ content: `🔗 Invítame a tu servidor:\n${inviteLink}`, ephemeral: true });
    },
};
