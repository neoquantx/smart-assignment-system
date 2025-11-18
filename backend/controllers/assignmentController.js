// controllers/assignmentController.js
import Assignment from "../models/Assignment.js";

export const listAssignments = async (req, res) => {
  const list = await Assignment.find().sort({ createdAt: -1 });
  res.json(list);
};

export const getAssignment = async (req, res) => {
  const a = await Assignment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  res.json(a);
};

export const createAssignment = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const a = await Assignment.create({ title, description, deadline, createdBy: req.user._id });
    res.status(201).json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
