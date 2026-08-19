const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const SUBREDDITS = ['memes', 'dankmemes', 'me_irl', 'AdviceAnimals'];

module.exports = {
    name: 'meme',
    description: 'Muestra un meme aleatorio de Reddit.',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Muestra un meme aleatorio de Reddit.'),
    async execute(ctx) {
        await ctx.defer();
        const sub = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
        try {
            const res = await axios.get(
                `https://www.reddit.com/r/${sub}/random.json?limit=1`,
                { headers: { 'User-Agent': 'CatBot/1.0' }, timeout: 8000 }
            );
            // Reddit devuelve un array cuando es /random
            const post = Array.isArray(res.data) ? res.data[0].data.children[0].data : null;
            if (!post || post.over_18 || !post.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
                return ctx.edit('😅 No se encontró un meme adecuado en este momento. Intenta de nuevo.');
            }
            const embed = new EmbedBuilder()
                .setTitle(post.title.slice(0, 256))
                .setImage(post.url)
                .setColor('Orange')
                .setFooter({ text: `👍 ${post.ups.toLocaleString()}  |  r/${sub}` })
                .setURL(`https://reddit.com${post.permalink}`);
            await ctx.edit({ embeds: [embed] });
        } catch {
            await ctx.edit('❌ No se pudo obtener un meme en este momento. Intenta de nuevo más tarde.');
        }
    },
};
