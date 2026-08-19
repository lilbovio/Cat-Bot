const {
    SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits,
    ActionRowBuilder, StringSelectMenuBuilder,
} = require('discord.js');
const Economy  = require('../../../models/Economy');
const ShopItem = require('../../../models/ShopItem');

module.exports = {
    name: 'shop',
    description: 'Muestra la tienda de roles comprables con monedas.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra la tienda de roles comprables.')
        // admin subcommands
        .addSubcommand((sub) =>
            sub.setName('ver')
                .setDescription('Muestra los artículos disponibles en la tienda.')
        )
        .addSubcommand((sub) =>
            sub.setName('añadir')
                .setDescription('Añade un rol a la tienda (admin).')
                .addStringOption((o) => o.setName('nombre').setDescription('Nombre del artículo.').setRequired(true))
                .addRoleOption((o)   => o.setName('rol').setDescription('Rol que se otorgará.').setRequired(true))
                .addIntegerOption((o) => o.setName('precio').setDescription('Precio en monedas.').setRequired(true).setMinValue(1))
        )
        .addSubcommand((sub) =>
            sub.setName('eliminar')
                .setDescription('Elimina un artículo de la tienda (admin).')
                .addStringOption((o) => o.setName('nombre').setDescription('Nombre del artículo a eliminar.').setRequired(true))
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand() || 'ver';

        // ── ver ──────────────────────────────────────────────────────────────
        if (sub === 'ver') {
            const items = await ShopItem.find({ guildId: ctx.guild.id }).sort({ price: 1 });
            if (!items.length) {
                return ctx.reply({ content: '🏪 La tienda está vacía. Un administrador puede añadir artículos con `/shop añadir`.', ephemeral: true });
            }

            const economy = await Economy.findOne({ guildId: ctx.guild.id, userId: ctx.user.id });
            const balance = economy?.balance ?? 0;

            const embed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle(`🏪 Tienda de ${ctx.guild.name}`)
                .setDescription(
                    items.map((i) => {
                        const role     = ctx.guild.roles.cache.get(i.roleId);
                        const roleName = role ? `<@&${i.roleId}>` : `~~Rol eliminado~~`;
                        const canBuy   = balance >= i.price ? '✅' : '❌';
                        return `${canBuy} **${i.itemName}** — ${roleName} — \`${i.price.toLocaleString()} monedas\``;
                    }).join('\n')
                )
                .setFooter({ text: `Tu saldo: ${balance.toLocaleString()} monedas · Usa /buy <nombre> para comprar` })
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        // ── añadir / eliminar — requieren ManageRoles ────────────────────────
        if (!ctx.member?.permissions?.has(PermissionFlagsBits.ManageRoles)) {
            return ctx.reply({ content: '❌ Necesitas el permiso **Gestionar Roles** para administrar la tienda.', ephemeral: true });
        }

        if (sub === 'añadir') {
            const nombre = ctx.getString('nombre')?.trim();
            const role   = ctx.getRole('rol');
            const precio = ctx.getInteger('precio');

            if (!nombre || !role || !precio) return ctx.reply({ content: '❌ Faltan argumentos.', ephemeral: true });

            const existing = await ShopItem.findOne({ guildId: ctx.guild.id, itemName: nombre });
            if (existing) return ctx.reply({ content: `❌ Ya existe un artículo llamado **${nombre}**.`, ephemeral: true });

            await ShopItem.create({ guildId: ctx.guild.id, itemName: nombre, price: precio, roleId: role.id });

            return ctx.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('✅ Artículo añadido a la tienda')
                    .addFields(
                        { name: '📦 Nombre',  value: nombre,                           inline: true },
                        { name: '🎭 Rol',     value: `<@&${role.id}>`,                 inline: true },
                        { name: '🪙 Precio',  value: `${precio.toLocaleString()} monedas`, inline: true },
                    )
                    .setTimestamp()],
            });
        }

        if (sub === 'eliminar') {
            const nombre = ctx.getString('nombre')?.trim();
            const result = await ShopItem.findOneAndDelete({ guildId: ctx.guild.id, itemName: nombre });
            if (!result) return ctx.reply({ content: `❌ No existe un artículo llamado **${nombre}**.`, ephemeral: true });
            return ctx.reply({ content: `✅ El artículo **${nombre}** ha sido eliminado de la tienda.` });
        }
    },
};
