const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Muestra el avatar de un usuario.',
    category: 'utility',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario del que ver el avatar.').setRequired(false)
        ),
    async execute(ctx) {
        const user = (await ctx.getUser('usuario')) || ctx.user;
        const avatarUrl = user.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false });

        const embed = new EmbedBuilder()
            .setTitle(`🖼️ Avatar de ${user.username}`)
            .setImage(avatarUrl)
            .setColor('Blue')
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
