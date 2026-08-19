const { SlashCommandBuilder } = require('discord.js');

const RESPUESTAS = [
    'Es cierto.', 'Definitivamente sí.', 'Sin duda.', 'Claro que sí.',
    'Puedes confiar en ello.', 'Desde mi punto de vista, sí.', 'Probablemente.',
    'El panorama es bueno.', 'Sí.', 'Las señales apuntan a que sí.',
    'Respuesta confusa, intenta de nuevo.', 'Pregunta más tarde.',
    'Mejor no decirte ahora.', 'No se puede predecir ahora.',
    'Concéntrate y pregunta de nuevo.', 'No cuentes con ello.',
    'Mi respuesta es no.', 'Mis fuentes dicen que no.',
    'El panorama no es bueno.', 'Muy dudoso.',
];

module.exports = {
    name: '8ball',
    description: 'Responde a tu pregunta con una respuesta aleatoria estilo bola mágica.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Responde a tu pregunta con una respuesta aleatoria estilo bola mágica.')
        .addStringOption((o) =>
            o.setName('pregunta').setDescription('¿Cuál es tu pregunta?').setRequired(true)
        ),
    async execute(ctx) {
        const pregunta = ctx.getString('pregunta');
        if (!pregunta) return ctx.reply('¡Por favor, haz una pregunta!');
        const respuesta = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)];
        await ctx.reply(`🎱 **Pregunta:** ${pregunta}\n**Respuesta:** ${respuesta}`);
    },
};
