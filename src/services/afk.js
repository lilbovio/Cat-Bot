const AfkSchema = require('../../models/afkSchema');
const { EmbedBuilder } = require('discord.js');

// Avisa al mencionar a usuarios AFK y limpia el estado AFK del autor al volver a escribir.
async function handleAfk(message) {
    if (!message.guild || message.author.bot) return;

    // Comprobación de menciones
    for (const mentionedUser of message.mentions.users.values()) {
        if (mentionedUser.bot) continue;

        const mentionedAfk = await AfkSchema.findOne({ userId: mentionedUser.id });
        if (mentionedAfk) {
            const afkMinutes = Math.floor((Date.now() - mentionedAfk.timestamp) / 60000);
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('⚠️ Usuario AFK')
                .setDescription(
                    `${mentionedUser} está AFK desde hace **${afkMinutes} minutos**.\n**Razón:** ${mentionedAfk.reason || 'Sin razón'}`
                )
                .setTimestamp();
            message.reply({ embeds: [embed] });
        }
    }

    // Eliminar el estado AFK del autor al enviar un mensaje
    const myAfk = await AfkSchema.findOne({ userId: message.author.id });
    if (myAfk) {
        await AfkSchema.deleteOne({ userId: message.author.id });
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('👋 Estado AFK eliminado')
            .setDescription(`Bienvenido de vuelta, ${message.author}. Tu estado AFK ha sido eliminado.`)
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}

module.exports = { handleAfk };
