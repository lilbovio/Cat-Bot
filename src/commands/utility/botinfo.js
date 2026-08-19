const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const os = require('os');
const config = require('../../../config');

function getCpuUsage() {
    return new Promise((resolve) => {
        const start = process.cpuUsage();
        setTimeout(() => {
            const diff = process.cpuUsage(start);
            const totalMs = (diff.user + diff.system) / 1000;
            resolve(Math.min(100, (totalMs / 1000) * 100).toFixed(2));
        }, 500);
    });
}

// Build the three tab embeds
function buildEmbeds(client, cpuPercent) {
    const uptime = process.uptime();
    const days    = Math.floor(uptime / 86400);
    const hours   = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
    const usedMemory  = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
    const totalUsers  = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    const base = () =>
        new EmbedBuilder()
            .setColor('Blue')
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

    const general = base()
        .setTitle('🐱 CatBot — Información General')
        .addFields(
            { name: '📛 Tag',           value: client.user.username,                                           inline: true  },
            { name: '👨‍💻 Desarrollador', value: `<@${config.adminID}>`,                                          inline: true  },
            { name: '📚 Librería',       value: 'discord.js v14',                                               inline: true  },
            { name: '📅 Creado el',      value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`,     inline: false },
            { name: '🌐 Invítame',       value: `[Añadir a tu servidor](https://discord.com/oauth2/authorize)`, inline: false },
        );

    const stats = base()
        .setTitle('📊 CatBot — Estadísticas')
        .addFields(
            { name: '🏠 Servidores', value: `${client.guilds.cache.size}`,   inline: true },
            { name: '📺 Canales',    value: `${client.channels.cache.size}`, inline: true },
            { name: '👤 Usuarios',   value: `${totalUsers}`,                 inline: true },
            { name: '⚙️ Comandos',   value: `${client.commands.size}`,       inline: true },
        );

    const technical = base()
        .setTitle('🔧 CatBot — Información Técnica')
        .addFields(
            { name: '📡 Ping',    value: `${client.ws.ping} ms`,                       inline: true  },
            { name: '⏱️ Uptime',  value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true  },
            { name: '🖥️ CPU',     value: os.cpus()[0].model,                           inline: false },
            { name: '📈 Uso CPU', value: `${cpuPercent}%`,                             inline: true  },
            { name: '💾 RAM',     value: `${usedMemory} MB / ${totalMemory} MB`,       inline: true  },
            { name: '🟢 Node.js', value: process.version,                              inline: true  },
        );

    return { general, stats, technical };
}

const TAB_IDS = ['botinfo_general', 'botinfo_stats', 'botinfo_tech'];

function buildRow(active) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('botinfo_general')
            .setLabel('📋 General')
            .setStyle(active === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(active === 0),
        new ButtonBuilder()
            .setCustomId('botinfo_stats')
            .setLabel('📊 Stats')
            .setStyle(active === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(active === 1),
        new ButtonBuilder()
            .setCustomId('botinfo_tech')
            .setLabel('🔧 Técnico')
            .setStyle(active === 2 ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(active === 2),
    );
}

module.exports = {
    name: 'botinfo',
    description: 'Muestra información detallada del bot.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Muestra información detallada del bot.'),
    async execute(ctx) {
        await ctx.defer();
        const cpuPercent = await getCpuUsage();
        const embeds = buildEmbeds(ctx.client, cpuPercent);
        const embedArr = [embeds.general, embeds.stats, embeds.technical];

        // Prefix: just send the three embeds stacked (no buttons)
        if (!ctx.isSlash) {
            return ctx.edit({ embeds: [embeds.general, embeds.stats, embeds.technical] });
        }

        let active = 0;
        const msg = await ctx.edit({ embeds: [embedArr[active]], components: [buildRow(active)] });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id && TAB_IDS.includes(i.customId),
            time: 120_000,
        });

        collector.on('collect', async (i) => {
            active = TAB_IDS.indexOf(i.customId);
            await i.update({ embeds: [embedArr[active]], components: [buildRow(active)] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    },
};
