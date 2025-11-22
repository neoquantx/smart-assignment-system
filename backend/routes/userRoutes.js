// routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get users by role
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.find({ role }).select("name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;