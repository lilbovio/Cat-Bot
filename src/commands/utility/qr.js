const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'qr',
    description: 'Genera un código QR a partir de un texto o URL.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Genera un código QR a partir de un texto o URL.')
        .addStringOption((o) => o.setName('texto').setDescription('Texto o URL para el QR.').setRequired(true)),
    async execute(ctx) {
        const texto = ctx.getString('texto');
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(texto)}`;
        await ctx.reply({ content: `📱 **Código QR para:** \`${texto.slice(0, 100)}\``, files: [{ attachment: url, name: 'qr.png' }] });
    },
};
