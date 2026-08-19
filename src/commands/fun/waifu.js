const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'waifu',
    description: 'Muestra una waifu al azar (solo canales NSFW).',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('waifu')
        .setDescription('Muestra una waifu al azar (solo canales NSFW).')
        .setNSFW(true),
    async execute(ctx) {
        if (!ctx.channel.nsfw) {
            return ctx.reply({ content: 'Este comando solo puede usarse en canales con permisos NSFW.', ephemeral: true });
        }
        await ctx.defer();
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/waifu');
            await ctx.edit({ files: [{ attachment: response.data.url, name: 'waifu.jpg' }] });
        } catch {
            await ctx.edit('No se pudo obtener una waifu en este momento. Inténtalo más tarde.');
        }
    },
};
