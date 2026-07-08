import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ------------------ REGISTER ------------------
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    // Handle duplicate key error (E11000) from MongoDB
    if (err && err.code === 11000) {
      const dupKey = Object.keys(err.keyValue || {})[0] || "field";
      return res.status(400).json({ success: false, message: `${dupKey} already exists` });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const secret = process.env.JWT_SECRET || "dev_jwt_secret";
    if (!process.env.JWT_SECRET) console.warn("WARNING: JWT_SECRET not set — using fallback secret for development");

    const token = jwt.sign(
      { id: user._id },
      secret,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ LOGOUT ------------------
export const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// ------------------ PROFILE ------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ FORGOT PASSWORD ------------------
export const forgotPassword = async (req, res) => {
  res.json({ message: "OTP sent for password reset" });
};

// ------------------ RESET PASSWORD ------------------
export const resetPassword = async (req, res) => {
  res.json({ message: "Password reset successful" });
};

// ------------------ CHANGE PASSWORD ------------------
export const changePassword = async (req, res) => {
  res.json({ message: "Password changed successfully" });
};

// ------------------ VERIFY EMAIL ------------------
export const verifyEmail = async (req, res) => {
  res.json({ message: "Email verified" });
};

// ------------------ OTP ------------------
export const sendOtp = async (req, res) => {
  res.json({ message: "OTP sent" });
};

export const verifyOtp = async (req, res) => {
  res.json({ message: "OTP verified" });
};

// ------------------ SESSIONS ------------------
export const getSessions = async (req, res) => {
  res.json({ sessions: [] });
};

export const removeSession = async (req, res) => {
  res.json({ message: "Session removed" });
};

// ------------------ REFRESH TOKEN ------------------
export const refreshToken = async (req, res) => {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret";
  if (!process.env.JWT_SECRET) console.warn("WARNING: JWT_SECRET not set — using fallback secret for development");

  const newToken = jwt.sign(
    { id: req.user.id },
    secret,
    { expiresIn: "1d" }
  );

  res.json({ token: newToken });
};