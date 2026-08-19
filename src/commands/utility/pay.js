const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy = require('../../../models/Economy');

module.exports = {
    name: 'pay',
    description: 'Transfiere monedas a otro usuario de este servidor.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Transfiere monedas a otro usuario.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario que recibirá las monedas.').setRequired(true)
        )
        .addIntegerOption((o) =>
            o.setName('cantidad')
                .setDescription('Cantidad de monedas a transferir.')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(ctx) {
        const target = await ctx.getUser('usuario');
        const amount = ctx.getInteger('cantidad');

        if (!target) return ctx.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });
        if (target.bot)  return ctx.reply({ content: '❌ No puedes transferir monedas a un bot.', ephemeral: true });
        if (target.id === ctx.user.id) return ctx.reply({ content: '❌ No puedes transferirte monedas a ti mismo.', ephemeral: true });
        if (!amount || amount < 1) return ctx.reply({ content: '❌ La cantidad debe ser al menos 1.', ephemeral: true });

        const sender = await Economy.findOne({ guildId: ctx.guild.id, userId: ctx.user.id });
        if (!sender || sender.balance < amount) {
            return ctx.reply({ content: `❌ No tienes suficientes monedas. Tu saldo: **${sender?.balance ?? 0}**.`, ephemeral: true });
        }

        // Atomic transfer
        await Economy.findOneAndUpdate(
            { guildId: ctx.guild.id, userId: ctx.user.id },
            { $inc: { balance: -amount } }
        );
        await Economy.findOneAndUpdate(
            { guildId: ctx.guild.id, userId: target.id },
            { $inc: { balance: amount } },
            { upsert: true }
        );

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('💸 Transferencia realizada')
            .addFields(
                { name: '📤 Emisor',    value: ctx.user.username,   inline: true },
                { name: '📥 Receptor',  value: target.username,     inline: true },
                { name: '🪙 Cantidad',  value: `**${amount.toLocaleString()}** monedas`, inline: false },
                { name: '💳 Tu saldo restante', value: `**${(sender.balance - amount).toLocaleString()}**`, inline: true },
            )
            .setTimestamp();

        return ctx.reply({ embeds: [embed] });
    },
};
