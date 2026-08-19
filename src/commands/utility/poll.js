const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

const VOTE_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
const COLORS       = [ButtonStyle.Primary, ButtonStyle.Success, ButtonStyle.Danger, ButtonStyle.Secondary];

module.exports = {
    name: 'poll',
    description: 'Crea una encuesta con botones y contador de votos en vivo.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Crea una encuesta con botones y contador de votos en vivo.')
        .addStringOption((o) => o.setName('pregunta').setDescription('Pregunta de la encuesta.').setRequired(true))
        .addStringOption((o) => o.setName('opcion1').setDescription('Primera opción.').setRequired(true))
        .addStringOption((o) => o.setName('opcion2').setDescription('Segunda opción.').setRequired(true))
        .addStringOption((o) => o.setName('opcion3').setDescription('Tercera opción (opcional).').setRequired(false))
        .addStringOption((o) => o.setName('opcion4').setDescription('Cuarta opción (opcional).').setRequired(false))
        .addIntegerOption((o) =>
            o.setName('duracion').setDescription('Duración en minutos (1–60, por defecto 5).').setRequired(false)
                .setMinValue(1).setMaxValue(60)
        ),

    async execute(ctx) {
        const pregunta = ctx.getString('pregunta');
        const durMin   = ctx.getInteger('duracion') || 5;
        const opciones = [
            ctx.getString('opcion1'),
            ctx.getString('opcion2'),
            ctx.getString('opcion3'),
            ctx.getString('opcion4'),
        ].filter(Boolean);
        const durMs = durMin * 60 * 1000;

        // votes[i] = Set of userIds
        const votes = opciones.map(() => new Set());

        const buildEmbed = (closed = false) => {
            const total = votes.reduce((s, v) => s + v.size, 0);
            const bars  = votes.map((v) => {
                const pct   = total ? Math.round((v.size / total) * 10) : 0;
                const bar   = '█'.repeat(pct) + '░'.repeat(10 - pct);
                const perc  = total ? Math.round((v.size / total) * 100) : 0;
                return `\`[${bar}]\` ${perc}% (${v.size})`;
            });

            const desc = opciones.map((op, i) => `${VOTE_EMOJIS[i]} **${op}**\n${bars[i]}`).join('\n\n');

            return new EmbedBuilder()
                .setTitle(`📊 ${pregunta}`)
                .setDescription(desc)
                .setColor(closed ? 'Grey' : 'Blue')
                .setFooter({ text: closed
                    ? `Encuesta cerrada · ${total} votos totales`
                    : `Cierra en ${durMin} minuto(s) · ${total} votos · Encuesta de ${ctx.user.username}` })
                .setTimestamp();
        };

        const buildRow = (disabled = false) =>
            new ActionRowBuilder().addComponents(
                opciones.map((op, i) =>
                    new ButtonBuilder()
                        .setCustomId(`poll_${i}`)
                        .setLabel(`${VOTE_EMOJIS[i]} ${op}`.slice(0, 80))
                        .setStyle(COLORS[i])
                        .setDisabled(disabled)
                )
            );

        const msg = await ctx.reply({
            embeds:     [buildEmbed()],
            components: [buildRow()],
            fetchReply: true,
        });
        if (!msg) return;

        const collector = msg.createMessageComponentCollector({
            time: durMs,
        });

        collector.on('collect', async (i) => {
            const idx = parseInt(i.customId.replace('poll_', ''), 10);

            // Remove previous vote from same user
            for (const s of votes) s.delete(i.user.id);
            votes[idx].add(i.user.id);

            await i.update({ embeds: [buildEmbed()], components: [buildRow()] });
        });

        collector.on('end', async () => {
            await msg.edit({ embeds: [buildEmbed(true)], components: [buildRow(true)] }).catch(() => {});
        });
    },
};
