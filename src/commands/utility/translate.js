const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'translate',
    description: 'Traduce texto usando LibreTranslate.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Traduce texto a otro idioma.')
        .addStringOption((o) => o.setName('texto').setDescription('Texto a traducir.').setRequired(true))
        .addStringOption((o) =>
            o.setName('idioma')
                .setDescription('Idioma destino (ej: en, es, fr, de, pt, ja)')
                .setRequired(true)
                .addChoices(
                    { name: 'Español (es)',  value: 'es' },
                    { name: 'Inglés (en)',   value: 'en' },
                    { name: 'Francés (fr)',  value: 'fr' },
                    { name: 'Alemán (de)',   value: 'de' },
                    { name: 'Portugués (pt)',value: 'pt' },
                    { name: 'Italiano (it)', value: 'it' },
                    { name: 'Japonés (ja)',  value: 'ja' },
                    { name: 'Chino (zh)',    value: 'zh' },
                    { name: 'Ruso (ru)',     value: 'ru' },
                    { name: 'Árabe (ar)',    value: 'ar' }
                )
        ),
    async execute(ctx) {
        const texto  = ctx.getString('texto');
        const target = ctx.getString('idioma');
        await ctx.defer();
        try {
            const res = await axios.post('https://libretranslate.com/translate', {
                q: texto, source: 'auto', target, format: 'text',
            }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
            await ctx.edit(`🌐 **Traducción (→ ${target}):**\n> ${res.data.translatedText}`);
        } catch {
            await ctx.edit('❌ No se pudo traducir en este momento. El servicio puede estar caído.');
        }
    },
};
