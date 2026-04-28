const express = require('express');
const bcrypt = require('bcryptjs');

const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile
} = require('../models/userModel');
const { logActivity } = require('../models/activityModel');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await createUser({ name, email, password: hashedPassword });

    const user = await findUserById(result.id);
    req.session.user = user;

    await logActivity(`New student signup: ${email.toLowerCase()}`, result.id);

    return res.status(201).json({ message: 'Signup successful', user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to signup' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    await logActivity(`User login: ${user.email}`, user.id);

    return res.json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', ensureAuthenticated, (req, res) => {
  return res.json({ user: req.session.user });
});

router.put('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (email && email.toLowerCase() !== req.session.user.email.toLowerCase()) {
      return res.status(400).json({ error: 'Email cannot be changed' });
    }

    await updateUserProfile(req.session.user.id, { name });
    req.session.user.name = name;

    await logActivity(`Profile updated: ${req.session.user.email}`, req.session.user.id);

    return res.json({ message: 'Profile updated', user: req.session.user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', ensureAuthenticated, async (req, res) => {
  const userId = req.session.user?.id || null;
  const userEmail = req.session.user?.email;
  req.session.destroy(async () => {
    if (userEmail) {
      await logActivity(`User logout: ${userEmail}`, userId);
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
