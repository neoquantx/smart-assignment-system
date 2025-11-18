// controllers/authController.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET || "secret", 
    { expiresIn: "7d" }
  );
}

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    // We rely on schema pre('save') to hash password
    const user = new User({ name, email, password, role });
    await user.save();
    
    // FIXED: Generate token on register too
    const token = generateToken(user);
    
    return res.status(201).json({ 
      message: "Registered successfully", 
      token, // Added token
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (role && user.role !== role) return res.status(400).json({ message: "Incorrect role selected" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(user);
    return res.json({ 
      message: "Login successful", 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
