const { run, get } = require('../database/db');

function createUser({ name, email, password, role = 'student' }) {
  return run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email.toLowerCase(), password, role]
  );
}

function findUserByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
}

function findUserById(id) {
  return get('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
}

function updateUserProfile(id, { name, email }) {
  if (email) {
    return run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email.toLowerCase(), id]);
  }

  return run('UPDATE users SET name = ? WHERE id = ?', [name, id]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile
};
