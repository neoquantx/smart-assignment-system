// controllers/submissionController.js
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";

export const listSubmissions = async (req, res) => {
  // if teacher, return all, else return user's submissions
  if (req.user && req.user.role === "Teacher") {
    const all = await Submission.find().populate("assignment student");
    // attach quick fields
    const shaped = all.map(s => ({
      ...s.toObject(),
      assignmentTitle: s.assignment?.title,
      assignmentMaxMarks: s.assignment?.maxMarks || 100,
      studentName: s.student?.name,
      studentAvatar: s.student?.avatar
    }));
    return res.json(shaped);
  } else {
    const mine = await Submission.find({ student: req.user._id }).populate("assignment student");
    const shaped = mine.map(s => ({
      ...s.toObject(),
      assignmentTitle: s.assignment?.title,
      assignmentMaxMarks: s.assignment?.maxMarks || 100,
      studentName: s.student?.name,
      studentAvatar: s.student?.avatar
    }));
    return res.json(shaped);
  }
};

export const getSubmission = async (req, res) => {
  const s = await Submission.findById(req.params.id).populate("assignment student");
  if (!s) return res.status(404).json({ message: "Not found" });
  res.json(s);
};

export const createSubmission = async (req, res) => {
  try {
    // multer puts file at req.file
    const assignmentId = req.body.assignmentId;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.deadline && new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: "The deadline for this assignment has passed. You can no longer submit." });
    }

    const fileUrl = req.file ? req.file.path : "";
    const sub = await Submission.create({ assignment: assignmentId, student: req.user._id, fileUrl });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
