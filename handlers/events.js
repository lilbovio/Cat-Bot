const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig'); // Modelo de configuración de MongoDB

module.exports = (client) => {
    client.once('ready', async () => {
        console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);

        client.user.setPresence({
            activities: [{ name: 'CatBot!', type: 0 }], // Cambia el nombre del estado
            status: 'dnd' // Opciones: 'online', 'idle', 'dnd' (No molestar), 'invisible'
        });
        
        const channelId = '907842163130392646';
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                console.log(`🔹 Enviando mensaje al canal ${channel.name} (${channelId})`);
                await channel.send('¡El bot está encendido!');
            } else {
                console.error(`⚠️ El canal con ID ${channelId} no es válido o no es un canal de texto.`);
            }
        } catch (err) {
            console.error(`❌ Error al buscar el canal con ID ${channelId}:`, err);
        }
    });

    // Evento: Cuando un nuevo miembro se une al servidor (Configurado dinámicamente)
    client.on('guildMemberAdd', async (member) => {

        try {
            const guildConfig = await GuildConfig.findOne({ guildId: member.guild.id });

            if (!guildConfig || !guildConfig.welcomeChannel || !guildConfig.welcomeMessage) return;

            const welcomeChannel = member.guild.channels.cache.get(guildConfig.welcomeChannel);

            if (!welcomeChannel || !welcomeChannel.isTextBased()) {
                console.error(`❌ El canal configurado no es válido o no pertenece al servidor: ${guildConfig.welcomeChannel}`);
                return;
            }

            const welcomeMessage = guildConfig.welcomeMessage.replace('{usuario}', `<@${member.id}>`);
            const welcomeImage = guildConfig.welcomeImage;

            const messageOptions = { content: welcomeMessage };
            if (welcomeImage) {
                messageOptions.files = [welcomeImage];
            }

            await welcomeChannel.send(messageOptions);
        } catch (error) {
            console.error(`❌ Error al buscar o enviar mensaje en el canal de bienvenida (${member.guild.id}):`, error);
        }
    });

    // Evento: Cuando el bot es añadido a un nuevo servidor
    client.on('guildCreate', async (guild) => {
        console.log(`El bot fue añadido a un nuevo servidor: ${guild.name} (ID: ${guild.id})`);

        // Mensaje en un canal específico
        const logChannelId = '907842367086796851';
        try {
            const logChannel = await client.channels.fetch(logChannelId);
            if (logChannel && logChannel.isTextBased()) {
                console.log(`🔹 Enviando información del servidor al canal de logs (${logChannelId})`);

                const embed = new EmbedBuilder()
                    .setTitle('El bot fue añadido a un nuevo servidor')
                    .addFields(
                        { name: 'Nombre del servidor', value: guild.name, inline: true },
                        { name: 'ID del servidor', value: guild.id, inline: true },
                        { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
                        { name: 'Propietario', value: `<@${guild.ownerId}>`, inline: true },
                        { name: 'Cantidad de canales', value: `${guild.channels.cache.size}`, inline: true },
                        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true }
                    )
                    .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                    .setColor('Blue')
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error(`❌ Error al buscar el canal de logs:`, err);
        }

        // Mensaje en el canal predeterminado del servidor
        const defaultChannel = guild.channels.cache.find(
            (channel) =>
                channel.type === 0 && // Canal de texto
                channel.permissionsFor(guild.members.me).has('SendMessages')
        );

        if (defaultChannel) {
            try {
                console.log(`🔹 Enviando mensaje al canal predeterminado (${defaultChannel.name}) en el servidor ${guild.name}`);
                await defaultChannel.send(
                    '¡Hola! Gracias por añadir el bot a tu servidor. Escribe `/help` para ver la lista de comandos.'
                );
            } catch (err) {
                console.error(`❌ Error al enviar mensaje al canal predeterminado:`, err);
            }
        } else {
            console.warn(`⚠️ No se encontró un canal predeterminado en el servidor ${guild.name}`);
        }
    });

    // Evento: Manejo de errores
    client.on('error', async (error) => {
        console.error('❌ Unhandled error:', error);

        const errorChannelId = '1321757359277867038'; // ID del canal específico
        try {
            const errorChannel = await client.channels.fetch(errorChannelId);
            if (errorChannel && errorChannel.isTextBased()) {
                console.log(`🔹 Enviando mensaje de error al canal ${errorChannel.name} (${errorChannelId})`);
                await errorChannel.send({
                    content: `⚠️ **Se produjo un error no controlado:**\n\`\`\`${error.stack || error.message}\`\`\``
                });
            } else {
                console.warn(`⚠️ El canal con ID ${errorChannelId} no está disponible o no es válido.`);
            }
        } catch (err) {
            console.error(`❌ No se pudo enviar el mensaje al canal ${errorChannelId}:`, err);
        }
    });

    //evento de warns
    client.on('messageCreate', async (message) => {
        if (!message.guild || message.author.bot) return;

        const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
        const prefix = guildConfig?.prefix || '!';
        if (!message.content.startsWith(prefix)) return;
    
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
    
        if (command === 'warn') {
            const warnCommand = require('../slash_commands/warn.js');
            await warnCommand.executePrefix(message, args);
        }
    });
};
