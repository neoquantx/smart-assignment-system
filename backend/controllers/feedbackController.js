// controllers/feedbackController.js
import Submission from "../models/Submission.js";

export const postFeedback = async (req, res) => {
  try {
    const { submissionId, marks, feedback } = req.body;
    const s = await Submission.findById(submissionId);
    if (!s) return res.status(404).json({ message: "Submission not found" });
    s.marks = marks;
    s.feedback = feedback;
    await s.save();
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeedback = async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ message: "Not found" });
  res.json({ marks: sub.marks, feedback: sub.feedback });
};
