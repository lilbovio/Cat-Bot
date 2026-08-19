const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'wordcount',
    description: 'Cuenta palabras, caracteres y tiempo de lectura de un texto.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('wordcount')
        .setDescription('Cuenta palabras, caracteres y tiempo de lectura de un texto.')
        .addStringOption((o) =>
            o.setName('texto').setDescription('El texto a analizar.').setRequired(true)
        ),
    async execute(ctx) {
        const texto = ctx.getString('texto');
        if (!texto) return ctx.reply({ content: '❌ Escribe un texto.', ephemeral: true });

        const palabras   = texto.trim().split(/\s+/).filter(Boolean).length;
        const caracteres = texto.length;
        const sinEspacios = texto.replace(/\s/g, '').length;
        const oraciones  = texto.split(/[.!?]+/).filter((s) => s.trim()).length;
        // ~200 palabras por minuto
        const tiempoSeg  = Math.ceil((palabras / 200) * 60);
        const tiempoTexto = tiempoSeg < 60
            ? `${tiempoSeg} segundos`
            : `${Math.floor(tiempoSeg / 60)} min ${tiempoSeg % 60} seg`;

        await ctx.reply(
            `📊 **Análisis de texto:**\n` +
            `> 📝 Palabras: **${palabras}**\n` +
            `> 🔡 Caracteres (con espacios): **${caracteres}**\n` +
            `> 🔡 Caracteres (sin espacios): **${sinEspacios}**\n` +
            `> 📖 Oraciones: **${oraciones}**\n` +
            `> ⏱️ Tiempo de lectura: **${tiempoTexto}**`
        );
    },
};
