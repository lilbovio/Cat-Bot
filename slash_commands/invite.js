const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Proporciona el enlace para invitar al bot.'),
    name: 'invite',
    description: 'Proporciona el enlace para invitar al bot.',
    async execute(interactionOrMessage, args = null) {
        if ( args ) {
            const message = interactionOrMessage;
            const inviteLink = `https://discord.com/oauth2/authorize?client_id=907840523350470677`;
            message.reply(`¡Invítame a tu servidor con este enlace: ${inviteLink}`);
        }

        if ( interactionOrMessage.isCommand?.() ) {
            const interaction = interactionOrMessage;
            const inviteLink = `https://discord.com/oauth2/authorize?client_id=907840523350470677`;
            interaction.reply(`¡Invítame a tu servidor con este enlace: ${inviteLink}`);
        }
    },
};
