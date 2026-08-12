const { Events, EmbedBuilder } = require('discord.js');
const AfkSchema = require('../models/afkSchema');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Comprobación de menciones
        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(async (mentionedUser) => {
                if (mentionedUser.bot) return; // Evita procesar menciones a bots
                
                const mentionedAfk = await AfkSchema.findOne({ userId: mentionedUser.id });
                if (mentionedAfk) {
                    const afkTime = Math.floor((Date.now() - mentionedAfk.timestamp) / 60000);
                    
                    const embed = new EmbedBuilder()
                        .setColor('Yellow')
                        .setTitle('⚠️ Usuario AFK')
                        .setDescription(`${mentionedUser} está AFK desde hace **${afkTime} minutos**.\n**Razón:** ${mentionedAfk.reason || "Sin razón"}`)
                        .setTimestamp();

                    message.reply({ embeds: [embed] });
                }
            });
        }

        // Eliminación de estado AFK al enviar un mensaje
        const afkData = await AfkSchema.findOne({ userId: message.author.id });
        if (afkData) {
            await AfkSchema.deleteOne({ userId: message.author.id });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('👋 Estado AFK eliminado')
                .setDescription(`Bienvenido de vuelta, ${message.author}. Tu estado AFK ha sido eliminado.`)
                .setTimestamp();

            message.reply({ embeds: [embed] });
        }
    }
};
