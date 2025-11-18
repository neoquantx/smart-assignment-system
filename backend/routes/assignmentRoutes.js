// routes/assignmentRoutes.js
import express from "express";
import { listAssignments, getAssignment, createAssignment } from "../controllers/assignmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.post("/", authMiddleware, createAssignment); // only logged in can create
export default router;
