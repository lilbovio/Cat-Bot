const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'urban',
    description: 'Busca un término en Urban Dictionary.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription('Busca un término en Urban Dictionary.')
        .addStringOption((o) => o.setName('termino').setDescription('Término a buscar.').setRequired(true)),
    async execute(ctx) {
        const termino = ctx.getString('termino');
        await ctx.defer();
        try {
            const res = await axios.get(
                `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(termino)}`,
                { timeout: 8000 }
            );
            const entry = res.data.list?.[0];
            if (!entry) return ctx.edit(`❌ No se encontró definición para **${termino}**.`);

            const def = entry.definition.replace(/\[|\]/g, '').slice(0, 1000);
            const ex  = entry.example?.replace(/\[|\]/g, '').slice(0, 500) || 'Sin ejemplo.';

            const embed = new EmbedBuilder()
                .setTitle(`📖 ${entry.word}`)
                .setURL(entry.permalink)
                .setColor('Orange')
                .setDescription(def)
                .addFields({ name: 'Ejemplo', value: `*${ex}*` })
                .setFooter({ text: `👍 ${entry.thumbs_up}  👎 ${entry.thumbs_down}  ·  Urban Dictionary` });
            await ctx.edit({ embeds: [embed] });
        } catch {
            await ctx.edit('❌ No se pudo contactar con Urban Dictionary en este momento.');
        }
    },
};
