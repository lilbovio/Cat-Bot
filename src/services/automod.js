const GuildConfig = require('../../models/GuildConfig');
const Warn        = require('../../models/WarnSchema');

// Spam detection: track recent messages per user per guild
// Map<`${guildId}:${userId}`, { content: string, timestamps: number[] }>
const spamCache = new Map();
const SPAM_WINDOW_MS  = 8000;  // 8 second window
const SPAM_THRESHOLD  = 5;     // 5 identical messages → spam

// Link regex (matches common URLs)
const LINK_RE    = /https?:\/\/\S+/i;
// Discord invite regex
const INVITE_RE  = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\//i;

/**
 * Checks a message against the automod rules.
 * Deletes the message and applies the configured action if a rule triggers.
 *
 * @param {import('discord.js').Message} message
 */
async function handleAutomod(message) {
    if (!message.guild || message.author.bot) return;

    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    const am = guildConfig?.automod;
    if (!am?.enabled) return;

    // Check exempt channels
    if (am.exemptChannels?.includes(message.channel.id)) return;

    // Check exempt roles
    if (am.exemptRoles?.length) {
        const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member?.roles.cache.some((r) => am.exemptRoles.includes(r.id))) return;
    }

    const content = message.content.toLowerCase();
    let triggered = null;

    // ── Bad words ──────────────────────────────────────────────────────────────
    if (am.badWords?.length) {
        const found = am.badWords.find((w) => content.includes(w.toLowerCase()));
        if (found) triggered = `Palabra prohibida detectada: \`${found}\``;
    }

    // ── Discord invites ────────────────────────────────────────────────────────
    if (!triggered && am.filterInvites && INVITE_RE.test(message.content)) {
        triggered = 'Invitación de Discord detectada';
    }

    // ── External links (but not invites already caught) ────────────────────────
    if (!triggered && am.filterLinks && LINK_RE.test(message.content)) {
        triggered = 'Enlace externo detectado';
    }

    // ── Spam detection ─────────────────────────────────────────────────────────
    if (!triggered && am.filterSpam) {
        const key  = `${message.guild.id}:${message.author.id}`;
        const now  = Date.now();
        const entry = spamCache.get(key) || { content: '', timestamps: [] };

        if (entry.content !== content) {
            // Different message — reset
            spamCache.set(key, { content, timestamps: [now] });
        } else {
            // Same content — add timestamp and prune old ones
            entry.timestamps.push(now);
            entry.timestamps = entry.timestamps.filter((t) => now - t < SPAM_WINDOW_MS);
            spamCache.set(key, entry);

            if (entry.timestamps.length >= SPAM_THRESHOLD) {
                triggered = 'Spam detectado (mensajes repetidos)';
                spamCache.delete(key); // reset after triggering
            }
        }
    }

    if (!triggered) return;

    // ── Apply action ───────────────────────────────────────────────────────────
    await message.delete().catch(() => {});

    const action = am.action || 'delete';
    const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);

    if (action === 'warn' && member) {
        let data = await Warn.findOne({ guildId: message.guild.id, userId: message.author.id });
        if (!data) data = new Warn({ guildId: message.guild.id, userId: message.author.id, warns: [] });
        data.warns.push({ reason: `[Automod] ${triggered}`, moderatorId: message.guild.members.me?.id || 'bot' });
        await data.save();
    }

    if (action === 'timeout' && member) {
        await member.timeout(5 * 60 * 1000, `[Automod] ${triggered}`).catch(() => {}); // 5 minute timeout
    }

    // Notify user via DM (non-critical)
    const actionText = action === 'delete' ? 'eliminado' : action === 'warn' ? 'advertido' : 'silenciado temporalmente';
    message.author.send(
        `🛡️ Tu mensaje en **${message.guild.name}** fue ${actionText}.\n**Razón:** ${triggered}`
    ).catch(() => {});
}

module.exports = { handleAutomod };
