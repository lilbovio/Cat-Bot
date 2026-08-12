const Blacklist = require('../models/Blacklist');
const { adminID } = require('../config'); // Importar el adminID desde la configuración

module.exports = {
    name: 'blacklistrm',
    description: 'Elimina un usuario de la blacklist',
    usage: '!blacklistremove <ID del usuario>',
    async execute(message, args) {
        // Verificar si el usuario tiene permiso
        if (message.author.id !== adminID) {
            return message.reply('No tienes permiso para usar este comando.');
        }

        // Verificar si se proporcionó una ID
        if (!args[0]) {
            return message.reply('Por favor, proporciona una ID de usuario válida.');
        }

        const userId = args[0];

        // Buscar y eliminar al usuario de la blacklist
        const result = await Blacklist.findOneAndDelete({ userID: userId });
        if (!result) {
            return message.reply(`El usuario con ID ${userId} no estaba en la blacklist.`);
        }

        // Enviar mensaje de confirmación
        const embed = {
            color: 0x00ff00,
            title: 'Usuario eliminado de la blacklist',
            description: `El usuario con el ID \`${userId}\` fue eliminado de la blacklist.`,
        };

        const logChannel = message.client.channels.cache.get('1326122014573989970');
        if (logChannel) logChannel.send({ embeds: [embed] });

        message.reply(`El usuario con ID \`${userId}\` ha sido eliminado de la blacklist.`);
    },
};
