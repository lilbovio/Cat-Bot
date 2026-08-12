module.exports = {
    name: 'say',
    description: 'Haz que el bot diga algo.',
    async execute(message, args) {
        const text = args.join(' ');

        if (!text) {
            return message.reply('Por favor, escribe un mensaje después del comando `!say`.');
        }

        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('No tienes permisos para usar este comando.');
        }

        message.delete().catch(() => {}); // Elimina el comando del usuario.
        message.channel.send(text); // Envía el mensaje al canal.
    },
};
