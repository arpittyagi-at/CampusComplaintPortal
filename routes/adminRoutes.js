const express = require('express');

const {
  getAllComplaints,
  getComplaintById,
  updateComplaintByAdmin,
  deleteComplaint,
  getAdminStats,
  getMonthlyComplaintTrend
} = require('../models/complaintModel');
const { getRecentActivities, logActivity } = require('../models/activityModel');
const { ensureAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(ensureAdmin);

router.get('/complaints', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const complaints = await getAllComplaints({ search, category, status });
    return res.json({ complaints });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

router.put('/complaints/:id', async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const { status, priority } = req.body;

    const validStatus = ['Pending', 'In Progress', 'Resolved'];
    const validPriority = ['Low', 'Medium', 'High'];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (priority && !validPriority.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const complaint = await getComplaintById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    await updateComplaintByAdmin(complaintId, { status, priority });
    await logActivity(
      `Admin ${req.session.user.email} updated complaint #${complaintId} (${status || complaint.status}, ${
        priority || complaint.priority
      })`
    );

    return res.json({ message: 'Complaint updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update complaint' });
  }
});

router.delete('/complaints/:id', async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const complaint = await getComplaintById(complaintId);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    await deleteComplaint(complaintId);
    await logActivity(`Admin ${req.session.user.email} deleted complaint #${complaintId}`);

    return res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await getAdminStats();
    const monthly = await getMonthlyComplaintTrend();
    return res.json({
      stats: {
        total: stats.total || 0,
        pending: stats.pending || 0,
        resolved: stats.resolved || 0,
        high_priority: stats.high_priority || 0
      },
      monthly
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

router.get('/activity/recent', async (req, res) => {
  try {
    const activities = await getRecentActivities(10);
    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

router.get('/complaints/export/csv', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const complaints = await getAllComplaints({ search, category, status });

    const headers = [
      'ID',
      'Student Name',
      'Student Email',
      'Title',
      'Category',
      'Description',
      'Status',
      'Priority',
      'Created At'
    ];

    const rows = complaints.map((item) => [
      item.id,
      item.student_name,
      item.student_email,
      item.title,
      item.category,
      item.description.replace(/\n/g, ' '),
      item.status,
      item.priority,
      item.created_at
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus-complaints.csv"');

    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
