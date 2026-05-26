/**
 * Middleware de autenticación - verifica sesión activa
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.rol === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
}

module.exports = { requireAuth, requireAdmin };
