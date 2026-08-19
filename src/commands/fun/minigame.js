const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

module.exports = {
    name: 'minigame',
    description: 'Adivina el número del 1 al 10 — usa los botones.',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('minigame')
        .setDescription('Adivina el número del 1 al 10 — usa los botones.'),

    async execute(ctx) {
        if (!ctx.isSlash) return ctx.reply('Usa `/minigame` como comando slash para los botones.');

        const secret = Math.floor(Math.random() * 10) + 1;

        // Two rows of 5 buttons each (1–5 and 6–10)
        const buildRows = (disabled = false, chosen = -1) => {
            const makeBtn = (n) => {
                let style = ButtonStyle.Primary;
                if (disabled) {
                    if (n === secret)  style = ButtonStyle.Success;
                    else if (n === chosen) style = ButtonStyle.Danger;
                    else               style = ButtonStyle.Secondary;
                }
                return new ButtonBuilder()
                    .setCustomId(`mg_${n}`)
                    .setLabel(`${n}`)
                    .setStyle(style)
                    .setDisabled(disabled);
            };
            return [
                new ActionRowBuilder().addComponents([1,2,3,4,5].map(makeBtn)),
                new ActionRowBuilder().addComponents([6,7,8,9,10].map(makeBtn)),
            ];
        };

        const embed = new EmbedBuilder()
            .setTitle('🎮 Adivina el número')
            .setDescription('He pensado un número del **1** al **10**. ¿Cuál es?')
            .setColor('Blue')
            .setFooter({ text: 'Tienes 15 segundos' });

        const msg = await ctx.interaction.reply({
            embeds: [embed],
            components: buildRows(),
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 15000,
        });

        collector.on('collect', async (i) => {
            const guess = parseInt(i.customId.replace('mg_', ''), 10);
            const hit   = guess === secret;

            const resultEmbed = new EmbedBuilder()
                .setTitle(hit ? '🎉 ¡Correcto!' : '❌ Fallaste')
                .setDescription(hit
                    ? `¡El número era **${secret}**! ¡Lo adivinaste!`
                    : `El número era **${secret}**. Elegiste **${guess}**.`)
                .setColor(hit ? 'Green' : 'Red');

            await i.update({ embeds: [resultEmbed], components: buildRows(true, guess) });
        });

        collector.on('end', (col, reason) => {
            if (reason === 'time') {
                msg.edit({
                    embeds: [new EmbedBuilder().setTitle('⏰ Tiempo').setDescription(`El número era **${secret}**.`).setColor('Yellow')],
                    components: buildRows(true),
                }).catch(() => {});
            }
        });
    },
};
