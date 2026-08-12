module.exports = {
    name: '8ball',
    description: 'Responde a tu pregunta con una respuesta aleatoria estilo bola mágica.',
    async execute(message, args) {
        const respuestas = [
            'Es cierto.',
            'Definitivamente sí.',
            'Sin duda.',
            'Claro que sí.',
            'Puedes confiar en ello.',
            'Desde mi punto de vista, sí.',
            'Probablemente.',
            'El panorama es bueno.',
            'Sí.',
            'Las señales apuntan a que sí.',
            'Respuesta confusa, intenta de nuevo.',
            'Pregunta más tarde.',
            'Mejor no decirte ahora.',
            'No se puede predecir ahora.',
            'Concéntrate y pregunta de nuevo.',
            'No cuentes con ello.',
            'Mi respuesta es no.',
            'Mis fuentes dicen que no.',
            'El panorama no es bueno.',
            'Muy dudoso.',
        ];

        if (!args.length) {
            return message.reply('¡Por favor, haz una pregunta!');
        }

        const pregunta = args.join(' ').trim();
        const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
        message.channel.send(`🎱 **Pregunta:** ${pregunta}\n**Respuesta:** ${respuestaAleatoria}`);
    },
};