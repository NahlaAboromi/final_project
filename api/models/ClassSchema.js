//C:\Users\n0502\OneDrive\שולחן העבודה\final_project-main\final_project-main\api\models\ClassSchema.js
const mongoose = require('mongoose');

// Schema for a single student's answer
const StudentAnswerSchema = new mongoose.Schema({
  studentId: { type: String, ref: 'Student' }, // ID of the student
  answerText: { type: String },                // The text of the student's answer
  analysisResult: { type: Object },            // Analysis result (e.g., CASSEL analysis)
  submittedAt: { type: Date, default: Date.now } // Timestamp of when the answer was submitted
});
const SkillSuggestionAnswerSchema = new mongoose.Schema({
  studentId: { type: String, ref: 'Student', required: true },
  classCode: { type: String, required: true },
  clusterCode: { type: String, required: true },
  clusterName: { type: String },
  answerText: { type: String, required: true },
  analysisResult: { type: Object },
  submittedAt: { type: Date, default: Date.now }
}, { _id: true });
const StudentRosterSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  fullName: { type: String, required: true },
  department: { type: String },
  email: { type: String }
}, { _id: false });

const LearningClusterStudentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  profilePic: { type: String }
}, { _id: false });

const LearningClusterSchema = new mongoose.Schema({
  clusterCode: { type: String, required: true },
  clusterName: { type: String, required: true },
  caselDomain: { type: String, required: true },

  students: {
    type: [LearningClusterStudentSchema],
    default: []
  },

  suggestedScenario: { type: String },
  scenarioQuestion: { type: String },
  aiReason: { type: String },

  status: { type: String, default: 'active' },
  approvedBy: { type: String, ref: 'Teacher' },
  approvedAt: { type: Date, default: Date.now }
}, { _id: true });
const ClassAIChatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['teacher', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });
// Schema for a class
const ClassSchema = new mongoose.Schema({
  classCode: { type: String, required: true, unique: true }, // Unique code for the class
  className: { type: String, required: true },               // Name of the class
  subject: { type: String, required: true },                 // Subject of the class
  situation: { type: String, required: true },               // Situation/context for the question
  question: { type: String, required: true },                // Main question for the class
  createdBy: { type: String, ref: 'Teacher', required: true }, // ID of the teacher who created the class
  createdAt: { type: Date, default: Date.now },              // Timestamp of class creation
studentRoster: {
  type: [StudentRosterSchema],
  required: true,
  validate: {
    validator: function(value) {
      return Array.isArray(value) && value.length > 0;
    },
    message: 'Student roster is required'
  }
},
  // Array of student answers
  // Array of student answers
students: [StudentAnswerSchema],

// Approved learning clusters inside this class
learningClusters: {
  type: [LearningClusterSchema],
  default: []
},

skillSuggestionAnswers: {
  type: [SkillSuggestionAnswerSchema],
  default: []
},

classAIChat: {
  type: [ClassAIChatMessageSchema],
  default: []
}
});

// Method to count how many times a specific student submitted answers in this class
ClassSchema.methods.getStudentAnswerCount = function(studentId) {
  return this.students.filter(s => s.studentId === studentId).length;
};

module.exports = mongoose.model('Class', ClassSchema);
