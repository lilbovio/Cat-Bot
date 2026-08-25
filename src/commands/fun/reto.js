const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

const RETOS = [
    'Habla con acento español exagerado durante los próximos 5 minutos.',
    'Escribe un poema de amor para el siguiente mensaje que mandes.',
    'Haz una frase usando todas las vocales sin repetirlas.',
    'Cuenta hasta 20 en otro idioma.',
    'Cambia tu apodo en el servidor por "Patata Suprema" durante 10 minutos.',
    'Escribe el abecedario al revés.',
    'Di tres cosas buenas de la persona que te hizo el reto.',
    'Escribe un chiste (bueno o malo, cuenta igual).',
    'Describe tu película favorita sin mencionar el título y deja que adivinen.',
    'Escribe un mensaje de texto como si fueras un robot.',
    'Usa solo mayúsculas en tu próximo mensaje.',
    'Inventa un superhéroe con el poder más inútil posible.',
    'Escribe una reseña de 5 estrellas para el agua.',
    'Escribe tu nombre con el codo (o describe el resultado).',
    'Canta el intro de tu serie favorita en texto.',
    'Convence al chat de que los pingüinos son la especie más peligrosa.',
    'Escribe un trabalenguas de tu propia invención.',
    'Describe un color sin mencionar su nombre.',
    'Escribe un mensaje de ruptura dramático para una pizza.',
    'Imita el estilo de escritura de un presentador de noticias durante 2 mensajes.',
];

module.exports = {
    name: 'reto',
    description: 'Recibe un reto aleatorio. ¿Eres capaz de cumplirlo?',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('reto')
        .setDescription('Recibe un reto aleatorio. ¿Eres capaz de cumplirlo?')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Reta a otro usuario (opcional).').setRequired(false)
        ),

    async execute(ctx) {
        const target = await ctx.getUser('usuario');
        const reto   = RETOS[Math.floor(Math.random() * RETOS.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎯 ¡Reto!')
            .setDescription(
                target
                    ? `<@${target.id}>, tu reto es:\n\n**${reto}**`
                    : `<@${ctx.user.id}>, tu reto es:\n\n**${reto}**`
            )
            .setColor('Orange')
            .setFooter({ text: '¿Te atreves? Pulsa 🔄 para otro reto.' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('reto_reroll')
                .setLabel('🔄 Otro reto')
                .setStyle(ButtonStyle.Primary),
        );

        const reply = await ctx.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = reply.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time: 60_000,
        });

        collector.on('collect', async (i) => {
            const nuevoReto = RETOS[Math.floor(Math.random() * RETOS.length)];
            await i.update({
                embeds: [
                    EmbedBuilder.from(embed)
                        .setDescription(
                            target
                                ? `<@${target.id}>, tu reto es:\n\n**${nuevoReto}**`
                                : `<@${ctx.user.id}>, tu reto es:\n\n**${nuevoReto}**`
                        )
                        .setTimestamp(),
                ],
                components: [row],
            });
        });

        collector.on('end', () => {
            reply.edit({ components: [] }).catch(() => {});
        });
    },
};
