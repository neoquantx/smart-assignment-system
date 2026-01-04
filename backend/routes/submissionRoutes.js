// routes/submissionRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { listSubmissions, getSubmission, createSubmission } from "../controllers/submissionController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();
// Removed local diskStorage configuration

router.get("/", authMiddleware, listSubmissions);
router.get("/:id", authMiddleware, getSubmission);
router.post("/", authMiddleware, upload.single("file"), createSubmission);

export default router;
