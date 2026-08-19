const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, StringSelectMenuBuilder,
} = require('discord.js');

const CATEGORIES = {
    fun:        { label: '🎮 Juegos',       color: 'Orange'   },
    activities: { label: '🤗 Actividades',  color: 'Pink'     },
    moderation: { label: '🔨 Moderación',   color: 'Red'      },
    utility:    { label: '🔧 Utilidad',     color: 'Blue'     },
    config:     { label: '⚙️ Configuración', color: 'DarkGrey' },
};

function buildOverviewEmbed(client) {
    const allCmds = [...client.commands.values()];
    const embed = new EmbedBuilder()
        .setTitle('📋 Menú de Ayuda — CatBot')
        .setDescription('Selecciona una categoría en el menú de abajo para ver sus comandos.\n\u200b')
        .setColor('Blue')
        .setFooter({ text: `${allCmds.length} comandos · Prefijo por defecto: !` });

    for (const [key, { label }] of Object.entries(CATEGORIES)) {
        const cmds = allCmds.filter((c) => c.category === key);
        if (!cmds.length) continue;
        embed.addFields({
            name:  `${label} (${cmds.length})`,
            value: cmds.map((c) => `\`/${c.name}\``).join('  '),
            inline: false,
        });
    }
    return embed;
}

function buildCategoryEmbed(client, key) {
    const { label, color } = CATEGORIES[key];
    const cmds = [...client.commands.values()].filter((c) => c.category === key);
    return new EmbedBuilder()
        .setTitle(label)
        .setColor(color)
        .setDescription(cmds.map((c) => `\`/${c.name}\` — ${c.description}`).join('\n') || 'Sin comandos.')
        .setFooter({ text: `${cmds.length} comandos en esta categoría` });
}

module.exports = {
    name: 'help',
    description: 'Muestra el menú de ayuda interactivo con selector de categoría.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra el menú de ayuda interactivo con selector de categoría.'),

    async execute(ctx) {
        if (!ctx.isSlash) {
            // prefix fallback: plain embed
            const embed = buildOverviewEmbed(ctx.client);
            return ctx.reply({ embeds: [embed] });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('help_cat')
            .setPlaceholder('Elige una categoría...')
            .addOptions(
                Object.entries(CATEGORIES).map(([value, { label }]) => ({
                    label, value,
                    description: `Ver comandos de ${label}`,
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const msg = await ctx.interaction.reply({
            embeds:     [buildOverviewEmbed(ctx.client)],
            components: [row],
            ephemeral:  true,
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time: 120000,
        });

        collector.on('collect', async (i) => {
            const key = i.values[0];
            await i.update({ embeds: [buildCategoryEmbed(ctx.client, key)], components: [row] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    },
};
