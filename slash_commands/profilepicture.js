const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profilepicture')
        .setDescription('Muestra la foto de perfil de un usuario mencionado o del autor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('Selecciona un usuario para ver su foto de perfil.')),
    name: 'profilepicture',
    description: 'Muestra la foto de perfil de un usuario mencionado o del autor.',
    async execute(interactionOrMessage, args = null) {
        let user;
        let content;
        let avatar;

        // Detectar si se trata de una interacción o un mensaje con prefijo
        if (interactionOrMessage.isChatInputCommand?.()) {
            const interaction = interactionOrMessage;
            user = interaction.options.getUser('usuario') || interaction.user;
            content = `Foto de perfil de: ${user.username}:`;
            avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });

            await interaction.reply({ content, files: [avatar] });
        } else {
            const message = interactionOrMessage;
            user = message.mentions.users.first() || message.author;
            content = `Foto de perfil de: ${user.username}:`;
            avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });

            await message.reply({ content, files: [avatar] });
        }
    },
};
