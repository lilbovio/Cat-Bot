const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

const PREGUNTAS = [
    { q: '¿Cuántos planetas tiene el sistema solar?',       a: '8',         ops: ['6','7','8','9'] },
    { q: '¿En qué año llegó el hombre a la Luna?',         a: '1969',      ops: ['1965','1969','1972','1975'] },
    { q: '¿Cuál es el océano más grande del mundo?',       a: 'Pacífico',  ops: ['Atlántico','Índico','Ártico','Pacífico'] },
    { q: '¿Cuántos lados tiene un hexágono?',              a: '6',         ops: ['5','6','7','8'] },
    { q: '¿Cuál es el elemento químico con símbolo "O"?',  a: 'Oxígeno',   ops: ['Oro','Osmio','Oxígeno','Oganesón'] },
    { q: '¿Qué país tiene más habitantes en el mundo?',    a: 'India',     ops: ['China','India','EE.UU.','Brasil'] },
    { q: '¿Cuántos colores tiene el arcoíris?',            a: '7',         ops: ['5','6','7','8'] },
    { q: '¿Cuál es la capital de Japón?',                  a: 'Tokio',     ops: ['Osaka','Tokio','Kioto','Hiroshima'] },
    { q: '¿Quién escribió "Don Quijote de la Mancha"?',    a: 'Cervantes', ops: ['Lope de Vega','Cervantes','Quevedo','Calderón'] },
    { q: '¿Cuántos bytes tiene un kilobyte?',              a: '1024',      ops: ['512','1000','1024','2048'] },
    { q: '¿Cuál es el animal terrestre más rápido?',       a: 'Guepardo',  ops: ['León','Guepardo','Puma','Caballo'] },
    { q: '¿Cuál es el idioma más hablado del mundo?',      a: 'Inglés',    ops: ['Chino','Inglés','Español','Hindi'] },
    { q: '¿En qué continente está Egipto?',                a: 'África',    ops: ['Asia','Europa','África','Oriente Medio'] },
    { q: '¿Cuántos lados tiene un cubo?',                  a: '6',         ops: ['4','5','6','8'] },
    { q: '¿Qué planeta es el más grande del sistema solar?', a: 'Júpiter', ops: ['Saturno','Júpiter','Neptuno','Marte'] },
    { q: '¿Cuántos continentes hay en la Tierra?',         a: '7',         ops: ['5','6','7','8'] },
    { q: '¿Cuál es la velocidad de la luz (aprox.)?',      a: '300.000 km/s', ops: ['150.000 km/s','300.000 km/s','500.000 km/s','1.000.000 km/s'] },
    { q: '¿Qué gas es el más abundante en la atmósfera?',  a: 'Nitrógeno', ops: ['Oxígeno','Nitrógeno','CO₂','Argón'] },
];

const LABELS = ['🇦  A', '🇧  B', '🇨  C', '🇩  D'];

module.exports = {
    name: 'trivia',
    description: 'Trivia con botones — 4 opciones, 20 segundos.',
    category: 'fun',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Trivia con botones — 4 opciones, 20 segundos.'),

    async execute(ctx) {
        if (!ctx.isSlash) return ctx.reply('Usa `/trivia` como comando slash para ver los botones.');

        const item     = PREGUNTAS[Math.floor(Math.random() * PREGUNTAS.length)];
        const shuffled = [...item.ops].sort(() => Math.random() - 0.5);
        const correct  = shuffled.indexOf(item.a);

        const buildRow = (disabled = false, chosen = -1) =>
            new ActionRowBuilder().addComponents(
                shuffled.map((opt, i) => {
                    let style = ButtonStyle.Primary;
                    if (disabled) {
                        if (i === correct)      style = ButtonStyle.Success;
                        else if (i === chosen)  style = ButtonStyle.Danger;
                        else                    style = ButtonStyle.Secondary;
                    }
                    return new ButtonBuilder()
                        .setCustomId(`trivia_${i}`)
                        .setLabel(`${LABELS[i].split('  ')[1]}  ${opt}`.slice(0, 80))
                        .setStyle(style)
                        .setDisabled(disabled);
                })
            );

        const embed = new EmbedBuilder()
            .setTitle('🧠 Trivia')
            .setDescription(item.q)
            .setColor('Blue')
            .setFooter({ text: 'Tienes 20 segundos para responder' });

        const msg = await ctx.interaction.reply({
            embeds: [embed],
            components: [buildRow()],
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 20000,
        });

        collector.on('collect', async (i) => {
            const chosen = parseInt(i.customId.replace('trivia_', ''), 10);
            const correct_answer = shuffled[correct];
            const isCorrect = chosen === correct;

            const resultEmbed = new EmbedBuilder()
                .setTitle(isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto')
                .setDescription(`**${item.q}**\n\nRespuesta correcta: **${correct_answer}**`)
                .setColor(isCorrect ? 'Green' : 'Red')
                .setFooter({ text: `Respondido por ${i.user.username}` });

            await i.update({ embeds: [resultEmbed], components: [buildRow(true, chosen)] });
        });

        collector.on('end', (col, reason) => {
            if (reason === 'time') {
                const timeEmbed = new EmbedBuilder()
                    .setTitle('⏰ ¡Tiempo!')
                    .setDescription(`**${item.q}**\n\nLa respuesta era: **${item.a}**`)
                    .setColor('Yellow');
                msg.edit({ embeds: [timeEmbed], components: [buildRow(true)] }).catch(() => {});
            }
        });
    },
};
