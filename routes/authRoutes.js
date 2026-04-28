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

    await logActivity(`New student signup: ${email.toLowerCase()}`);

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

    await logActivity(`User login: ${user.email}`);

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
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing && existing.id !== req.session.user.id) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    await updateUserProfile(req.session.user.id, { name, email });
    req.session.user.name = name;
    req.session.user.email = email.toLowerCase();

    await logActivity(`Profile updated: ${email.toLowerCase()}`);

    return res.json({ message: 'Profile updated', user: req.session.user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', ensureAuthenticated, async (req, res) => {
  const userEmail = req.session.user?.email;
  req.session.destroy(async () => {
    if (userEmail) {
      await logActivity(`User logout: ${userEmail}`);
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
