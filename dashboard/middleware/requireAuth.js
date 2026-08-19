/**
 * Express middleware — rejects unauthenticated requests with 401.
 * Used on all /api/* routes.
 */
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'No autenticado' });
}

module.exports = requireAuth;
