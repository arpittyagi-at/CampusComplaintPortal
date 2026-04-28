const express = require('express');
const path = require('path');
const session = require('express-session');
const { run, get } = require('./database/db');

const { initializeDatabase, cleanupExpiredSessions } = require('./database/init');

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Custom SQLite Session Store
class SQLiteSessionStore extends session.Store {
  async get(sid, callback) {
    try {
      const row = await get(
        'SELECT data FROM sessions WHERE sid = ? AND expires > ?',
        [sid, Date.now()]
      );
      if (!row) {
        return callback(null, null);
      }
      callback(null, JSON.parse(row.data));
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, sess, callback) {
    try {
      const expires = sess.cookie.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 1000 * 60 * 60 * 8;
      await run(
        'INSERT OR REPLACE INTO sessions (sid, data, expires) VALUES (?, ?, ?)',
        [sid, JSON.stringify(sess), expires]
      );
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await run('DELETE FROM sessions WHERE sid = ?', [sid]);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async clear(callback) {
    try {
      await run('DELETE FROM sessions');
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

const sessionStore = new SQLiteSessionStore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: sessionStore,
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
    
    // Clean up expired sessions every hour
    setInterval(cleanupExpiredSessions, 1000 * 60 * 60);
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
