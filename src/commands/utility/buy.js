const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy  = require('../../../models/Economy');
const ShopItem = require('../../../models/ShopItem');

module.exports = {
    name: 'buy',
    description: 'Compra un artículo de la tienda del servidor.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un artículo de la tienda del servidor.')
        .addStringOption((o) =>
            o.setName('nombre')
                .setDescription('Nombre del artículo que deseas comprar.')
                .setRequired(true)
        ),

    async execute(ctx) {
        const nombre = ctx.getString('nombre')?.trim();
        if (!nombre) return ctx.reply({ content: '❌ Indica el nombre del artículo a comprar.', ephemeral: true });

        const item = await ShopItem.findOne({ guildId: ctx.guild.id, itemName: nombre });
        if (!item) {
            return ctx.reply({ content: `❌ No existe un artículo llamado **${nombre}** en la tienda. Usa \`/shop ver\` para ver los disponibles.`, ephemeral: true });
        }

        // Balance check
        const economy = await Economy.findOne({ guildId: ctx.guild.id, userId: ctx.user.id });
        const balance = economy?.balance ?? 0;
        if (balance < item.price) {
            return ctx.reply({
                content: `❌ No tienes suficientes monedas. Necesitas **${item.price.toLocaleString()}** pero tienes **${balance.toLocaleString()}**.`,
                ephemeral: true,
            });
        }

        // Role check
        const role = ctx.guild.roles.cache.get(item.roleId);
        if (!role) {
            return ctx.reply({ content: '❌ El rol de este artículo ya no existe. Contacta con un administrador.', ephemeral: true });
        }

        const member = ctx.member || await ctx.guild.members.fetch(ctx.user.id).catch(() => null);
        if (!member) return ctx.reply({ content: '❌ No se pudo obtener tu información de miembro.', ephemeral: true });

        if (member.roles.cache.has(role.id)) {
            return ctx.reply({ content: `❌ Ya tienes el rol **${role.name}**.`, ephemeral: true });
        }

        // Deduct balance and grant role
        await Economy.findOneAndUpdate(
            { guildId: ctx.guild.id, userId: ctx.user.id },
            { $inc: { balance: -item.price } }
        );
        await member.roles.add(role).catch(() => {});

        const newBalance = balance - item.price;
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🛒 ¡Compra realizada!')
            .addFields(
                { name: '📦 Artículo',    value: item.itemName,                   inline: true },
                { name: '🎭 Rol obtenido', value: `<@&${role.id}>`,              inline: true },
                { name: '🪙 Gastado',     value: `${item.price.toLocaleString()} monedas`, inline: true },
                { name: '💳 Saldo restante', value: `${newBalance.toLocaleString()} monedas`, inline: true },
            )
            .setTimestamp();

        return ctx.reply({ embeds: [embed] });
    },
};
