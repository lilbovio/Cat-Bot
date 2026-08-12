const { SlashCommandBuilder } = require('@discordjs/builders');
const GuildConfig = require('../models/GuildConfig'); // Asegúrate de que este modelo esté bien configurado

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Establece un mensaje de bienvenida para el servidor.')
        .addStringOption(option => 
            option.setName('canal')
                .setDescription('ID del canal donde se enviarán los mensajes de bienvenida.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mensaje')
                .setDescription('Mensaje de bienvenida que incluirá el nombre del usuario.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('imagen')
                .setDescription('URL opcional de una imagen para el mensaje de bienvenida.')),
    name: 'setwelcome',
    description: 'Establece un mensaje de bienvenida para el servidor.',
    async execute(interactionOrMessage, args = null) {
        let channelId, welcomeMessage, imageUrl;

        // Verificar si el usuario tiene permisos de administrador
        const member = interactionOrMessage.member || interactionOrMessage.guild.members.cache.get(interactionOrMessage.author.id);
        if (!member.permissions.has('Administrator')) {
            return interactionOrMessage.reply('No tienes permiso para usar este comando. Necesitas ser administrador.');
        }

        // Manejo de interacción slash command
        if (interactionOrMessage.isChatInputCommand?.()) {
            const interaction = interactionOrMessage;

            channelId = interaction.options.getString('canal');
            welcomeMessage = interaction.options.getString('mensaje');
            imageUrl = interaction.options.getString('imagen') || null;

            try {
                // Guardar configuración en MongoDB
                await GuildConfig.findOneAndUpdate(
                    { guildId: interaction.guildId },
                    { $set: { welcomeChannel: channelId, welcomeMessage, welcomeImage: imageUrl } },
                    { upsert: true }
                );

                await interaction.reply(`Mensaje de bienvenida configurado correctamente para el canal <#${channelId}>.`);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Hubo un error configurando el mensaje de bienvenida.', ephemeral: true });
            }
        } 
        // Manejo de mensaje con prefijo
        else {
            const message = interactionOrMessage;
            const [canal, ...mensajeArray] = args;
            const mensaje = mensajeArray.join(' ');
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urlMatch = mensaje.match(urlRegex);

            channelId = canal;
            welcomeMessage = mensaje.replace(urlRegex, '').trim();
            imageUrl = urlMatch ? urlMatch[0] : null;

            try {
                // Guardar configuración en MongoDB
                await GuildConfig.findOneAndUpdate(
                    { guildId: message.guild.id },
                    { $set: { welcomeChannel: channelId, welcomeMessage, welcomeImage: imageUrl } },
                    { upsert: true }
                );

                await message.reply(`Mensaje de bienvenida configurado correctamente para el canal <#${channelId}>.`);
            } catch (error) {
                console.error(error);
                await message.reply('Hubo un error configurando el mensaje de bienvenida.');
            }
        }
    },
};

