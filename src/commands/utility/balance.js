const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy = require('../../../models/Economy');

module.exports = {
    name: 'balance',
    description: 'Muestra tu saldo de monedas (o el de otro usuario) en este servidor.',
    category: 'utility',
    cooldown: 5,
    aliases: ['bal', 'coins'],
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu saldo de monedas en este servidor.')
        .addUserOption((o) =>
            o.setName('usuario')
                .setDescription('Usuario a consultar (por defecto: tú).')
                .setRequired(false)
        ),

    async execute(ctx) {
        const target  = (await ctx.getUser('usuario')) || ctx.user;
        const economy = await Economy.findOne({ guildId: ctx.guild.id, userId: target.id });
        const balance = economy?.balance ?? 0;

        // Server rank by balance
        const topList = await Economy.find({ guildId: ctx.guild.id }).sort({ balance: -1 });
        const rankPos = topList.findIndex((e) => e.userId === target.id) + 1;
        const rankStr = rankPos > 0 ? `#${rankPos} de ${topList.length}` : 'Sin clasificar';

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
            .setTitle('💳 Saldo de monedas')
            .addFields(
                { name: '🪙 Monedas',    value: `**${balance.toLocaleString()}**`,  inline: true },
                { name: '🏆 Ranking',    value: rankStr,                             inline: true },
                { name: '🔥 Racha',      value: `${economy?.streak ?? 0} día${(economy?.streak ?? 0) !== 1 ? 's' : ''}`, inline: true },
            )
            .setThumbnail(target.displayAvatarURL({ size: 128 }))
            .setTimestamp();

        return ctx.reply({ embeds: [embed] });
    },
};
