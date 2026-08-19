const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

function generalEmbed(user, member, color) {
    const embed = new EmbedBuilder()
        .setTitle(`👤 ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setColor(color)
        .addFields(
            { name: 'ID',             value: user.id,                                                                 inline: true },
            { name: 'Bot',            value: user.bot ? 'Sí' : 'No',                                                  inline: true },
            { name: 'Cuenta creada',  value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,                     inline: false },
        );
    if (member) {
        embed.addFields(
            { name: 'Apodo',    value: member.nickname || 'Ninguno',                                                  inline: true },
            { name: 'Se unió', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,                          inline: true },
        );
    }
    return embed;
}

function rolesEmbed(user, member, color) {
    const roles = member
        ? member.roles.cache.filter((r) => r.id !== member.guild.id).sort((a, b) => b.position - a.position)
        : null;
    const roleList = roles?.size
        ? [...roles.values()].map((r) => `<@&${r.id}>`).join('  ')
        : 'Sin roles';
    return new EmbedBuilder()
        .setTitle(`🏷️ Roles de ${user.username}`)
        .setColor(color)
        .setDescription(roleList.slice(0, 4000) || 'Sin roles');
}

function avatarEmbed(user, color) {
    const url = user.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false });
    return new EmbedBuilder()
        .setTitle(`🖼️ Avatar de ${user.username}`)
        .setColor(color)
        .setImage(url)
        .setURL(url);
}

const TABS = ['general', 'roles', 'avatar'];
const COLORS = { general: 'Purple', roles: 'Blue', avatar: 'Green' };

module.exports = {
    name: 'userinfo',
    description: 'Muestra información de un usuario con pestañas interactivas.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información de un usuario con pestañas interactivas.')
        .addUserOption((o) => o.setName('usuario').setDescription('Usuario a consultar.').setRequired(false)),

    async execute(ctx) {
        const user   = (await ctx.getUser('usuario')) || ctx.user;
        const member = ctx.guild ? await ctx.guild.members.fetch(user.id).catch(() => null) : null;

        if (!ctx.isSlash) {
            return ctx.reply({ embeds: [generalEmbed(user, member, 'Purple')] });
        }

        let current = 'general';

        const buildRow = (active) =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ui_general').setLabel('👤 General').setStyle(active === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ui_roles')  .setLabel('🏷️ Roles')  .setStyle(active === 'roles'   ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ui_avatar') .setLabel('🖼️ Avatar') .setStyle(active === 'avatar'  ? ButtonStyle.Primary : ButtonStyle.Secondary),
            );

        const getEmbed = (tab) => {
            if (tab === 'roles')  return rolesEmbed(user, member, COLORS.roles);
            if (tab === 'avatar') return avatarEmbed(user, COLORS.avatar);
            return generalEmbed(user, member, COLORS.general);
        };

        const msg = await ctx.interaction.reply({
            embeds:     [getEmbed('general')],
            components: [buildRow('general')],
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            current = i.customId.replace('ui_', '');
            await i.update({ embeds: [getEmbed(current)], components: [buildRow(current)] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    },
};
