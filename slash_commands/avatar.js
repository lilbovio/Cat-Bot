const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('El usuario del cual quieres ver su avatar')
        ),
    name: 'avatar',
    description: 'Muestra el avatar de un usuario.',
    async execute(interactionOrMessage) {
        let user;

        // Comprobar si es una interacción de comando de barra (/)
        if (interactionOrMessage.commandName) {
            const interaction = interactionOrMessage;

            // Obtener el usuario del comando o usar el autor del comando
            user = interaction.options.getUser('target') || interaction.user;

            // Responder al comando
            await interaction.reply(`Este es el avatar de: ${user.username}: ${user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
        } else {
            // Si es un mensaje de texto con prefijo (!)
            const message = interactionOrMessage;

            // Obtener el usuario mencionado o el autor del mensaje
            user = message.mentions.users.first() || message.author;

            // Responder al mensaje
            message.channel.send(`Este es el avatar de: ${user.username}: ${user.displayAvatarURL({ dynamic: true, size: 1024 })}`);
        }
    },
};
