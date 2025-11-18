// models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileUrl: String,
  submittedAt: { type: Date, default: Date.now },
  marks: Number,
  feedback: String
});

export default mongoose.model("Submission", submissionSchema);
