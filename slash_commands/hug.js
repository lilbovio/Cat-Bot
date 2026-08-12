const { SlashCommandBuilder } = require('@discordjs/builders');
const neko = require('nekos.life');
const sfw = new neko();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Abraza a un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Selecciona a un usuario')
                .setRequired(false)),
    name: 'hug',
    description: 'Abraza a un usuario',
    async execute(interactionOrMessage, args = null) {
        const gif = await sfw.hug();

        // Comprobar si el comando es un slash command
        if (interactionOrMessage.isCommand?.()) {
            const interaction = interactionOrMessage;
            const user = interaction.options.getUser('usuario');

            if (!user) {
                return interaction.reply({
                    content: `${interaction.user.username} se abraza a sí mismo.`,
                    embeds: [{ image: { url: gif.url } }]
                });
            }

            return interaction.reply({
                content: `${interaction.user.username} abraza a ${user.username}.`,
                embeds: [{ image: { url: gif.url } }]
            });
        }

        // Comando con prefijo
        if (args) {
            const message = interactionOrMessage;
            const userMention = message.mentions.users.first();

            if (!userMention) {
                return message.reply({
                    content: `${message.author.username} se abraza a sí mismo.`,
                    embeds: [{ image: { url: gif.url } }]
                });
            }

            return message.reply({
                content: `${message.author.username} abraza a ${userMention.username}.`,
                embeds: [{ image: { url: gif.url } }]
            });
        }
    },
};
