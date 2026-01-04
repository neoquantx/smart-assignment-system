// routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateProfile, getProfile } from "../controllers/userController.js";
import multer from "multer";
import path from "path";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Removed local diskStorage configuration

// Get users by role
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.find({ role }).select("name email role avatar");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/me", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("avatar"), updateProfile);

export default router;