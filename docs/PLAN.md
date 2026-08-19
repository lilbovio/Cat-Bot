# CatBot — Plan de Desarrollo

Documento de referencia para el estado actual del proyecto y las funcionalidades pendientes.

---

## Estado actual (v2.0 — completado)

### Arquitectura
| Componente | Descripción |
|---|---|
| `index.js` | Bootstrap: MongoDB (retry 5×), carga comandos/eventos, inicia dashboard |
| `src/CommandContext.js` | API unificada slash + prefijo para todos los comandos |
| `src/loaders/` | `loadCommands` (recursivo), `loadEvents` (plano), `registerSlashCommands` (por guild) |
| `src/utils/` | `logger`, `format`, `cooldowns`, `permissions`, `activityFactory`, `guildLog` |
| `src/services/` | `leveling` (XP fórmula MEE6), `afk`, `automod` |
| `models/` | `GuildConfig`, `UserLevel`, `WarnSchema`, `Blacklist`, `afkSchema`, `Economy`, `ShopItem`, `Ticket` |

### Comandos (83 total)

| Categoría | Cantidad | Comandos |
|---|---|---|
| **fun** | 21 | 8ball, ascii, bj, chiste, coin, fortune, howgay, impostor, love, meme, minigame, pokemon, reverse, roll, roulette, rps, sexualidad, ship, trivia, waifu, wordcount |
| **activities** | 10 | hug, kiss, cuddle, pat, poke, slap, tickle, bite, highfive, wave |
| **moderation** | 12 | ban, kick, mute, timeout, untimeout, seewarns, clearwarns, warn, unwarn, lock, unlock, slowmode |
| **utility** | 33 | ping, botinfo, avatar, profilepicture, userinfo, serverinfo, chinfo, math, invite, afk, say, queja, help, translate, weather, qr, color, reminder, poll, urban, lyrics, rank, leaderboard, enablelevel, disablelevel, restartlevel, **daily**, **balance**, **pay**, **shop**, **buy**, **ticket** |
| **config** | 7 | setprefix, setwelcome, setlogs, autorole, serverconfig, blacklist (owner), **automod** |

### Eventos (24 total)
`ready`, `guildCreate`, `guildMemberAdd`, `guildMemberRemove`, `guildMemberUpdate`,
`messageCreate` (AFK + leveling + **automod**), `messageUpdate`, `messageDelete`,
`interactionCreate` (**ticket buttons**), `error`,
`channelCreate`, `channelDelete`, `channelUpdate`,
`roleCreate`, `roleDelete`, `roleUpdate`,
`guildBanAdd`, `guildBanRemove`,
`voiceStateUpdate`, `guildUpdate`,
`emojiCreate`, `emojiDelete`,
`inviteCreate`, `inviteDelete`

### Dashboard (web panel — v2.0)
- **Express 5** + **Passport-Discord** (OAuth2)
- Deep dark UI (`#0d0e1a`), Inter font, sidebar con iconos SVG
- **Vista usuario** (13 páginas): Resumen, General, Bienvenidas, Logs, Auto-rol, Nivelación, **Economía**, **Tickets**, **Moderación**, **Automod**
- **Vista owner** (`ADMIN_ID`): Estadísticas globales, lista de servidores, blacklist global
- API REST completa en `/api/` con autenticación por sesión

---

## Fase 3 — Funcionalidades futuras

### 🎵 Música básica
- **`/play <query>`** — Añade canción a la cola (yt-dlp o ytdl-core)
- **`/skip`**, **`/stop`**, **`/queue`**, **`/nowplaying`**
- _Nota_: Requiere `@discordjs/voice` + `ffmpeg`

### 📊 Estadísticas avanzadas de servidor
- **`/stats server`** — Mensajes/día últimos 7 días
- **`/stats user`** — Actividad del usuario (XP, mensajes, warns, economía)
- Requiere `models/MessageLog.js` con TTL de 30 días

### 🌐 Dashboard — Fase 3
| Página nueva | Descripción |
|---|---|
| **Auditoría** | Log de acciones del dashboard (quién cambió qué y cuándo) |
| **Estadísticas avanzadas** | Gráficas de actividad del servidor |

---

## Deuda técnica conocida

| Prioridad | Issue |
|---|---|
| Baja | `passport-discord` v0.1.4 deprecado → migrar a `passport-discord-auth` |
| Media | Sesiones en memoria (Express-Session) → usar `connect-mongo` para persistencia entre reinicios |
| Media | `registerSlashCommands` llama a la REST por cada guild en cada arranque → cachear hash de comandos |
| Alta | `translate.js` usa LibreTranslate público que puede estar caído → añadir instancia propia o cambiar a DeepL free |
| Baja | `lyrics.js` usa API no oficial (lyrist.vercel.app) → puede fallar |
| Baja | Música descartada de la Fase 2 por dependencias complejas (ffmpeg, voice) |

---

## Variables de entorno necesarias

```env
# Bot principal
TOKEN=
CLIENT_ID=
ADMIN_ID=
MONGO_URI=

# Dashboard
CLIENT_SECRET=
SESSION_SECRET=cambia_esto_por_algo_muy_largo_y_aleatorio
DASHBOARD_PORT=3001
DASHBOARD_URL=http://localhost:3001

# Opcionales con defaults
SUPPORT_INVITE=
STARTUP_CHANNEL=
GUILD_LOG_CHANNEL=
ERROR_CHANNEL=
COMPLAINT_CHANNEL=
BLACKLIST_LOG_CHANNEL=

# Economía
DAILY_AMOUNT=100   # Monedas base por /daily (por defecto: 100)
```

---

## Guía rápida para añadir un comando

```js
// src/commands/<categoria>/mi_comando.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'mi_comando',
    description: 'Descripción del comando.',
    category: 'utility',       // fun | activities | moderation | utility | config
    cooldown: 5,               // segundos (opcional)
    permissions: [],           // array de PermissionFlagsBits (opcional)
    ownerOnly: false,          // true = solo el ADMIN_ID puede usarlo
    aliases: ['alias1'],       // solo para prefijo (opcional)
    data: new SlashCommandBuilder()
        .setName('mi_comando')
        .setDescription('Descripción del comando.')
        .addStringOption(o => o.setName('param').setDescription('Parámetro').setRequired(false)),
    async execute(ctx) {
        const valor = ctx.getString('param');
        await ctx.reply(`Valor: ${valor}`);
    },
};
```

El comando se registra automáticamente como slash y como prefijo al reiniciar el bot.
