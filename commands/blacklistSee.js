const Blacklist = require('../models/Blacklist');
const { adminID } = require('../config'); // Importar el adminID desde la configuración

module.exports = {
    name: 'blacklistsee',
    description: 'Muestra la lista de usuarios en la blacklist',
    usage: '!blacklistsee',
    async execute(message) {
        // Verificar si el usuario tiene permiso
        if (message.author.id !== adminID) {
            return message.reply('No tienes permiso para usar este comando.');
        }

        // Obtener todos los usuarios en la blacklist
        const blacklist = await Blacklist.find();
        if (blacklist.length === 0) {
            return message.reply('La blacklist está vacía.');
        }

        // Formatear la lista para mostrar
        const userList = blacklist.map((entry) => `- ${entry.userID}`).join('\n');

        const embed = {
            color: 0x0099ff,
            title: 'Usuarios en la blacklist',
            description: userList,
        };

        message.reply({ embeds: [embed] });
    },
};
