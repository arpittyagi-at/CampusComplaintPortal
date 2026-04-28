const express = require('express');

const {
  createComplaint,
  getComplaintById,
  getStudentComplaints,
  updateComplaintByStudent,
  deleteComplaint,
  getStudentStats
} = require('../models/complaintModel');
const { getRecentActivities, logActivity } = require('../models/activityModel');
const { ensureStudent } = require('../middleware/auth');

const router = express.Router();

const validCategories = [
  'Electrical',
  'WiFi / Network',
  'Lab Equipment',
  'Hostel',
  'Cleanliness',
  'Classroom',
  'Canteen / Food',
  'Water Supply',
  'Library',
  'Transport',
  'Security',
  'Other'
];

function isValidCategory(category) {
  return validCategories.includes(category);
}

router.use(ensureStudent);

router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const complaints = await getStudentComplaints(req.session.user.id, {
      search,
      category,
      status
    });
    return res.json({ complaints });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({ error: 'Invalid complaint category' });
    }

    const result = await createComplaint({
      userId: req.session.user.id,
      title,
      category,
      description
    });

    await logActivity(`Complaint created by ${req.session.user.email}: #${result.id}`);

    return res.status(201).json({ message: 'Complaint submitted', id: result.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create complaint' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({ error: 'Invalid complaint category' });
    }

    const complaint = await getComplaintById(complaintId);
    if (!complaint || complaint.user_id !== req.session.user.id) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.status === 'Resolved') {
      return res.status(400).json({ error: 'Resolved complaints cannot be edited' });
    }

    await updateComplaintByStudent(complaintId, req.session.user.id, {
      title,
      category,
      description
    });

    await logActivity(`Complaint updated by ${req.session.user.email}: #${complaintId}`);

    return res.json({ message: 'Complaint updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update complaint' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const complaint = await getComplaintById(complaintId);

    if (!complaint || complaint.user_id !== req.session.user.id) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (complaint.status === 'Resolved') {
      return res.status(400).json({ error: 'Resolved complaints cannot be deleted' });
    }

    await deleteComplaint(complaintId);
    await logActivity(`Complaint deleted by ${req.session.user.email}: #${complaintId}`);

    return res.json({ message: 'Complaint deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await getStudentStats(req.session.user.id);
    return res.json({
      stats: {
        total: stats.total || 0,
        pending: stats.pending || 0,
        resolved: stats.resolved || 0,
        high_priority: stats.high_priority || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/activity/recent', async (req, res) => {
  try {
    const activities = await getRecentActivities(8);
    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

module.exports = router;
