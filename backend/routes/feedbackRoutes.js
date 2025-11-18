// routes/feedbackRoutes.js
import express from "express";
import { postFeedback, getFeedback } from "../controllers/feedbackController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/", authMiddleware, postFeedback);
router.get("/:id", authMiddleware, getFeedback);
export default router;
