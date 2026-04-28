const { run, get, all } = require('../database/db');

function buildFilters({ search, category, status }, baseParams = []) {
  const clauses = [];
  const params = [...baseParams];

  if (search) {
    clauses.push('c.title LIKE ?');
    params.push(`%${search}%`);
  }
  if (category) {
    clauses.push('c.category = ?');
    params.push(category);
  }
  if (status) {
    clauses.push('c.status = ?');
    params.push(status);
  }

  const where = clauses.length ? ` AND ${clauses.join(' AND ')}` : '';
  return { where, params };
}

function createComplaint({ userId, title, category, description }) {
  return run(
    `INSERT INTO complaints (user_id, title, category, description, status, priority)
     VALUES (?, ?, ?, ?, 'Pending', 'Medium')`,
    [userId, title, category, description]
  );
}

function getComplaintById(id) {
  return get('SELECT * FROM complaints WHERE id = ?', [id]);
}

function getStudentComplaints(userId, filters = {}) {
  const { where, params } = buildFilters(filters, [userId]);
  return all(
    `SELECT c.*, u.name AS student_name
     FROM complaints c
     JOIN users u ON c.user_id = u.id
     WHERE c.user_id = ?${where}
     ORDER BY c.created_at DESC`,
    params
  );
}

function getAllComplaints(filters = {}) {
  const { where, params } = buildFilters(filters);
  return all(
    `SELECT c.*, u.name AS student_name, u.email AS student_email
     FROM complaints c
     JOIN users u ON c.user_id = u.id
     WHERE 1 = 1${where}
     ORDER BY c.created_at DESC`,
    params
  );
}

function updateComplaintByStudent(id, userId, { title, category, description }) {
  return run(
    `UPDATE complaints
     SET title = ?, category = ?, description = ?
     WHERE id = ? AND user_id = ?`,
    [title, category, description, id, userId]
  );
}

function updateComplaintByAdmin(id, { status, priority }) {
  return run(
    `UPDATE complaints
     SET status = COALESCE(?, status), priority = COALESCE(?, priority)
     WHERE id = ?`,
    [status || null, priority || null, id]
  );
}

function deleteComplaint(id) {
  return run('DELETE FROM complaints WHERE id = ?', [id]);
}

function getStudentStats(userId) {
  return get(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) AS high_priority
     FROM complaints
     WHERE user_id = ?`,
    [userId]
  );
}

function getAdminStats() {
  return get(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) AS high_priority
     FROM complaints`
  );
}

function getMonthlyComplaintTrend() {
  return all(
    `SELECT
      strftime('%Y-%m', created_at) AS month,
      COUNT(*) AS total
     FROM complaints
     GROUP BY strftime('%Y-%m', created_at)
     ORDER BY month ASC`
  );
}

module.exports = {
  createComplaint,
  getComplaintById,
  getStudentComplaints,
  getAllComplaints,
  updateComplaintByStudent,
  updateComplaintByAdmin,
  deleteComplaint,
  getStudentStats,
  getAdminStats,
  getMonthlyComplaintTrend
};
