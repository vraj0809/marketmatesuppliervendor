function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  next();
}

function authenticateToken(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { requireLogin, authenticateToken };
