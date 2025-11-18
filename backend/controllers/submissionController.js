// controllers/submissionController.js
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";

export const listSubmissions = async (req, res) => {
  // if teacher, return all, else return user's submissions
  if (req.user && req.user.role === "Teacher") {
    const all = await Submission.find().populate("assignment student");
    // attach quick fields
    const shaped = all.map(s => ({ ...s.toObject(), assignmentTitle: s.assignment?.title, studentName: s.student?.name }));
    return res.json(shaped);
  } else {
    const mine = await Submission.find({ student: req.user._id }).populate("assignment");
    const shaped = mine.map(s => ({ ...s.toObject(), assignmentTitle: s.assignment?.title }));
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
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const sub = await Submission.create({ assignment: assignmentId, student: req.user._id, fileUrl });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
