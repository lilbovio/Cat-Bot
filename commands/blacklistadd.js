const Blacklist = require('../models/Blacklist');
const { adminID } = require('../config'); // Importar el adminID desde la configuración

module.exports = {
    name: 'blacklistadd',
    description: 'Añade un usuario a la blacklist',
    usage: '!blacklistadd <ID del usuario>',
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

        // Verificar si el usuario ya está en la blacklist
        const exists = await Blacklist.findOne({ userID: userId });
        if (exists) {
            return message.reply(`El usuario con ID ${userId} ya está en la blacklist.`);
        }

        // Añadir usuario a la base de datos
        await Blacklist.create({ userID: userId });

        // Enviar mensaje de confirmación
        const embed = {
            color: 0xff0000,
            title: 'Nuevo usuario en la blacklist',
            description: `El usuario con el ID \`${userId}\` fue añadido a la blacklist.`,
        };

        const logChannel = message.client.channels.cache.get('1326122014573989970');
        if (logChannel) logChannel.send({ embeds: [embed] });

        message.reply(`El usuario con ID \`${userId}\` ha sido añadido a la blacklist.`);
    },
};
