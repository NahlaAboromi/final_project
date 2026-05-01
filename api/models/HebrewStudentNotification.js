const mongoose = require('mongoose');

const HebrewStudentNotificationSchema = new mongoose.Schema({
  studentId: { type: String, required: true },

  type: {
    type: String,
    enum: ['submitted', 'exam', 'export'],
    required: true
  },

  title: { type: String, required: true },
  content: { type: String, required: true },
  time: { type: String, required: true },

  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('HebrewStudentNotification', HebrewStudentNotificationSchema);