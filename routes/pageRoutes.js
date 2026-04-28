const express = require('express');
const path = require('path');
const { ensureAuthenticated, ensureAdmin, ensureStudent } = require('../middleware/auth');

const router = express.Router();
const viewsDir = path.join(__dirname, '..', 'views');

router.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/dashboard');
  }
  return res.sendFile(path.join(viewsDir, 'login.html'));
});

router.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/dashboard');
  }
  return res.sendFile(path.join(viewsDir, 'signup.html'));
});

router.get('/dashboard', ensureAuthenticated, ensureStudent, (req, res) => {
  return res.sendFile(path.join(viewsDir, 'dashboard.html'));
});

router.get('/admin', ensureAuthenticated, ensureAdmin, (req, res) => {
  return res.sendFile(path.join(viewsDir, 'admin.html'));
});

module.exports = router;
