const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const UserLevel = require('../../../models/UserLevel');
const GuildConfig = require('../../../models/GuildConfig');

const PAGE_SIZE = 10;

const MEDALS = ['🥇', '🥈', '🥉'];

async function buildPage(client, guildId, page, totalPages, allUsers) {
    const start = page * PAGE_SIZE;
    const slice = allUsers.slice(start, start + PAGE_SIZE);

    const lines = await Promise.all(
        slice.map(async (u, i) => {
            const pos = start + i + 1;
            const medal = MEDALS[pos - 1] || `**${pos}.**`;
            let username;
            try {
                const member = await client.guilds.cache.get(guildId)?.members.fetch(u.userId).catch(() => null);
                // user.tag is deprecated in discord.js v14 (pomelo) — use username directly
                username = member?.user.username ?? `Usuario desconocido (${u.userId})`;
            } catch {
                username = `Usuario desconocido (${u.userId})`;
            }
            return `${medal} **${username}** — Nivel **${u.level}** · ${u.xp.toLocaleString()} XP`;
        })
    );

    return new EmbedBuilder()
        .setTitle('🏆 Tabla de clasificación — XP')
        .setColor('Gold')
        .setDescription(lines.join('\n'))
        .setFooter({ text: `Página ${page + 1} / ${totalPages} · ${allUsers.length} usuarios` })
        .setTimestamp();
}

function buildRow(page, totalPages) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('lb_prev')
            .setLabel('◀ Anterior')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('lb_next')
            .setLabel('Siguiente ▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages - 1),
    );
}

module.exports = {
    name: 'leaderboard',
    description: 'Muestra la clasificación de XP del servidor.',
    category: 'utility',
    aliases: ['lb', 'top'],
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Muestra la clasificación de XP del servidor.'),
    async execute(ctx) {
        const guildConfig = await GuildConfig.findOne({ guildId: ctx.guild.id });
        // null config → leveling enabled by default; only disabled when explicitly false
        if (guildConfig && guildConfig.levelingEnabled === false) {
            return ctx.reply({ content: '❌ El sistema de nivelación está desactivado en este servidor.', ephemeral: true });
        }

        await ctx.defer();

        const allUsers = await UserLevel.find({ guildId: ctx.guild.id }).sort({ xp: -1 });
        if (!allUsers.length) {
            return ctx.edit({ content: '❌ Nadie tiene XP en este servidor todavía.' });
        }

        const totalPages = Math.ceil(allUsers.length / PAGE_SIZE);
        let page = 0;

        const embed = await buildPage(ctx.client, ctx.guild.id, page, totalPages, allUsers);

        if (!ctx.isSlash || totalPages === 1) {
            return ctx.edit({ embeds: [embed] });
        }

        const msg = await ctx.edit({ embeds: [embed], components: [buildRow(page, totalPages)] });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time: 120_000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'lb_prev') page = Math.max(0, page - 1);
            if (i.customId === 'lb_next') page = Math.min(totalPages - 1, page + 1);
            const newEmbed = await buildPage(ctx.client, ctx.guild.id, page, totalPages, allUsers);
            await i.update({ embeds: [newEmbed], components: [buildRow(page, totalPages)] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    },
};
