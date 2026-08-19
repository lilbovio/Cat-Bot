const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildUpdate,
    async execute(client, oldGuild, newGuild) {
        const changes = [];

        if (oldGuild.name !== newGuild.name) {
            changes.push({ name: '🔤 Nombre', value: `\`${oldGuild.name}\` → \`${newGuild.name}\``, inline: false });
        }
        if (oldGuild.iconURL() !== newGuild.iconURL()) {
            changes.push({ name: '🖼️ Ícono', value: 'Actualizado', inline: true });
        }
        if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
            changes.push({ name: '🎨 Banner', value: 'Actualizado', inline: true });
        }
        if (oldGuild.description !== newGuild.description) {
            changes.push({ name: '📋 Descripción', value: `${newGuild.description || '*eliminada*'}`.slice(0, 512), inline: false });
        }
        if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
            changes.push({ name: '🔒 Nivel de verificación', value: `${oldGuild.verificationLevel} → ${newGuild.verificationLevel}`, inline: true });
        }
        if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
            changes.push({ name: '🔔 Notificaciones', value: `${oldGuild.defaultMessageNotifications} → ${newGuild.defaultMessageNotifications}`, inline: true });
        }
        if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
            changes.push({ name: '🔞 Filtro explícito', value: `${oldGuild.explicitContentFilter} → ${newGuild.explicitContentFilter}`, inline: true });
        }

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('⚙️ Servidor modificado')
            .setThumbnail(newGuild.iconURL({ dynamic: true }))
            .addFields(
                { name: '🏠 Servidor', value: newGuild.name, inline: false },
                ...changes,
            )
            .setFooter({ text: `ID: ${newGuild.id}` })
            .setTimestamp();

        await guildLog(client, newGuild.id, embed);
    },
};
