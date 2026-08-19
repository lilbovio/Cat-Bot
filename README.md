# CatBot 🐱

Bot multiusos de Discord en español. Comandos híbridos (con prefijo `!` y con slash `/`), moderación, juegos, actividades y utilidades.

## ✨ Características

- **Comandos híbridos**: todos los comandos funcionan con `/comando` y con `!comando` (prefijo configurable por servidor).
- **Sistema de nivelación**: XP por mensajes con cooldown anti-spam, top 10 y activación por servidor.
- **Sistema AFK**: avisa cuando mencionas a un usuario AFK y elimina el estado al volver.
- **Moderación**: ban, kick, mute con duración, lock/unlock de canales y warns persistentes.
- **Blacklist global** (solo el creador del bot): bloquea a un usuario en todos los servidores.
- **Mensajes de bienvenida** configurables por servidor (canal, mensaje e imagen).
- **Juegos**: blackjack, adivinanza de números, moneda, bola mágica, Pokémon, waifu y más.
- **Actividades** con GIFs: hug, kiss, cuddle, pat, poke, slap, tickle.

## 🚀 Requisitos

- Node.js **18** o superior (probado en 22)
- MongoDB (Atlas o local)
- Un bot creado en el [Discord Developer Portal](https://discord.com/developers/applications)

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia `.env.example` a `.env` y rellena los valores:

```env
TOKEN=               # Token del bot (Portal de Desarrolladores -> Bot -> Reset Token)
CLIENT_ID=           # ID de la aplicación del bot
ADMIN_ID=            # ID del creador del bot (único con acceso a la blacklist)
MONGO_URI=           # Cadena de conexión de MongoDB

# Opcionales (canales con valores por defecto):
SUPPORT_INVITE=      # Invitación al servidor de soporte
STARTUP_CHANNEL=     # Canal que recibe el mensaje "bot encendido"
GUILD_LOG_CHANNEL=   # Canal de logs al añadir el bot a un servidor
ERROR_CHANNEL=       # Canal que recibe errores no controlados
COMPLAINT_CHANNEL=   # Canal de quejas (/queja)
BLACKLIST_LOG_CHANNEL= # Canal de log de la blacklist
```

2. Arranca el bot:

```bash
npm start
```

> **Importante**: nunca subas tu `.env` a Git. Ya está en `.gitignore`.

## 🎯 Comandos

| Categoría | Comandos |
|---|---|
| **Utilidad** | `/help`, `/ping`, `/botinfo`, `/avatar`, `/profilepicture`, `/userinfo`, `/serverinfo`, `/chinfo`, `/math`, `/invite`, `/afk`, `/say`, `/queja` |
| **Juegos** | `/8ball`, `/coin`, `/bj`, `/minigame`, `/howgay`, `/impostor`, `/love`, `/chiste`, `/pokemon`, `/sexualidad`, `/waifu` |
| **Actividades** | `/hug`, `/kiss`, `/cuddle`, `/pat`, `/poke`, `/slap`, `/tickle` |
| **Moderación** | `/ban`, `/kick`, `/mute`, `/lock`, `/unlock`, `/warn`, `/seewarns` |
| **Admin** | `/blacklist` (solo creador), `/leave` (solo creador), `/setprefix`, `/setwelcome`, `/enablelevel`, `/disablelevel`, `/restartlevel`, `/seelevel` |

Usa `/help` en Discord para ver la lista completa por categoría.

## 📁 Estructura

```
index.js               # Punto de entrada (bootstrap)
config.js              # Carga de configuración desde .env
src/
  CommandContext.js    # Contexto unificado (mensaje/interacción)
  commands/            # Comandos organizados por categoría
  events/              # Eventos de Discord
  loaders/             # Carga de comandos, eventos y registro slash
  services/            # Lógica transversal (AFK, nivelación)
  utils/               # Utilidades (cooldowns, permisos, formato)
models/                # Schemas de MongoDB
docs/                  # Documentación y plan de desarrollo
```

## 🧱 Añadir un comando

Crea un archivo en `src/commands/<categoría>/` con esta plantilla:

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'mi_comando',
    description: 'Describe tu comando.',
    category: 'utility',
    cooldown: 3,                       // segundos (opcional)
    permissions: [],                   // permisos requeridos (opcional)
    ownerOnly: false,                  // solo el creador (opcional)
    aliases: ['alias'],                // (opcional)
    data: new SlashCommandBuilder()
        .setName('mi_comando')
        .setDescription('Describe tu comando.'),
    async execute(ctx) {
        await ctx.reply('¡Hola!');
    },
};
```

## 📋 Licencia

ISC
