require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express        = require('express');
const session        = require('express-session');
const passport       = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path           = require('path');
const config         = require('../config');

const authRouter = require('./routes/auth');
const apiRouter  = require('./routes/api');

const app = express();

// ── Passport: Discord OAuth2 strategy ────────────────────────────────────────
passport.use(new DiscordStrategy(
    {
        clientID:     config.clientId,
        clientSecret: config.clientSecret,
        callbackURL:  `${config.dashboard.url}/auth/callback`,
        scope:        ['identify', 'guilds'],
    },
    (accessToken, refreshToken, profile, done) => {
        // Attach accessToken to the profile so API routes can use it
        profile.accessToken = accessToken;
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: config.dashboard.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
}));
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/api',  apiRouter);

// ── Static frontend (dashboard/public/) ──────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// SPA catch-all — serve index.html for any non-API route (Express 5 / path-to-regexp v8 syntax)
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
/**
 * Call this from index.js after the Discord client is ready.
 * Pass the client so API routes can query guild/member data.
 *
 * @param {import('discord.js').Client} client
 */
function startDashboard(client) {
    app.locals.client = client;
    const port = config.dashboard.port;
    app.listen(port, () => {
        const logger = require('../src/utils/logger');
        logger.info(`🌐 Dashboard disponible en http://localhost:${port}`);
    });
}

module.exports = { startDashboard };
