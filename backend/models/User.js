// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Student","Teacher"], required: true },
  bio: { type: String },
  department: { type: String },
  institution: { type: String },
  courses: { type: [String], default: [] },
  avatar: { type: String }
});

// use pre save only if controller does not hash - we'll keep controller saving raw then hashing here
userSchema.pre("save", async function(next){
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
