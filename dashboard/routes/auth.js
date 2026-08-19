const express  = require('express');
const passport = require('passport');
const config   = require('../../config');
const router   = express.Router();

// GET /auth/login — redirect to Discord OAuth2
router.get('/login', passport.authenticate('discord'));

// GET /auth/callback — Discord redirects here after user approves
router.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => res.redirect('/')
);

// GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

// GET /auth/me — return current session user (for the frontend)
router.get('/me', (req, res) => {
    if (!req.isAuthenticated()) return res.json({ user: null });
    const { id, username, discriminator, avatar } = req.user;
    res.json({
        user: {
            id,
            username,
            discriminator,
            avatar,
            isOwner: id === config.adminID,
            avatarUrl: avatar
                ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${Number(discriminator) % 5}.png`,
        },
    });
});

module.exports = router;
