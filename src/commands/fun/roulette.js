const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

module.exports = {
    name: 'roulette',
    description: 'Ruleta rusa — 1 en 6 chances de "morir". ¿Te atreves?',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Ruleta rusa — 1 en 6 chances de "morir". ¿Te atreves?'),

    async execute(ctx) {
        if (!ctx.isSlash) return ctx.reply('Usa `/roulette` como slash command.');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rl_yes').setLabel('🔫 Jalar el gatillo').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('rl_no') .setLabel('🏃 Huir cobardemente').setStyle(ButtonStyle.Secondary),
        );

        const embed = new EmbedBuilder()
            .setTitle('🔫 Ruleta Rusa')
            .setDescription(`${ctx.user}, gira el tambor...\nHay **1 bala** en **6 cámaras**.\n\n¿Jalas el gatillo?`)
            .setColor('DarkRed');

        const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 20000,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'rl_no') {
                await msg.edit({
                    embeds: [new EmbedBuilder()
                        .setTitle('🏃 ¡Cobarde!')
                        .setDescription(`${ctx.user} huyó antes de jalar el gatillo. Otro día será...`)
                        .setColor('Yellow')],
                    components: [],
                });
                return;
            }

            // suspense
            await msg.edit({
                embeds: [embed.setDescription('*...*').setColor('DarkRed')],
                components: [],
            });
            await new Promise((r) => setTimeout(r, 2000));

            const muerto = Math.random() < 1 / 6;
            await msg.edit({
                embeds: [new EmbedBuilder()
                    .setTitle(muerto ? '💥 ¡BANG!' : '😮‍💨 Click...')
                    .setDescription(muerto
                        ? `${ctx.user} **ha muerto**. La bala estaba ahí. 🪦`
                        : `${ctx.user} sigue vivo... por ahora. El tambor estaba vacío.`)
                    .setColor(muerto ? 'Red' : 'Green')],
                components: [],
            });
        });

        collector.on('end', (col, reason) => {
            if (reason === 'time') {
                msg.edit({ embeds: [embed.setFooter({ text: 'Tiempo agotado.' })], components: [] }).catch(() => {});
            }
        });
    },
};
