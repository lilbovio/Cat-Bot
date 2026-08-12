const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas expulsar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón de la expulsión.')
                .setRequired(false)),
    name: 'kick',
    description: 'Expulsa a un usuario del servidor.',
    async execute(interactionOrMessage, args = null) {
        const esSlashCommand = interactionOrMessage.isCommand?.();
        const guild = interactionOrMessage.guild;

        const usuario = esSlashCommand
            ? (interactionOrMessage.options.getMember('usuario') ||
                (await guild.members.fetch(interactionOrMessage.options.getUser('usuario').id).catch(() => null)))
            : interactionOrMessage.mentions.members.first();
        const razon = esSlashCommand
            ? interactionOrMessage.options.getString('razon') || 'No se proporcionó una razón.'
            : args?.slice(1).join(' ') || 'No se proporcionó una razón.';

        if (!interactionOrMessage.member.permissions.has('KICK_MEMBERS')) {
            const permissionError = 'No tienes permisos para expulsar usuarios.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: permissionError, ephemeral: true }) 
                : interactionOrMessage.reply(permissionError);
        }

        if (!usuario) {
            const userError = 'Por favor menciona a un usuario válido para expulsar.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: userError, ephemeral: true }) 
                : interactionOrMessage.reply(userError);
        }

        try {
            await usuario.kick(razon);
            const response = `${usuario.user.tag} ha sido expulsado.\nRazón: ${razon}`;
            esSlashCommand 
                ? interactionOrMessage.reply({ content: response }) 
                : interactionOrMessage.channel.send(response);
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ocurrió un error al expulsar al usuario.';
            esSlashCommand 
                ? interactionOrMessage.reply({ content: errorMessage, ephemeral: true }) 
                : interactionOrMessage.reply(errorMessage);
        }
    },
};
