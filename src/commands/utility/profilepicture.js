const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'profilepicture',
    description: 'Muestra la foto de perfil de un usuario.',
    category: 'utility',
    cooldown: 3,
    aliases: ['pp', 'pfp'],
    data: new SlashCommandBuilder()
        .setName('profilepicture')
        .setDescription('Muestra la foto de perfil de un usuario.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario del que ver la foto de perfil.').setRequired(false)
        ),
    async execute(ctx) {
        const user = (await ctx.getUser('usuario')) || ctx.user;
        const avatarUrl = user.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false });

        const embed = new EmbedBuilder()
            .setTitle(`🖼️ Foto de perfil de ${user.username}`)
            .setImage(avatarUrl)
            .setColor('Purple')
            .setURL(avatarUrl);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('⬇️ Descargar')
                .setStyle(ButtonStyle.Link)
                .setURL(avatarUrl),
        );

        await ctx.reply({ embeds: [embed], components: [row] });
    },
};
