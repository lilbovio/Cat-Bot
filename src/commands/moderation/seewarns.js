const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warn = require('../../../models/WarnSchema');

const PAGE_SIZE = 5;

module.exports = {
    name: 'seewarns',
    description: 'Muestra la lista de warns de un usuario.',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('seewarns')
        .setDescription('Muestra la lista de warns de un usuario.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('El usuario a consultar.').setRequired(true)
        ),
    async execute(ctx) {
        const target = await ctx.getUser('usuario');
        if (!target) return ctx.reply({ content: '❌ No se encontró al usuario.', ephemeral: true });

        const warnData = await Warn.findOne({ guildId: ctx.guild.id, userId: target.id });
        if (!warnData || warnData.warns.length === 0) {
            return ctx.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`⚠️ Warns de ${target.username}`)
                        .setDescription('Este usuario no tiene warns.')
                        .setColor('Green')
                        .setThumbnail(target.displayAvatarURL()),
                ],
                ephemeral: true,
            });
        }

        const warns = warnData.warns;
        const total = warns.length;
        const pages = Math.ceil(total / PAGE_SIZE);

        const buildEmbed = (page) => {
            const start = page * PAGE_SIZE;
            const slice = warns.slice(start, start + PAGE_SIZE);
            const description = slice
                .map((w, i) =>
                    `**${start + i + 1}.** ${w.reason}\n> Moderador: <@${w.moderatorId}> • <t:${Math.floor(new Date(w.date).getTime() / 1000)}:d>`
                )
                .join('\n\n');

            return new EmbedBuilder()
                .setTitle(`⚠️ Warns de ${target.username}`)
                .setDescription(description)
                .setColor('Orange')
                .setThumbnail(target.displayAvatarURL())
                .setFooter({ text: `${total} warn(s) en total • Página ${page + 1}/${pages}` });
        };

        // For prefix or single page: just send the first page embed
        await ctx.reply({ embeds: [buildEmbed(0)], ephemeral: true });
    },
};
