const { run, all } = require('../database/db');

function logActivity(action) {
  return run('INSERT INTO activity_logs (action) VALUES (?)', [action]);
}

function getRecentActivities(limit = 10) {
  return all(
    'SELECT id, action, created_at FROM activity_logs ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

module.exports = {
  logActivity,
  getRecentActivities
};
