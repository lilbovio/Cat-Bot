const { SlashCommandBuilder } = require('discord.js');

const FORTUNAS = [
    'Un camino largo te espera, pero el destino vale la pena.',
    'La persistencia rompe la resistencia.',
    'Hoy es un buen día para empezar algo nuevo.',
    'Tu mayor fortaleza está oculta donde menos te lo esperas.',
    'La paciencia es la madre de todas las ciencias.',
    'El éxito llega cuando la oportunidad se encuentra con la preparación.',
    'Recuerda: no hay mal que por bien no venga.',
    'Una sonrisa puede abrir puertas que ni una llave puede.',
    'El verdadero tesoro está en las relaciones que cultivas.',
    'Los errores son el precio de entrada a la experiencia.',
    'Tu próxima gran idea llegará en el momento menos esperado.',
    'La generosidad siempre regresa disfrazada.',
    'Hoy alguien piensa en ti con cariño.',
    'El conocimiento es la única riqueza que nadie puede quitarte.',
    'Confía en tu instinto: rara vez se equivoca.',
    'La suerte favorece a los valientes.',
    'Un pequeño paso hoy puede ser un gran salto mañana.',
    'Las mejores historias comienzan con "no tenía plan".',
    'Ser amable no cuesta nada y vale mucho.',
    'La oscuridad más profunda siempre antecede al amanecer.',
    'Tu tiempo es tu activo más valioso: inviértelo bien.',
    'Pronto llegará una noticia que te alegrará el día.',
    'El universo conspira a tu favor cuando actúas con honestidad.',
    'La creatividad es inteligencia divirtiéndose.',
    'No todo el que vaga está perdido.',
    'La mejor venganza es una vida exitosa.',
    'Un abrazo de alguien especial te espera esta semana.',
    'Las grandes cosas nunca vienen de las zonas de confort.',
    'Hoy es un buen día para decir "te quiero".',
    'La aventura que buscas está a un "sí" de distancia.',
];

module.exports = {
    name: 'fortune',
    description: 'Abre una galleta de la suerte virtual.',
    category: 'fun',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('fortune')
        .setDescription('Abre una galleta de la suerte virtual.'),
    async execute(ctx) {
        const fortuna = FORTUNAS[Math.floor(Math.random() * FORTUNAS.length)];
        await ctx.reply(`🥠 **Galleta de la suerte de ${ctx.user.username}:**\n> *${fortuna}*`);
    },
};
