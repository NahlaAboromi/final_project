const express = require('express');
const router = express.Router();
const studentNotification = require('../models/StudentNotificationSchema');
const HebrewStudentNotification = require('../models/HebrewStudentNotification');
// Create a new notification
router.post('/create', async (req, res) => {
  try {
    const { studentId, type, title, content, time, read } = req.body;

    const newNotification = new studentNotification({
      studentId,
      type,
      title,
      content,
      time,
      read
    });

    await newNotification.save();

    res.status(201).json({ message: '✅ Notification created successfully', notification: newNotification });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Create a new Hebrew notification
router.post('/create-hebrew', async (req, res) => {
  try {
    const { studentId, type, title, content, time, read } = req.body;

    const newHebrewNotification = new HebrewStudentNotification({
      studentId,
      type,
      title,
      content,
      time,
      read
    });

    await newHebrewNotification.save();

    res.status(201).json({
      message: '✅ Hebrew notification created successfully',
      notification: newHebrewNotification
    });
  } catch (error) {
    console.error('❌ Error creating Hebrew notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all notifications for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const englishNotifications = await studentNotification.find({ studentId });
    const hebrewNotifications = await HebrewStudentNotification.find({ studentId });

    res.status(200).json({
      en: englishNotifications,
      he: hebrewNotifications
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/mark-as-read/:notificationId', async (req, res) => {
  try {
    const { studentId, type, time } = req.body;

    await studentNotification.findOneAndUpdate(
      { studentId, type, time },
      { read: true }
    );

    await HebrewStudentNotification.findOneAndUpdate(
      { studentId, type, time },
      { read: true }
    );

    res.status(200).json({ message: 'Notification marked as read in EN and HE' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Mark all notifications as read for a specific student
router.patch('/mark-all-as-read/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    await studentNotification.updateMany({ studentId, read: false }, { read: true });
    await HebrewStudentNotification.updateMany({ studentId, read: false }, { read: true });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
