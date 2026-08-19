const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'untimeout',
    description: 'Remueve el timeout de un usuario.',
    category: 'moderation',
    cooldown: 3,
    permissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remueve el timeout de un usuario.')
        .addUserOption((o) => o.setName('usuario').setDescription('Usuario al que quitar el timeout.').setRequired(true)),
    async execute(ctx) {
        const member = await ctx.getMember('usuario');
        if (!member) return ctx.reply({ content: '❌ No se encontró al usuario en el servidor.', ephemeral: true });
        if (!member.moderatable) return ctx.reply({ content: '❌ No puedo modificar a ese usuario.', ephemeral: true });
        if (!member.communicationDisabledUntil) return ctx.reply({ content: '❌ Ese usuario no tiene un timeout activo.', ephemeral: true });

        await member.timeout(null);

        const embed = new EmbedBuilder()
            .setTitle('✅ Timeout eliminado')
            .setColor('Green')
            .setDescription(`El timeout de **${member.user.username}** ha sido eliminado.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
