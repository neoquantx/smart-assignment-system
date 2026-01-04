// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads - Commented out for Cloudinary migration
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect mongodb
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ams";
mongoose.connect(MONGO).then(() => console.log("MongoDB Connected")).catch(err => { console.error(err); process.exit(1); });

// routes
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/api/ping", (req, res) => res.json({ ok: true }));

// serve built frontend (dist) if present
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Fallback handler to serve `index.html` for non-API routes.
// Use `app.use` and a simple path check to avoid path-to-regexp parsing issues.
app.use((req, res, next) => {
	// let API and uploads routes pass through
	if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();

	const indexHtml = path.join(distPath, 'index.html');
	if (fs.existsSync(indexHtml)) {
		return res.sendFile(indexHtml);
	}

	// If no frontend build is present, continue to next handlers (404)
	next();
});

// Global Error Handler
app.use((err, req, res, next) => {
	console.error("Global Error:", err);
	res.status(500).json({
		message: "Internal Server Error",
		error: process.env.NODE_ENV === "development" ? err.message : undefined
	});
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
