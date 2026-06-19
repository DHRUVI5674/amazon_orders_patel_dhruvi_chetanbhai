import express from "express";
import * as auth from "../controllers/orderAuth.controller.js";
import authMiddleware from "../middleware/Auth.middleware.js";

const router = express.Router();

// AUTH
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/logout", authMiddleware, auth.logout);

// PROFILE
router.get("/profile", authMiddleware, auth.getProfile);
router.patch("/profile", authMiddleware, auth.updateProfile);
router.delete("/profile", authMiddleware, auth.deleteProfile);

// PASSWORD
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);
router.post("/change-password", authMiddleware, auth.changePassword);

// EMAIL + OTP
router.post("/verify-email", auth.verifyEmail);
router.post("/send-otp", auth.sendOtp);
router.post("/verify-otp", auth.verifyOtp);

// SESSIONS
router.get("/sessions", authMiddleware, auth.getSessions);
router.delete("/sessions/:id", authMiddleware, auth.removeSession);

// TOKEN
router.post("/refresh-token", authMiddleware, auth.refreshToken);

export default router;