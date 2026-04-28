const { run, all } = require('../database/db');

function logActivity(action, userId = null) {
  return run('INSERT INTO activity_logs (action, user_id) VALUES (?, ?)', [action, userId]);
}

function getRecentActivities(limit = 10) {
  return all(
    'SELECT id, user_id, action, created_at FROM activity_logs ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

function getRecentActivitiesByUser(userId, limit = 10) {
  return all(
    'SELECT id, user_id, action, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
}

module.exports = {
  logActivity,
  getRecentActivities,
  getRecentActivitiesByUser
};
