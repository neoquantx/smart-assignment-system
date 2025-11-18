// routes/analyticsRoutes.js
import express from "express";
import { analytics } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", authMiddleware, analytics);
export default router;
