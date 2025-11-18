// controllers/analyticsController.js

import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";

export const analytics = async (req, res) => {
  try {
    // Get all assignments and submissions
    const assignments = await Assignment.find();
    const submissions = await Submission.find();

    // Calculate average marks per assignment
    const assignmentStats = assignments.map(a => {
      const related = submissions.filter(
        s => String(s.assignment) === String(a._id) && typeof s.marks === "number"
      );
      const avg = related.length 
        ? (related.reduce((sum, sub) => sum + (sub.marks || 0), 0) / related.length) 
        : 0;
      return { 
        title: a.title, 
        avgMark: Math.round(avg * 100) / 100 
      };
    });

    // Calculate totals
    const totals = { 
      totalAssignments: assignments.length, 
      totalSubmissions: submissions.length, 
      pendingEvaluations: submissions.filter(s => s.marks == null).length 
    };

    // Calculate submission status
    const gradedCount = submissions.filter(s => typeof s.marks === "number").length;
    const pendingCount = submissions.filter(s => s.marks == null).length;
    
    const submissionStatus = [
      { name: "Graded", value: gradedCount },
      { name: "Pending Evaluation", value: pendingCount },
      { name: "Not Submitted", value: Math.max(0, (assignments.length * 30) - submissions.length) } // Assuming 30 students
    ];

    // FIXED: Return correct format matching frontend
    res.json({ 
      assignmentStats,  // Changed from 'assignments'
      submissionStatus, 
      totals 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
