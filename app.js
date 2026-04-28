const express = require('express');
const path = require('path');
const session = require('express-session');

const { initializeDatabase } = require('./database/init');

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'campus-portal-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
      httpOnly: true
    }
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', pageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'Campus Portal API is running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Campus Portal running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
