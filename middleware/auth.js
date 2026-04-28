function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  return next();
}

function ensureStudent(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(403).json({ error: 'Student access only' });
  }
  return next();
}

function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  return next();
}

module.exports = {
  ensureAuthenticated,
  ensureStudent,
  ensureAdmin
};
