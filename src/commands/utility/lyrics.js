const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'lyrics',
    description: 'Busca la letra de una canción.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Busca la letra de una canción.')
        .addStringOption((o) => o.setName('cancion').setDescription('Nombre de la canción (ej: "Bohemian Rhapsody Queen").').setRequired(true)),
    async execute(ctx) {
        const query = ctx.getString('cancion');
        await ctx.defer();
        try {
            const res = await axios.get(
                `https://lyrist.vercel.app/api/${encodeURIComponent(query)}`,
                { timeout: 10000 }
            );
            const { title, artist, lyrics } = res.data;
            if (!lyrics) return ctx.edit(`❌ No se encontraron letras para **${query}**.`);

            // Discord tiene límite de 4096 chars en embed description
            const sliced = lyrics.length > 3800
                ? lyrics.slice(0, 3800) + '\n\n*[letra recortada por límite de Discord]*'
                : lyrics;

            const embed = new EmbedBuilder()
                .setTitle(`🎵 ${title}`)
                .setDescription(sliced)
                .setColor('Purple')
                .setFooter({ text: `Artista: ${artist}` });
            await ctx.edit({ embeds: [embed] });
        } catch {
            await ctx.edit('❌ No se encontraron letras para esa canción. Intenta con el nombre del artista también.');
        }
    },
};
