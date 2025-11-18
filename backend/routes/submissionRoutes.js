// routes/submissionRoutes.js
import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { listSubmissions, getSubmission, createSubmission } from "../controllers/submissionController.js";
import path from "path";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get("/", authMiddleware, listSubmissions);
router.get("/:id", authMiddleware, getSubmission);
router.post("/", authMiddleware, upload.single("file"), createSubmission);

export default router;
