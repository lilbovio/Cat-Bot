const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const os = require('os');
const { adminID } = require('../config');

// Medir el uso de CPU del proceso (funciona en Windows, donde os.loadavg() no sirve)
function getCpuUsagePercent() {
    return new Promise((resolve) => {
        const start = process.cpuUsage();
        setTimeout(() => {
            const diff = process.cpuUsage(start);
            const totalMs = (diff.user + diff.system) / 1000;
            resolve(Math.min(100, (totalMs / 1000) * 100).toFixed(2));
        }, 1000);
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Muestra información detallada del bot.'),
    name: 'botinfo',
    description: 'Muestra información detallada del bot.',
    async execute(messageOrInteraction, args, client) {
        try {
            // Calcular uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / (24 * 60 * 60));
            const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((uptime % (60 * 60)) / 60);
            const seconds = Math.floor(uptime % 60);

            const totalMemory = os.totalmem() / 1024 / 1024;
            const usedMemory = (os.totalmem() - os.freemem()) / 1024 / 1024;

            const commandCount = (client.commands?.size || 0) + (client.slashCommands?.size || 0);
            const cpuPercent = await getCpuUsagePercent();

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Información de Cat Bot')
                .setDescription(
                    `Hola! Mi nombre es **${client.user.tag}** y soy un **BOT multiusos** en Español.`
                )
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    {
                        name: 'Información General',
                        value: `
                            • **Tag:** ${client.user.tag}
                            • **Desarrollador:** <@${adminID}>
                            • **Librería:** discord.js
                            • **Creación:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:F>
                        `,
                        inline: false,
                    },
                    {
                        name: 'Estadísticas',
                        value: `
                            • **Servidores:** ${client.guilds.cache.size}
                            • **Canales:** ${client.channels.cache.size}
                            • **Usuarios:** ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}
                            • **Comandos:** ${commandCount}
                        `,
                        inline: false,
                    },
                    {
                        name: 'Información Técnica',
                        value: `
                            • **Ping:** ${client.ws.ping} ms
                            • **Uptime:** ${days} días, ${hours} hrs, ${minutes} mins, ${seconds} segs
                            • **CPU:** ${os.cpus()[0].model}
                            • **Uso del CPU:** ${cpuPercent}%
                            • **Memoria RAM:** ${usedMemory.toFixed(2)} MB / ${totalMemory.toFixed(2)} MB
                        `,
                        inline: false,
                    },
                )
                .setTimestamp();

            // Responder según el tipo de interacción
            if (messageOrInteraction.isCommand?.()) {
                await messageOrInteraction.reply({ embeds: [embed] });
            } else {
                await messageOrInteraction.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error al enviar el mensaje de botinfo:', error);
            const errorMessage = 'Hubo un error al procesar este comando.';
            if (messageOrInteraction.isCommand?.()) {
                await messageOrInteraction.reply({ content: errorMessage, ephemeral: true });
            } else {
                await messageOrInteraction.channel.send(errorMessage);
            }
        }
    },
};
