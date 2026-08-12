const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Selecciona a un usuario')
                .setRequired(false)),
    name: 'userinfo',
    description: 'Muestra información sobre un usuario.',
    async execute(messageOrInteraction, args = [], client) {
        try {
            // Determinar si es una interacción o un mensaje
            const isInteraction = !!messageOrInteraction.isChatInputCommand?.();

            // Obtener el usuario objetivo
            let target;
            if (isInteraction) {
                // Slash Command: usar opción seleccionada o el usuario que ejecuta el comando
                target = messageOrInteraction.options.getUser('usuario') || messageOrInteraction.user;
            } else {
                // Mensaje con prefijo: usar menciones o el autor del mensaje
                target = messageOrInteraction.mentions.users.first() || messageOrInteraction.author;
            }

            if (!target) {
                const errorResponse = 'No se pudo encontrar un usuario. Por favor, inténtalo nuevamente.';
                if (isInteraction) {
                    return await messageOrInteraction.reply({ content: errorResponse, ephemeral: true });
                } else {
                    return messageOrInteraction.channel.send(errorResponse);
                }
            }

            // Crear el embed
            const embed = new EmbedBuilder()
                .setTitle('Información del Usuario')
                .addFields([
                    { name: 'Nombre de Usuario', value: target.tag, inline: true },
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Cuenta Creada', value: target.createdAt.toDateString(), inline: true },
                ])
                .setThumbnail(target.displayAvatarURL())
                .setColor('Purple');

            // Enviar respuesta
            if (isInteraction) {
                await messageOrInteraction.reply({ embeds: [embed] });
            } else {
                messageOrInteraction.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error ejecutando el comando userinfo:', error);
            const errorMessage = 'Ocurrió un error al intentar mostrar la información del usuario.';
            if (messageOrInteraction.reply) {
                await messageOrInteraction.reply({ content: errorMessage, ephemeral: true });
            } else {
                messageOrInteraction.channel.send(errorMessage);
            }
        }
    },
};
