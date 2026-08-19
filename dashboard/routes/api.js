const express     = require('express');
const axios       = require('axios');
const router      = express.Router();
const requireAuth = require('../middleware/requireAuth');
const GuildConfig = require('../../models/GuildConfig');
const UserLevel   = require('../../models/UserLevel');
const Warn        = require('../../models/WarnSchema');
const Blacklist   = require('../../models/Blacklist');
const Economy     = require('../../models/Economy');
const ShopItem    = require('../../models/ShopItem');
const Ticket      = require('../../models/Ticket');
const config      = require('../../config');
const os          = require('os');

// Shared helper — fetch Discord API with the user's access_token stored in session
function discordAPI(accessToken, path) {
    return axios.get(`https://discord.com/api/v10${path}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    }).then(r => r.data);
}

// Bit flag for MANAGE_GUILD permission
const MANAGE_GUILD = 0x20;

// ── GET /api/guilds ──────────────────────────────────────────────────────────
// Returns guilds where the user has ManageGuild AND the bot is present.
router.get('/guilds', requireAuth, async (req, res) => {
    try {
        const guilds = await discordAPI(req.user.accessToken, '/users/@me/guilds');
        // Only guilds where the user can manage
        const managed = guilds.filter(g => (parseInt(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD);

        // Cross-reference with bot's guild cache (passed via app.locals)
        const botGuilds = req.app.locals.client?.guilds.cache;
        const result = managed.map(g => ({
            id:   g.id,
            name: g.name,
            icon: g.icon
                ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
                : null,
            botPresent: botGuilds ? botGuilds.has(g.id) : false,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Middleware: verify user manages this guild ────────────────────────────────
async function requireGuildAccess(req, res, next) {
    const { guildId } = req.params;
    try {
        const guilds = await discordAPI(req.user.accessToken, '/users/@me/guilds');
        const guild  = guilds.find(g => g.id === guildId);
        if (!guild || (parseInt(guild.permissions) & MANAGE_GUILD) !== MANAGE_GUILD) {
            return res.status(403).json({ error: 'Sin acceso a este servidor' });
        }
        req.targetGuild = guild;
        next();
    } catch {
        res.status(403).json({ error: 'No se pudo verificar el acceso' });
    }
}

// ── GET /api/guilds/:guildId/info ────────────────────────────────────────────
router.get('/guilds/:guildId/info', requireAuth, requireGuildAccess, async (req, res) => {
    const { guildId } = req.params;
    const botGuild = req.app.locals.client?.guilds.cache.get(guildId);
    if (!botGuild) return res.status(404).json({ error: 'El bot no está en este servidor' });

    await botGuild.members.fetch().catch(() => {});
    const channels = botGuild.channels.cache
        .filter(c => c.type === 0)
        .map(c => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const roles = botGuild.roles.cache
        .filter(r => r.id !== botGuild.id && !r.managed)
        .map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
        .sort((a, b) => b.position - a.position);

    res.json({
        id:          botGuild.id,
        name:        botGuild.name,
        icon:        botGuild.iconURL({ dynamic: true }),
        memberCount: botGuild.memberCount,
        channels,
        roles,
    });
});

// ── GET /api/guilds/:guildId/config ──────────────────────────────────────────
router.get('/guilds/:guildId/config', requireAuth, requireGuildAccess, async (req, res) => {
    const cfg = await GuildConfig.findOne({ guildId: req.params.guildId }) || {};
    res.json({
        prefix:          cfg.prefix          ?? '!',
        welcomeChannel:  cfg.welcomeChannel  ?? null,
        welcomeMessage:  cfg.welcomeMessage  ?? null,
        welcomeImage:    cfg.welcomeImage    ?? null,
        logsChannel:     cfg.logsChannel     ?? null,
        autoRole:        cfg.autoRole        ?? null,
        levelingEnabled: cfg.levelingEnabled ?? true,
    });
});

// ── PATCH /api/guilds/:guildId/config ────────────────────────────────────────
router.patch('/guilds/:guildId/config', requireAuth, requireGuildAccess, async (req, res) => {
    const allowed = [
        'prefix','welcomeChannel','welcomeMessage','welcomeImage','logsChannel','autoRole','levelingEnabled',
        'ticketCategory','ticketLogChannel','supportRole',
    ];
    const update  = {};
    for (const key of allowed) {
        if (key in req.body) update[key] = req.body[key];
    }
    if (update.prefix && (update.prefix.length < 1 || update.prefix.length > 5)) {
        return res.status(400).json({ error: 'El prefijo debe tener entre 1 y 5 caracteres' });
    }
    const cfg = await GuildConfig.findOneAndUpdate(
        { guildId: req.params.guildId },
        update,
        { upsert: true, new: true }
    );
    res.json({ ok: true, config: cfg });
});

// ── GET /api/guilds/:guildId/leaderboard ─────────────────────────────────────
router.get('/guilds/:guildId/leaderboard', requireAuth, requireGuildAccess, async (req, res) => {
    const users = await UserLevel.find({ guildId: req.params.guildId })
        .sort({ xp: -1 })
        .limit(50);

    const botGuild = req.app.locals.client?.guilds.cache.get(req.params.guildId);

    const rows = await Promise.all(users.map(async (u, i) => {
        let username = `Usuario (${u.userId})`;
        let avatar   = null;
        try {
            const member = await botGuild?.members.fetch(u.userId).catch(() => null);
            if (member) {
                username = member.user.username;
                avatar   = member.user.displayAvatarURL({ size: 64 });
            }
        } catch { /* ignore */ }
        return { rank: i + 1, userId: u.userId, username, avatar, level: u.level, xp: u.xp, messages: u.messages };
    }));

    res.json(rows);
});

// ── DELETE /api/guilds/:guildId/leaderboard/:userId ──────────────────────────
router.delete('/guilds/:guildId/leaderboard/:userId', requireAuth, requireGuildAccess, async (req, res) => {
    await UserLevel.deleteOne({ guildId: req.params.guildId, userId: req.params.userId });
    res.json({ ok: true });
});

// ── DELETE /api/guilds/:guildId/leaderboard ──────────────────────────────────
router.delete('/guilds/:guildId/leaderboard', requireAuth, requireGuildAccess, async (req, res) => {
    await UserLevel.deleteMany({ guildId: req.params.guildId });
    res.json({ ok: true });
});

// ── GET /api/guilds/:guildId/warns ───────────────────────────────────────────
router.get('/guilds/:guildId/warns', requireAuth, requireGuildAccess, async (req, res) => {
    const warns = await Warn.find({ guildId: req.params.guildId });
    res.json(warns);
});

// ── DELETE /api/guilds/:guildId/warns/:userId ────────────────────────────────
router.delete('/guilds/:guildId/warns/:userId', requireAuth, requireGuildAccess, async (req, res) => {
    await Warn.findOneAndDelete({ guildId: req.params.guildId, userId: req.params.userId });
    res.json({ ok: true });
});

// ── GET /api/stats ── (owner only) ───────────────────────────────────────────
router.get('/stats', requireAuth, (req, res) => {
    if (req.user.id !== config.adminID) return res.status(403).json({ error: 'Solo el creador' });
    const client = req.app.locals.client;
    if (!client) return res.status(503).json({ error: 'Bot no disponible' });

    const uptime  = process.uptime();
    const used    = process.memoryUsage();
    const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    res.json({
        guilds:     client.guilds.cache.size,
        users:      totalUsers,
        channels:   client.channels.cache.size,
        commands:   client.commands.size,
        ping:       client.ws.ping,
        uptime,
        uptimeStr:  `${Math.floor(uptime/86400)}d ${Math.floor((uptime%86400)/3600)}h ${Math.floor((uptime%3600)/60)}m`,
        ram:        Math.round(used.heapUsed / 1024 / 1024),
        ramTotal:   Math.round(os.totalmem() / 1024 / 1024),
        nodeVersion: process.version,
    });
});

// ── GET /api/blacklist ── (owner only) ───────────────────────────────────────
router.get('/blacklist', requireAuth, async (req, res) => {
    if (req.user.id !== config.adminID) return res.status(403).json({ error: 'Solo el creador' });
    const list = await Blacklist.find();
    res.json(list);
});

// ── POST /api/blacklist ──────────────────────────────────────────────────────
router.post('/blacklist', requireAuth, async (req, res) => {
    if (req.user.id !== config.adminID) return res.status(403).json({ error: 'Solo el creador' });
    const { userId } = req.body;
    if (!userId || !/^\d{15,20}$/.test(userId)) return res.status(400).json({ error: 'ID inválida' });
    const exists = await Blacklist.findOne({ userID: userId });
    if (exists) return res.status(409).json({ error: 'Ya está en la blacklist' });
    await Blacklist.create({ userID: userId });
    res.json({ ok: true });
});

// ── DELETE /api/blacklist/:userId ─────────────────────────────────────────────
router.delete('/blacklist/:userId', requireAuth, async (req, res) => {
    if (req.user.id !== config.adminID) return res.status(403).json({ error: 'Solo el creador' });
    const result = await Blacklist.findOneAndDelete({ userID: req.params.userId });
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
});

// ── GET /api/guilds/:guildId/economy ─────────────────────────────────────────
router.get('/guilds/:guildId/economy', requireAuth, requireGuildAccess, async (req, res) => {
    const top = await Economy.find({ guildId: req.params.guildId }).sort({ balance: -1 }).limit(50);
    const botGuild = req.app.locals.client?.guilds.cache.get(req.params.guildId);
    const rows = await Promise.all(top.map(async (e, i) => {
        let username = `Usuario (${e.userId})`;
        let avatar   = null;
        try {
            const member = await botGuild?.members.fetch(e.userId).catch(() => null);
            if (member) { username = member.user.username; avatar = member.user.displayAvatarURL({ size: 64 }); }
        } catch { /* ignore */ }
        return { rank: i + 1, userId: e.userId, username, avatar, balance: e.balance, streak: e.streak };
    }));
    res.json(rows);
});

// ── GET /api/guilds/:guildId/shop ─────────────────────────────────────────────
router.get('/guilds/:guildId/shop', requireAuth, requireGuildAccess, async (req, res) => {
    const items = await ShopItem.find({ guildId: req.params.guildId }).sort({ price: 1 });
    res.json(items);
});

// ── DELETE /api/guilds/:guildId/shop/:itemName ────────────────────────────────
router.delete('/guilds/:guildId/shop/:itemName', requireAuth, requireGuildAccess, async (req, res) => {
    const result = await ShopItem.findOneAndDelete({ guildId: req.params.guildId, itemName: req.params.itemName });
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
});

// ── GET /api/guilds/:guildId/tickets ─────────────────────────────────────────
router.get('/guilds/:guildId/tickets', requireAuth, requireGuildAccess, async (req, res) => {
    const { status } = req.query; // optional filter: open | closed
    const query = { guildId: req.params.guildId };
    if (status) query.status = status;
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(100).select('-messages');
    res.json(tickets);
});

// ── DELETE /api/guilds/:guildId/tickets/:ticketId ─────────────────────────────
router.delete('/guilds/:guildId/tickets/:ticketId', requireAuth, requireGuildAccess, async (req, res) => {
    const result = await Ticket.findOneAndDelete({ _id: req.params.ticketId, guildId: req.params.guildId });
    if (!result) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
});

// ── GET /api/guilds/:guildId/automod ─────────────────────────────────────────
router.get('/guilds/:guildId/automod', requireAuth, requireGuildAccess, async (req, res) => {
    const cfg = await GuildConfig.findOne({ guildId: req.params.guildId });
    res.json(cfg?.automod || {
        enabled: false, filterLinks: false, filterInvites: false, filterSpam: false,
        badWords: [], action: 'delete', exemptChannels: [], exemptRoles: [],
    });
});

// ── PATCH /api/guilds/:guildId/automod ────────────────────────────────────────
router.patch('/guilds/:guildId/automod', requireAuth, requireGuildAccess, async (req, res) => {
    const allowed = ['enabled','filterLinks','filterInvites','filterSpam','action'];
    const update  = {};
    for (const key of allowed) {
        if (key in req.body) update[`automod.${key}`] = req.body[key];
    }
    await GuildConfig.findOneAndUpdate(
        { guildId: req.params.guildId },
        { $set: update },
        { upsert: true }
    );
    res.json({ ok: true });
});

// ── POST /api/guilds/:guildId/automod/badwords ───────────────────────────────
router.post('/guilds/:guildId/automod/badwords', requireAuth, requireGuildAccess, async (req, res) => {
    const { word } = req.body;
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
        return res.status(400).json({ error: 'Palabra inválida' });
    }
    await GuildConfig.findOneAndUpdate(
        { guildId: req.params.guildId },
        { $addToSet: { 'automod.badWords': word.toLowerCase().trim() } },
        { upsert: true }
    );
    res.json({ ok: true });
});

// ── DELETE /api/guilds/:guildId/automod/badwords/:word ────────────────────────
router.delete('/guilds/:guildId/automod/badwords/:word', requireAuth, requireGuildAccess, async (req, res) => {
    await GuildConfig.findOneAndUpdate(
        { guildId: req.params.guildId },
        { $pull: { 'automod.badWords': req.params.word } }
    );
    res.json({ ok: true });
});

// ── GET /api/servers ── (owner only) ─────────────────────────────────────────
router.get('/servers', requireAuth, async (req, res) => {
    if (req.user.id !== config.adminID) return res.status(403).json({ error: 'Solo el creador' });
    const client = req.app.locals.client;
    if (!client) return res.status(503).json({ error: 'Bot no disponible' });

    // Fetch all guild configs in one query for prefix info
    const guildIds   = [...client.guilds.cache.keys()];
    const configs    = await GuildConfig.find({ guildId: { $in: guildIds } }).lean();
    const configMap  = Object.fromEntries(configs.map(c => [c.guildId, c]));

    const guilds = await Promise.all(client.guilds.cache.map(async g => {
        // Try to resolve owner username from cache, fall back to ID
        let ownerName = g.ownerId;
        try {
            const owner = await g.members.fetch(g.ownerId).catch(() => null);
            if (owner) ownerName = owner.user.username;
        } catch { /* ignore */ }

        const cfg = configMap[g.id];
        return {
            id:          g.id,
            name:        g.name,
            icon:        g.iconURL({ dynamic: true }),
            memberCount: g.memberCount,
            ownerId:     g.ownerId,
            ownerName,
            prefix:      cfg?.prefix ?? '!',
            hasLogs:     !!cfg?.logsChannel,
            hasWelcome:  !!cfg?.welcomeChannel,
            levelingOn:  cfg?.levelingEnabled !== false,
        };
    }));

    res.json(guilds);
});

// ── POST /api/servers/:guildId/leave ── (owner only) ─────────────────────────
router.post('/servers/:guildId/leave', requireAuth, async (req, res) => {
    if (req.user.id !== config.adminID) return res.status(403).json({ error: 'Solo el creador' });
    const client = req.app.locals.client;
    if (!client) return res.status(503).json({ error: 'Bot no disponible' });

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Servidor no encontrado en la caché del bot' });

    try {
        await guild.leave();
        res.json({ ok: true, name: guild.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
