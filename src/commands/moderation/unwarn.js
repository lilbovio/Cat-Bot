const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Warn = require('../../../models/WarnSchema');

module.exports = {
    name: 'unwarn',
    description: 'Elimina un warn específico de un usuario por su número.',
    category: 'moderation',
    cooldown: 3,
    permissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Elimina un warn específico de un usuario por su número.')
        .addUserOption((o) => o.setName('usuario').setDescription('Usuario al que eliminar el warn.').setRequired(true))
        .addIntegerOption((o) =>
            o.setName('numero').setDescription('Número del warn a eliminar (usa /seewarns para ver la lista).').setRequired(true).setMinValue(1)
        ),
    async execute(ctx) {
        const target = await ctx.getUser('usuario');
        const num    = ctx.getInteger('numero');
        if (!target) return ctx.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });

        const data = await Warn.findOne({ guildId: ctx.guild.id, userId: target.id });
        if (!data || data.warns.length === 0)
            return ctx.reply({ content: `✅ **${target.username}** no tiene warns.`, ephemeral: true });

        if (num > data.warns.length)
            return ctx.reply({ content: `❌ El warn #${num} no existe. Hay ${data.warns.length} warn(s).`, ephemeral: true });

        data.warns.splice(num - 1, 1);
        await data.save();
        await ctx.reply(`✅ Warn #${num} de **${target.username}** eliminado. Warns restantes: **${data.warns.length}**.`);
    },
};
