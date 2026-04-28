const bcrypt = require('bcryptjs');
const { run, get } = require('./db');

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')) DEFAULT 'student'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      priority TEXT NOT NULL DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureActivityLogUserColumn() {
  try {
    await run('ALTER TABLE activity_logs ADD COLUMN user_id INTEGER');
  } catch (error) {
    if (!String(error?.message || '').toLowerCase().includes('duplicate column')) {
      throw error;
    }
  }
}

async function seedAdmin() {
  const adminEmail = 'admin@campus.com';
  const existingAdmin = await get('SELECT id FROM users WHERE email = ?', [adminEmail]);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Campus Admin', adminEmail, hashedPassword, 'admin']
    );
    await run('INSERT INTO activity_logs (action, user_id) VALUES (?, ?)', ['Seeded default admin account', null]);
  }
}

async function seedDemoData() {
  const complaintCount = await get('SELECT COUNT(*) AS count FROM complaints');
  if ((complaintCount?.count || 0) > 0) {
    return;
  }

  const demoStudents = [
    { name: 'Aarav Sharma', email: 'aarav.ece@campus.com' },
    { name: 'Diya Patel', email: 'diya.ece@campus.com' },
    { name: 'Rohan Verma', email: 'rohan.ece@campus.com' },
    { name: 'Sneha Iyer', email: 'sneha.ece@campus.com' }
  ];

  const studentIds = [];

  for (const student of demoStudents) {
    const existing = await get('SELECT id FROM users WHERE email = ?', [student.email]);
    if (existing) {
      studentIds.push(existing.id);
      continue;
    }

    const hashedPassword = await bcrypt.hash('student123', 10);
    const created = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [student.name, student.email, hashedPassword, 'student']
    );
    studentIds.push(created.id);
  }

  const demoComplaints = [
    {
      userIdx: 0,
      title: 'Classroom C-204 fan not working',
      category: 'Electrical',
      description: 'Ceiling fan in Classroom C-204 is non-functional during afternoon lectures.',
      status: 'Pending',
      priority: 'High',
      createdAt: '2026-01-08 10:15:00'
    },
    {
      userIdx: 1,
      title: 'WiFi dead zone near ECE Lab 2',
      category: 'WiFi / Network',
      description: 'Very weak WiFi signal and frequent disconnections near ECE Lab 2 corridor.',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2026-01-19 14:25:00'
    },
    {
      userIdx: 2,
      title: 'Oscilloscope channel B not responding',
      category: 'Lab Equipment',
      description: 'Digital oscilloscope in Lab Bench 7 has channel B permanently stuck at zero.',
      status: 'Pending',
      priority: 'Medium',
      createdAt: '2026-02-02 11:40:00'
    },
    {
      userIdx: 3,
      title: 'Hostel Block A water leakage',
      category: 'Hostel',
      description: 'Leakage from washroom ceiling in Hostel Block A, second floor.',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2026-02-11 08:55:00'
    },
    {
      userIdx: 0,
      title: 'Dust accumulation in DSP lab',
      category: 'Cleanliness',
      description: 'DSP lab floor and desks need deep cleaning before practical sessions.',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '2026-02-26 16:20:00'
    },
    {
      userIdx: 1,
      title: 'Projector blur in Smart Classroom S-102',
      category: 'Classroom',
      description: 'Projector image in S-102 is blurry and unreadable from back rows.',
      status: 'Pending',
      priority: 'Medium',
      createdAt: '2026-03-05 09:30:00'
    },
    {
      userIdx: 2,
      title: 'MATLAB license activation issue',
      category: 'Other',
      description: 'Lab systems show license validation error while launching MATLAB.',
      status: 'Resolved',
      priority: 'Medium',
      createdAt: '2026-03-15 13:10:00'
    },
    {
      userIdx: 3,
      title: 'Corridor lights flickering outside Lab 1',
      category: 'Electrical',
      description: 'Three tube lights flicker continuously near ECE Lab 1 corridor.',
      status: 'In Progress',
      priority: 'Low',
      createdAt: '2026-03-23 18:00:00'
    },
    {
      userIdx: 0,
      title: 'Internet outage during evening hours',
      category: 'WiFi / Network',
      description: 'Campus WiFi drops every evening around 7 PM in academic block.',
      status: 'Pending',
      priority: 'High',
      createdAt: '2026-04-01 19:05:00'
    },
    {
      userIdx: 1,
      title: 'Function generator calibration needed',
      category: 'Lab Equipment',
      description: 'Function generator in Communications Lab gives incorrect frequency output.',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '2026-04-09 12:45:00'
    },
    {
      userIdx: 2,
      title: 'Mess area hygiene concern in hostel',
      category: 'Hostel',
      description: 'Hostel mess serving counter needs regular sanitization and cleanup.',
      status: 'Pending',
      priority: 'Medium',
      createdAt: '2026-04-18 07:50:00'
    },
    {
      userIdx: 3,
      title: 'Whiteboard marker trays broken in D-301',
      category: 'Classroom',
      description: 'Both marker trays are broken in D-301 and markers keep falling.',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '2026-04-23 15:35:00'
    }
  ];

  for (const item of demoComplaints) {
    await run(
      `INSERT INTO complaints (user_id, title, category, description, status, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentIds[item.userIdx],
        item.title,
        item.category,
        item.description,
        item.status,
        item.priority,
        item.createdAt
      ]
    );
  }

  await run('INSERT INTO activity_logs (action, user_id) VALUES (?, ?)', [
    'Seeded demo students and dummy complaints',
    null
  ]);
}

async function initializeDatabase() {
  await createTables();
  await ensureActivityLogUserColumn();
  await seedAdmin();
  await seedDemoData();
}

module.exports = {
  initializeDatabase
};
