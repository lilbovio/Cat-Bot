const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

const CHOICES = [
    { id: 'piedra', label: '🪨 Piedra', style: ButtonStyle.Primary },
    { id: 'papel',  label: '📄 Papel',  style: ButtonStyle.Success },
    { id: 'tijera', label: '✂️ Tijera', style: ButtonStyle.Danger  },
];

function beats(a, b) {
    return (a === 'piedra' && b === 'tijera') ||
           (a === 'papel'  && b === 'piedra') ||
           (a === 'tijera' && b === 'papel');
}

module.exports = {
    name: 'rps',
    description: 'Piedra, papel o tijera contra el bot. ¡Pulsa un botón!',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Piedra, papel o tijera contra el bot. ¡Pulsa un botón!'),

    async execute(ctx) {
        if (!ctx.isSlash) return ctx.reply('Usa `/rps` como comando slash para ver los botones.');

        const row = new ActionRowBuilder().addComponents(
            CHOICES.map((c) =>
                new ButtonBuilder().setCustomId(`rps_${c.id}`).setLabel(c.label).setStyle(c.style)
            )
        );

        const msg = await ctx.interaction.reply({
            content: '🎮 **Piedra, Papel o Tijera** — ¡Elige tu jugada!',
            components: [row],
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            const jugador = i.customId.replace('rps_', '');
            const botChoice = CHOICES[Math.floor(Math.random() * 3)].id;

            const win  = beats(jugador, botChoice);
            const lose = beats(botChoice, jugador);
            const result = win ? '🎉 ¡**Ganaste**!' : lose ? '😔 **Perdiste**...' : '🤝 **¡Empate**!';
            const color  = win ? 'Green' : lose ? 'Red' : 'Yellow';

            const embed = new EmbedBuilder()
                .setTitle('🎮 Resultado')
                .setColor(color)
                .addFields(
                    { name: 'Tu jugada',       value: CHOICES.find((c) => c.id === jugador).label,  inline: true },
                    { name: 'Jugada del bot',  value: CHOICES.find((c) => c.id === botChoice).label, inline: true },
                    { name: 'Resultado',       value: result, inline: false },
                );

            const disabledRow = new ActionRowBuilder().addComponents(
                CHOICES.map((c) =>
                    new ButtonBuilder()
                        .setCustomId(`rps_${c.id}`)
                        .setLabel(c.label)
                        .setStyle(c.id === jugador ? ButtonStyle.Secondary : ButtonStyle.Secondary)
                        .setDisabled(true)
                )
            );

            await i.update({ content: '', embeds: [embed], components: [disabledRow] });
        });

        collector.on('end', (col, reason) => {
            if (reason === 'time') {
                msg.edit({ content: '⏰ Se acabó el tiempo.', components: [] }).catch(() => {});
            }
        });
    },
};
