const express = require('express');
const router = express.Router();
const Class = require('../models/ClassSchema');
const Notification = require('../models/NotificationSchema'); // ✅ מוסיפים ייבוא Notification
const HebrewNotification = require('../models/HebrewNotification'); // ⭐ חדש
const { generateSELGroups } = require('../services/selGroupingService');
const { analyzeStudentResponse } = require('../services/studentAnalysisService');
const Student = require('../models/StudentSchema');
const claudeService = require('../services/claudeService');
//  Create a new class
router.post('/create', async (req, res) => {
  try {
    const { classCode, className, subject, situation, question, createdBy, studentRoster } = req.body;
    // Check if a class with the same code already exists
    const existingClass = await Class.findOne({ classCode });
    if (existingClass) {
      return res.status(400).json({ message: 'Class Code already exists. Please choose a different code.' });
    }
    if (!Array.isArray(studentRoster) || studentRoster.length === 0) {
  return res.status(400).json({
    message: 'Student roster is required before creating a class.'
  });
}
    // Create and save new class
    const newClass = new Class({
      classCode,
      className,
      subject,
      situation,
      question,
      createdBy,
      studentRoster
    });

    await newClass.save();

    res.status(201).json({ 
      message: '✅ Class created successfully', 
      classData: newClass, 
      classId: newClass._id
    });
  } catch (error) {
    console.error('❌ Error creating class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  Get all classes created by a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await Class.find({ createdBy: teacherId });

    const mappedClasses = classes.map(classItem => ({
      id: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdDate: classItem.createdAt,
      status: 'Active',
      active: true,
      students: classItem.students || [],
learningClusters: classItem.learningClusters || []
    }));

    res.status(200).json(mappedClasses);

  } catch (error) {
    console.error('❌ Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit-answer', async (req, res) => {
  console.log('\n==============================');
  console.log('>>> CLASSES /submit-answer HIT');
  console.log('timestamp:', new Date().toISOString());
  const t0 = Date.now();

  try {

    // =====================
    // INPUT
    // =====================

    const { studentId, classCode, answerText } = req.body || {};

    console.group('[STEP 1] INPUT');
    console.log('raw body:', req.body);
    console.log('studentId:', studentId, '| type:', typeof studentId);
    console.log('classCode:', classCode, '| type:', typeof classCode);
    console.log('answerText exists?', !!answerText);
    console.log('answerText length:', (answerText || '').length);
    console.log('answerText preview:', (answerText || '').substring(0, 100));
    console.groupEnd();


    // =====================
    // FIND CLASS
    // =====================

    console.group('[STEP 2] FIND CLASS');

    const classDoc = await Class.findOne({ classCode });

    console.log('classDoc found?', !!classDoc);

    if (classDoc) {
      console.log('classDoc._id:', classDoc._id.toString());
      console.log('classDoc.classCode:', classDoc.classCode);
      console.log('classDoc.createdBy:', classDoc.createdBy);

      console.log('classDoc.situation exists?', !!classDoc.situation);
      console.log('classDoc.question exists?', !!classDoc.question);

      console.log('classDoc.students exists?', Array.isArray(classDoc.students));
      console.log('classDoc.students length:', classDoc.students?.length);
    }

    if (!classDoc) {
      console.warn('⛔ class not found:', classCode);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    console.groupEnd();


    // =====================
    // AI ANALYSIS
    // =====================

    console.group('[STEP 3] AI ANALYSIS');

    console.log('Calling analyzeStudentResponse with:');

    console.log({
      situationLen: classDoc.situation?.length,
      questionLen: classDoc.question?.length,
      studentResponseLen: answerText?.length,
      studentName: studentId
    });

    console.time('[analyzeStudentResponse TIME]');

    const analysisResult = await analyzeStudentResponse({
      situation: classDoc.situation,
      question: classDoc.question,
      studentResponse: answerText,
      studentName: studentId
    });

    console.timeEnd('[analyzeStudentResponse TIME]');

    console.log('analysisResult is null?', analysisResult === null);
    console.log('analysisResult is undefined?', analysisResult === undefined);
    console.log('analysisResult type:', typeof analysisResult);

    if (analysisResult) {

      console.log('analysisResult keys:', Object.keys(analysisResult));

      console.log('analysisResult full object:');
      console.dir(analysisResult, { depth: 10 });

      console.log('analysisResult JSON:');
      console.log(JSON.stringify(analysisResult, null, 2));

    } else {

      console.warn('⚠️ analysisResult returned EMPTY:', analysisResult);

    }

    console.groupEnd();


    // =====================
    // PUSH ANSWER
    // =====================

    console.group('[STEP 4] PUSH ANSWER');

    const beforeLen = Array.isArray(classDoc.students)
      ? classDoc.students.length
      : 'N/A';

    console.log('students length BEFORE push:', beforeLen);

    classDoc.students.push({
      studentId,
      answerText,
      analysisResult,
      submittedAt: new Date()
    });

    console.log('students length AFTER push:', classDoc.students.length);

    console.log('last pushed student object:');
    console.dir(classDoc.students[classDoc.students.length - 1], { depth: 10 });

    console.groupEnd();


    // =====================
    // SAVE
    // =====================

    console.group('[STEP 5] SAVE');

    console.log('Saving classDoc...');

    await classDoc.save();

    console.log('✅ classDoc saved');

    console.groupEnd();


    // =====================
    // VERIFY SAVE
    // =====================

    console.group('[STEP 6] VERIFY FROM DB');

    const verifyDoc = await Class.findOne({ classCode });

    const lastStudent =
      verifyDoc.students[verifyDoc.students.length - 1];

    console.log('Last student from DB:');

    console.dir(lastStudent, { depth: 10 });

    console.log('analysisResult in DB is null?',
      lastStudent.analysisResult === null);

    console.log('analysisResult in DB:',
      lastStudent.analysisResult);

    console.groupEnd();


    // =====================
    // NOTIFICATIONS
    // =====================

    console.group('[STEP 7] NOTIFICATIONS');

    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: `Student ${studentId} submitted an answer in class ${classCode}`,
      time: new Date().toLocaleString(),
      read: false
    });

    await newNotification.save();

    console.log('EN notification saved, id:', newNotification._id.toString());

    const heTitle =
      `הסטודנט/ית ${studentId} הגיש/ה תשובה בכיתה ${classCode}`;

    const newHebrewNotification = new HebrewNotification({
      notificationId: newNotification._id,
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: heTitle,
      read: false
    });

    await newHebrewNotification.save();

    console.log('HE notification saved, id:',
      newHebrewNotification._id.toString());

    console.groupEnd();


    console.log('OK 200. elapsed(ms)=', Date.now() - t0);

    console.log('<<< END /submit-answer');
    console.log('==============================\n');


    res.status(200).json({
      message: 'Answer submitted successfully and notification saved'
    });


  } catch (error) {

    console.error('\n❌❌❌ CRASH IN /submit-answer ❌❌❌');

    console.error('error message:', error?.message);

    console.error('error stack:');
    console.error(error?.stack);

    console.error('elapsed(ms)=', Date.now() - t0);

    console.error('<<< END /submit-answer WITH ERROR');
    console.error('==============================\n');

    res.status(500).json({ message: 'Server error' });

  }
});

//  Get class by class code
router.get('/get-class-by-code', async (req, res) => {
  const t0 = Date.now();
  try {
    const { classCode } = req.query || {};
    console.group('[CLASSES] GET /get-class-by-code');
    console.log('↘ query.classCode:', classCode);

    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode, 'elapsed(ms)=', Date.now() - t0);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentsLen = Array.isArray(classDoc.students) ? classDoc.students.length : 0;
    console.log('students length:', studentsLen);

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json({
      classCode: classDoc.classCode,
      className: classDoc.className,
      subject: classDoc.subject,
      situation: classDoc.situation,
      question: classDoc.question,
      createdBy: classDoc.createdBy,
      students: classDoc.students
    });
  } catch (error) {
    console.error('❌ [get-class-by-code] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all classes in which a student submitted simulations
router.get('/get-classes-done-simulation/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }
    // Find classes where this student has submitted answers
    const classes = await Class.find({ "students.studentId": studentId });
    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      createdAt: classItem.createdAt,
      students: classItem.students
    }));
    res.status(200).json(mappedClasses);  
  } catch (error) {
    console.error('❌ Error fetching class by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get skill improvement suggestions for a specific student
router.get('/student-skill-suggestions/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const classes = await Class.find({
      'learningClusters.students.id': studentId
    });

    const suggestions = [];

    classes.forEach((classItem) => {
      const clusters = classItem.learningClusters || [];

      clusters.forEach((cluster) => {
        const belongsToStudent = cluster.students?.some(
          (student) => student.id === studentId
        );

        if (belongsToStudent) {
          const existingAnswer = classItem.skillSuggestionAnswers?.find(
  ans =>
    ans.studentId === studentId &&
    ans.clusterCode === cluster.clusterCode
);
          suggestions.push({
  classCode: classItem.classCode,
  className: classItem.className,
  subject: classItem.subject,
  clusterCode: cluster.clusterCode,
  clusterName: cluster.clusterName,
  caselDomain: cluster.caselDomain,
  suggestedScenario: cluster.suggestedScenario,
  scenarioQuestion: cluster.scenarioQuestion,
  aiReason: cluster.aiReason,
  status: cluster.status,
  alreadySolved: !!existingAnswer,
  answer: existingAnswer
  ? {
      ...existingAnswer.toObject(),
      situation: cluster.suggestedScenario,
      question: cluster.scenarioQuestion
    }
  : null
});
        }
      });
    });

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('❌ Error fetching student skill suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/submit-skill-suggestion-answer', async (req, res) => {
  try {
    const { studentId, classCode, clusterCode, clusterName, answerText } = req.body;

    if (!studentId || !classCode || !clusterCode || !answerText) {
      return res.status(400).json({
        message: 'studentId, classCode, clusterCode and answerText are required'
      });
    }

    const classDoc = await Class.findOne({ classCode });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const cluster = classDoc.learningClusters?.find(
      c => c.clusterCode === clusterCode
    );

    if (!cluster) {
      return res.status(404).json({ message: 'Learning cluster not found' });
    }

    const analysisResult = await analyzeStudentResponse({
      situation: cluster.suggestedScenario,
      question: cluster.scenarioQuestion,
      studentResponse: answerText,
      studentName: studentId
    });

const savedAnswer = {
  studentId,
  classCode,
  clusterCode,
  clusterName: clusterName || cluster.clusterName,
  answerText,
  analysisResult,
  submittedAt: new Date(),
  situation: cluster.suggestedScenario,
  question: cluster.scenarioQuestion
};

classDoc.skillSuggestionAnswers.push(savedAnswer);

await classDoc.save();

res.status(200).json({
  message: 'Skill suggestion answer submitted successfully',
  answer: savedAnswer
});

  } catch (error) {
    console.error('❌ Error submitting skill suggestion answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all learning clusters for a specific teacher + class
router.get('/learning-clusters/:teacherId/:classCode', async (req, res) => {
  try {
    const { teacherId, classCode } = req.params;

    if (!teacherId || !classCode) {
      return res.status(400).json({
        message: 'teacherId and classCode are required'
      });
    }

    const classDoc = await Class.findOne({
      classCode,
      createdBy: teacherId
    });

    if (!classDoc) {
      return res.status(404).json({
        message: 'Class not found for this teacher'
      });
    }
const allStudentIds = [
  ...new Set(
    (classDoc.learningClusters || [])
      .flatMap(cluster => (cluster.students || []).map(s => s.id))
      .filter(Boolean)
  )
];

const studentsFromDB = await Student.find(
  { id: { $in: allStudentIds } },
  { id: 1, profilePic: 1 }
).lean();

const imagesMap = {};
studentsFromDB.forEach(student => {
  imagesMap[student.id] = student.profilePic;
});
    const clusters = (classDoc.learningClusters || []).map((cluster) => {
      const answers = (classDoc.skillSuggestionAnswers || []).filter(
        ans => ans.clusterCode === cluster.clusterCode
      );

      const answersWithStudentInfo = answers.map((answer) => {
        const studentFromCluster = cluster.students?.find(
          s => s.id === answer.studentId
        );

        const studentFromRoster = classDoc.studentRoster?.find(
          s => s.studentId === answer.studentId
        );

        return {
          _id: answer._id,
          studentId: answer.studentId,
          id: answer.studentId,
          username:
            studentFromCluster?.name ||
            studentFromRoster?.fullName ||
            answer.studentId,
          fullName:
            studentFromCluster?.name ||
            studentFromRoster?.fullName ||
            answer.studentId,
profilePic: imagesMap[answer.studentId] || null, 
      classCode: answer.classCode,
          clusterCode: answer.clusterCode,
          clusterName: answer.clusterName,
          answerText: answer.answerText,
          analysisResult: answer.analysisResult,
          submittedAt: answer.submittedAt
        };
      });

return {
  cluster: {
    ...cluster.toObject(),
    students: (cluster.students || []).map(s => ({
      ...(s.toObject?.() || s),
      profilePic: imagesMap[s.id] || null
    }))
  },
  answers: answersWithStudentInfo
};
   });

    return res.status(200).json({
      classCode: classDoc.classCode,
      className: classDoc.className,
      subject: classDoc.subject,
      teacherId: classDoc.createdBy,
      clusters
    });

  } catch (error) {
    console.error('❌ Error fetching learning clusters tracking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:classCode/sel-analysis', async (req, res) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    const { classCode } = req.params;

    console.log('\n================ SEL ANALYSIS ROUTE CALLED ================');
    console.log('REQUEST ID:', requestId);
    console.log('TIME:', new Date().toISOString());
    console.log('CLASS CODE:', classCode);
    console.log('METHOD:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('REFERER:', req.headers.referer);
    console.log('USER AGENT:', req.headers['user-agent']);
    console.log('QUERY:', req.query);
    console.log('==========================================================\n');

    const classDoc = await Class.findOne({ classCode });

    if (!classDoc) {
      console.log('❌ CLASS NOT FOUND');
      console.log('REQUEST ID:', requestId);
      return res.status(404).json({ message: 'Class not found' });
    }

    console.log('✅ CLASS FOUND');
    console.log('REQUEST ID:', requestId);
    console.log('CLASS NAME:', classDoc.className);
    console.log('TOTAL ANSWERS:', classDoc.students?.length || 0);
    console.log('ROSTER COUNT:', classDoc.studentRoster?.length || 0);

    const studentsMap = {};

    classDoc.students
      .filter(answer => answer.analysisResult)
      .forEach(answer => {
        if (!studentsMap[answer.studentId]) {
          studentsMap[answer.studentId] = {
            id: answer.studentId,
            name: answer.studentId,
            answers: []
          };
        }

        studentsMap[answer.studentId].answers.push({
          answerText: answer.answerText,
          selScores: {
            selfAwareness:
              answer.analysisResult?.scores?.selfAwareness ??
              answer.analysisResult?.selfAwareness,

            selfManagement:
              answer.analysisResult?.scores?.selfManagement ??
              answer.analysisResult?.selfManagement,

            socialAwareness:
              answer.analysisResult?.scores?.socialAwareness ??
              answer.analysisResult?.socialAwareness,

            relationshipSkills:
              answer.analysisResult?.scores?.relationshipSkills ??
              answer.analysisResult?.relationshipSkills,

            responsibleDecisionMaking:
              answer.analysisResult?.scores?.responsibleDecisionMaking ??
              answer.analysisResult?.responsibleDecisionMaking
          }
        });
      });

    classDoc.studentRoster.forEach(student => {
      if (studentsMap[student.studentId]) {
        studentsMap[student.studentId].name = student.fullName;
      }
    });

    const studentsArray = Object.values(studentsMap);

    console.log('🧑‍🎓 STUDENTS SENT TO AI');
    console.log('REQUEST ID:', requestId);
    console.log('STUDENTS COUNT:', studentsArray.length);
    console.log(
      'STUDENT IDS:',
      studentsArray.map(s => s.id)
    );

    console.log('🚀 ABOUT TO CALL CLAUDE');
    console.log('REQUEST ID:', requestId);

    const aiResult = await generateSELGroups({
      situation: classDoc.situation,
      question: classDoc.question,
      students: studentsArray
    });

    console.log('✅ CLAUDE FINISHED');
    console.log('REQUEST ID:', requestId);
    console.log('GROUPS COUNT:', aiResult.groups?.length || 0);

    const allIds = aiResult.groups.flatMap(group =>
      group.students.map(s => s.id)
    );

    console.log('🖼️ FETCHING STUDENT IMAGES');
    console.log('REQUEST ID:', requestId);
    console.log('IMAGE IDS:', allIds);

    const studentsFromDB = await Student.find(
      { id: { $in: allIds } },
      { id: 1, profilePic: 1 }
    );

    const studentsImagesMap = {};
    studentsFromDB.forEach(s => {
      studentsImagesMap[s.id] = s.profilePic;
    });

    aiResult.groups = aiResult.groups.map(group => ({
      ...group,
      students: group.students.map(student => ({
        ...student,
        profilePic: studentsImagesMap[student.id] || null
      }))
    }));

    console.log('📤 SENDING RESPONSE TO FRONTEND');
    console.log('REQUEST ID:', requestId);

    return res.json(aiResult);

  } catch (err) {
    console.error('❌ SEL ANALYSIS ERROR');
    console.error('REQUEST ID:', requestId);
    console.error(err);

    return res.status(500).json({ message: 'Server error' });
  }
});
// Check if a learning cluster code already exists in a specific class
router.get('/:classCode/check-learning-cluster-code/:clusterCode', async (req, res) => {
  try {
    const { classCode, clusterCode } = req.params;
    const { teacherId } = req.query;

    if (!classCode || !clusterCode || !teacherId) {
      return res.status(400).json({
        message: 'classCode, clusterCode and teacherId are required'
      });
    }

    const normalizedClusterCode = String(clusterCode).trim().toLowerCase();

    const classDoc = await Class.findOne({
      classCode,
      createdBy: teacherId
    });

    if (!classDoc) {
      return res.status(404).json({
        message: 'Class not found for this teacher'
      });
    }

    const exists = classDoc.learningClusters?.some(
      cluster =>
        String(cluster.clusterCode || '').trim().toLowerCase() === normalizedClusterCode
    );

    return res.status(200).json({
      exists,
      available: !exists,
      message: exists
        ? 'Learning cluster code already exists in this class'
        : 'Learning cluster code is available'
    });

  } catch (error) {
    console.error('❌ CHECK LEARNING CLUSTER CODE ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});
router.post('/:classCode/learning-clusters', async (req, res) => {
  try {
    const { classCode } = req.params;

    const {
      teacherId,
      clusterCode,
      clusterName,
      caselDomain,
      students,
      suggestedScenario,
      scenarioQuestion,
      aiReason,
      status
    } = req.body;

    if (!teacherId || !clusterCode || !clusterName || !caselDomain) {
      return res.status(400).json({
        message: 'teacherId, clusterCode, clusterName and caselDomain are required'
      });
    }

    const classDoc = await Class.findOne({
      classCode,
      createdBy: teacherId
    });

    if (!classDoc) {
      return res.status(404).json({
        message: 'Class not found for this teacher'
      });
    }

    const clusterExists = classDoc.learningClusters?.some(
      cluster => cluster.clusterCode === clusterCode
    );

    if (clusterExists) {
      return res.status(400).json({
        message: 'Cluster code already exists in this class'
      });
    }
const studentsForCluster = (students || []).map(student => ({
  id: student.id,
  name: student.name
}));
    classDoc.learningClusters.push({
      clusterCode,
      clusterName,
      caselDomain,
      students: studentsForCluster,
      suggestedScenario,
      scenarioQuestion,
      aiReason,
      status: status || 'active',
      approvedBy: teacherId,
      approvedAt: new Date()
    });

    await classDoc.save();

    return res.status(201).json({
      message: 'Learning cluster saved successfully',
      learningClusters: classDoc.learningClusters
    });

  } catch (err) {
    console.error('❌ SAVE LEARNING CLUSTER ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});
// Get a specific learning cluster for a specific teacher + class + cluster
router.get('/learning-cluster/:teacherId/:classCode/:clusterCode', async (req, res) => {
  try {
    const { teacherId, classCode, clusterCode } = req.params;

    if (!teacherId || !classCode || !clusterCode) {
      return res.status(400).json({
        message: 'teacherId, classCode and clusterCode are required'
      });
    }

    const classDoc = await Class.findOne({
      classCode,
      createdBy: teacherId
    });

    if (!classDoc) {
      return res.status(404).json({
        message: 'Class not found for this teacher'
      });
    }

    const cluster = classDoc.learningClusters?.find(
      c => c.clusterCode === clusterCode
    );

    if (!cluster) {
      return res.status(404).json({
        message: 'Learning cluster not found'
      });
    }

    const answers = (classDoc.skillSuggestionAnswers || []).filter(
      ans => ans.clusterCode === clusterCode
    );

    const answersWithStudentInfo = answers.map((answer) => {
      const studentFromCluster = cluster.students?.find(
        s => s.id === answer.studentId
      );

      const studentFromRoster = classDoc.studentRoster?.find(
        s => s.studentId === answer.studentId
      );

      return {
        _id: answer._id,
        studentId: answer.studentId,
        id: answer.studentId,
        username:
          studentFromCluster?.name ||
          studentFromRoster?.fullName ||
          answer.studentId,
        fullName:
          studentFromCluster?.name ||
          studentFromRoster?.fullName ||
          answer.studentId,
        profilePic: studentFromCluster?.profilePic || null,
        classCode: answer.classCode,
        clusterCode: answer.clusterCode,
        clusterName: answer.clusterName,
        answerText: answer.answerText,
        analysisResult: answer.analysisResult,
        submittedAt: answer.submittedAt
      };
    });

    return res.status(200).json({
      classCode: classDoc.classCode,
      className: classDoc.className,
      subject: classDoc.subject,
      teacherId: classDoc.createdBy,
      cluster,
      answers: answersWithStudentInfo
    });

  } catch (error) {
    console.error('❌ Error fetching learning cluster tracking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});
// Get only classes that belong to this student
router.get('/student-classes/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const classes = await Class.find({
      'studentRoster.studentId': studentId
    });

    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      createdAt: classItem.createdAt,
      students: classItem.students,
      studentRoster: classItem.studentRoster
    }));

    res.status(200).json(mappedClasses);
  } catch (error) {
    console.error('❌ Error fetching student allowed classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all classes in the system
router.get('/get-all-classes', async (req, res) => {
  try {
    const classes = await Class.find();
    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      createdAt: classItem.createdAt,
      students: classItem.students
    }));

    res.status(200).json(mappedClasses);  
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  Delete a class by classCode and notify the teacher
router.delete('/delete/:classCode', async (req, res) => {
  try {
    const { classCode } = req.params;

    //  Find the class before deletion
    const classDoc = await Class.findOne({ classCode });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Create a notification before deletion
    // EN notification (קיים)
    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'warning',
      title: `The class "${classDoc.className}" has been deleted.`,
      time: new Date().toLocaleString(),
      read: false
    });
    await newNotification.save();
    console.log('✅ delete notification saved (EN)');

    // ⭐ HE notification (חדש)
    const heTitle = `הכיתה "${classDoc.className}" נמחקה.`;
    const newHebrewNotification = new HebrewNotification({
      notificationId: newNotification._id,
      teacherId: classDoc.createdBy,
      type: 'warning',
      title: heTitle,
      read: false
    });
    await newHebrewNotification.save();
    console.log('✅ delete notification saved (HE)');

    //  Delete the class
    await Class.deleteOne({ classCode });

    res.status(200).json({ message: 'Class deleted and notification saved' });

  } catch (error) {
    console.error('❌ Error deleting class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const { generateClassInsightFromClaude } = require('../services/classInsightService');

// Generate AI-based insight for a class using previous student analyses
router.post('/ai-class-insight', async (req, res) => {
  const t0 = Date.now();
  try {
    const { classCode } = req.body || {};
    console.group('[CLASSES] POST /ai-class-insight');
    console.log('↘ body.classCode:', classCode);

    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

const studentAnalyses = (classDoc.students || [])
  .filter(s => s.analysisResult)
  .map(s => s.analysisResult);

    console.log('analyses count:', studentAnalyses.length);

    if (studentAnalyses.length === 0) {
      console.warn('⛔ no analyzed data in class');
      console.groupEnd();
      return res.status(400).json({ message: 'No analyzed data in this class' });
    }

    console.time('[generateClassInsightFromClaude]');
    const insight = await generateClassInsightFromClaude({
      situation: classDoc.situation,
      question: classDoc.question,
      studentAnalyses
    });
    classDoc.classAIChat = classDoc.classAIChat || [];

classDoc.classAIChat.push({
  sender: 'ai',
  text: insight,
  timestamp: new Date()
});

await classDoc.save();
    console.timeEnd('[generateClassInsightFromClaude]');
    console.log('insight length:', (insight || '').length);

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json({ insight });
  } catch (error) {
    console.error('❌ [ai-class-insight] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/class-ai-chat', async (req, res) => {
  try {
    const { classCode, teacherMessage } = req.body || {};

    if (!classCode || !teacherMessage) {
      return res.status(400).json({ message: 'classCode and teacherMessage are required' });
    }

    const classDoc = await Class.findOne({ classCode });

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    classDoc.classAIChat = classDoc.classAIChat || [];

    classDoc.classAIChat.push({
      sender: 'teacher',
      text: teacherMessage,
      timestamp: new Date()
    });

const studentsWithDetails = (classDoc.students || [])
  .filter(s => s.analysisResult)
  .map((s, index) => {
    const rosterStudent = (classDoc.studentRoster || []).find(
      r => r.studentId === s.studentId
    );

    return {
      index: index + 1,
      studentId: s.studentId,
      fullName: rosterStudent?.fullName || s.studentId,
      email: rosterStudent?.email || '',
      department: rosterStudent?.department || '',
      answerText: s.answerText,
      submittedAt: s.submittedAt,
      analysisResult: s.analysisResult
    };
  });

    const historyText = classDoc.classAIChat
      .map(m => `${m.sender === 'teacher' ? 'Teacher' : 'AI'}: ${m.text}`)
      .join('\n');

    const messages = [
      {
        role: 'user',
        content: `
You are an AI assistant helping a teacher understand the class SEL situation.

Class situation:
${classDoc.situation}

Class question:
${classDoc.question}

Students data with IDs, names, answers, timestamps, and analyses:
${JSON.stringify(studentsWithDetails, null, 2)}

Conversation history:
${historyText}

Teacher's latest message:
${teacherMessage}

Answer the teacher naturally.
Use the same language as the teacher.
Be helpful, short, and practical.
Do not repeat the opening insight.
Do NOT use markdown formatting.
Do NOT use **bold**, bullet points, hashtags, or special symbols.
Write in clean plain text only.
`
      }
    ];

    const result = await claudeService.chat(messages, {
      maxTokens: 1000,
      temperature: 0.3
    });

    if (!result.success) {
      return res.status(500).json({ message: 'AI failed to respond' });
    }

    const aiReply = result.data.content[0].text;

    classDoc.classAIChat.push({
      sender: 'ai',
      text: aiReply,
      timestamp: new Date()
    });

    await classDoc.save();

    res.status(200).json({
      ok: true,
      reply: aiReply,
      chat: classDoc.classAIChat
    });

  } catch (error) {
    console.error('❌ [class-ai-chat] ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:classCode/student/:studentId', async (req, res) => {
  const t0 = Date.now();
  try {
    const { classCode, studentId } = req.params || {};
    console.group('[CLASSES] GET /:classCode/student/:studentId');
    console.log('↘ params:', { classCode, studentId });

    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode, 'elapsed(ms)=', Date.now() - t0);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    const totalStudents = Array.isArray(classDoc.students) ? classDoc.students.length : 0;
    console.log('total students in class:', totalStudents);

    const allAnswers = (classDoc.students || []).filter(s => s.studentId === studentId);
    console.log('answers for student:', allAnswers.length);

    if (allAnswers.length === 0) {
      console.warn('⛔ no answers for student in this class');
      console.groupEnd();
      return res.status(404).json({ message: 'Student answer not found in this class' });
    }

    const latestAnswer = allAnswers.reduce((latest, current) =>
      new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest
    );
    console.log('latest submittedAt:', latestAnswer?.submittedAt);

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json(latestAnswer);
  } catch (error) {
    console.error('❌ [get-student-latest] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;