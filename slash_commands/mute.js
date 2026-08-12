const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia a un usuario temporalmente.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Selecciona un usuario para silenciar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Duración del silencio (Ej: 10s, 5m, 1h).')
                .setRequired(false)),
    name: 'mute',
    description: 'Silencia a un usuario temporalmente.',
    async execute(interactionOrMessage, args = null) {
        const esSlashCommand = interactionOrMessage.isCommand?.();
        const guild = interactionOrMessage.guild;
        const muteRole = guild.roles.cache.find(role => role.name === 'Muted');

        if (!muteRole) {
            const errorMessage = 'El rol de "Muted" no existe.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: errorMessage, ephemeral: true }) 
                : interactionOrMessage.reply(errorMessage);
        }

        const usuario = esSlashCommand
            ? (interactionOrMessage.options.getMember('user') ||
                (await guild.members.fetch(interactionOrMessage.options.getUser('user').id).catch(() => null)))
            : interactionOrMessage.mentions.members.first();
        
        const tiempoInput = esSlashCommand
            ? interactionOrMessage.options.getString('time')
            : args?.[1];

        if (!interactionOrMessage.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const permissionError = 'No tienes permiso para usar este comando.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: permissionError, ephemeral: true }) 
                : interactionOrMessage.reply(permissionError);
        }

        if (!usuario) {
            const userError = 'Por favor menciona un usuario válido para silenciar.';
            return esSlashCommand 
                ? interactionOrMessage.reply({ content: userError, ephemeral: true }) 
                : interactionOrMessage.reply(userError);
        }

        // Parsear el tiempo ingresado
        let muteTime = 5 * 60 * 1000; // Tiempo predeterminado: 5 minutos en milisegundos
        if (tiempoInput) {
            const match = tiempoInput.match(/^(\d+)(s|m|h)?$/i);
            if (match) {
                const cantidad = parseInt(match[1], 10);
                const unidad = match[2]?.toLowerCase();

                if (unidad === 's') {
                    muteTime = cantidad * 1000; // Segundos a milisegundos
                } else if (unidad === 'm' || !unidad) {
                    muteTime = cantidad * 60 * 1000; // Minutos a milisegundos
                } else if (unidad === 'h') {
                    muteTime = cantidad * 60 * 60 * 1000; // Horas a milisegundos
                }
            } else {
                const invalidTimeError = 'El formato del tiempo no es válido. Usa algo como "10s", "5m" o "1h".';
                return esSlashCommand 
                    ? interactionOrMessage.reply({ content: invalidTimeError, ephemeral: true }) 
                    : interactionOrMessage.reply(invalidTimeError);
            }
        }

        try {
            // Aplicar el rol de mute
            await usuario.roles.add(muteRole);
            const response = `${usuario} ha sido silenciado por ${tiempoInput || '5m'}.`;
            esSlashCommand 
                ? interactionOrMessage.reply({ content: response }) 
                : interactionOrMessage.reply(response);

            // Programar la remoción del mute
            setTimeout(async () => {
                try {
                    const freshMember = await guild.members.fetch(usuario.id);
                    if (freshMember.roles.cache.has(muteRole.id)) {
                        await freshMember.roles.remove(muteRole);
                        const unmuteMessage = `${freshMember} ha sido desilenciado.`;
                        if (esSlashCommand) {
                            await interactionOrMessage.followUp({ content: unmuteMessage }).catch(() => {});
                        } else {
                            interactionOrMessage.channel.send(unmuteMessage);
                        }
                    }
                } catch (error) {
                    console.error('Error al desilenciar al usuario:', error);
                }
            }, muteTime);
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ocurrió un error al silenciar al usuario.';
            esSlashCommand 
                ? interactionOrMessage.reply({ content: errorMessage, ephemeral: true }) 
                : interactionOrMessage.reply(errorMessage);
        }
    },
};
