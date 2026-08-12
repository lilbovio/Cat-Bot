const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloquea el canal actual.'),
    name: 'unlock',
    description: 'Desbloquea el canal actual.',
    async execute(interactionOrMessage) {
        const esSlashCommand = interactionOrMessage.isCommand?.();
        const canal = interactionOrMessage.channel;

        if (!interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const permissionError = 'No tienes permisos para desbloquear el canal.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: permissionError, ephemeral: true }) 
                : interactionOrMessage.reply(permissionError);
        }

        try {
            await canal.permissionOverwrites.edit(canal.guild.roles.everyone, { SendMessages: true });
            const response = 'Este canal ha sido desbloqueado.';
            esSlashCommand 
                ? interactionOrMessage.reply({ content: response }) 
                : interactionOrMessage.reply(response);
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ocurrió un error al desbloquear el canal.';
            esSlashCommand 
                ? interactionOrMessage.reply({ content: errorMessage, ephemeral: true }) 
                : interactionOrMessage.reply(errorMessage);
        }
    },
};
