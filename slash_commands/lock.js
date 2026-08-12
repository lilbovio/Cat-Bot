const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bloquea el canal actual.'),
    name: 'lock',
    description: 'Bloquea el canal actual.',
    async execute(interactionOrMessage) {
        const esSlashCommand = interactionOrMessage.isCommand?.();
        const canal = interactionOrMessage.channel;

        if (!interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const permissionError = 'No tienes permisos para bloquear el canal.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: permissionError, ephemeral: true }) 
                : interactionOrMessage.reply(permissionError);
        }

        try {
            await canal.permissionOverwrites.edit(canal.guild.roles.everyone, { SendMessages: false });
            const response = 'Este canal ha sido bloqueado.';
            esSlashCommand 
                ? interactionOrMessage.reply({ content: response }) 
                : interactionOrMessage.reply(response);
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ocurrió un error al bloquear el canal.';
            esSlashCommand 
                ? interactionOrMessage.reply({ content: errorMessage, ephemeral: true }) 
                : interactionOrMessage.reply(errorMessage);
        }
    },
};
