const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const { sendEmail, otpEmailTemplate } = require("../utils/email");
const { authenticate } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(userId, role, expiresIn = "7d") {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn });
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer
 */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").optional().isMobilePhone("en-IN"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: "CUSTOMER",
          isVerified: true,
        },
      });

      logger.info(`[REGISTER] New account created for ${email}`);

      const token = generateToken(user.id, user.role);
      res.status(201).json({
        success: true,
        message: "Account created successfully! Welcome to Smart Inverter's.",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      });
    } catch (error) {
      logger.error("Register error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  }
);

router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "userId and otp are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otpCode !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });

    const token = generateToken(user.id, user.role);
    res.json({ success: true, message: "Account verified successfully", token });
  } catch (error) {
    logger.error("OTP verify error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      if (user.lockedUntil && new Date() < user.lockedUntil) {
        return res.status(423).json({ success: false, message: "Account temporarily locked. Try again later." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        const attempts = user.loginAttempts + 1;
        const lockedUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: attempts, lockedUntil },
        });

        await prisma.loginHistory.create({
          data: { userId: user.id, ip, success: false, userAgent: req.headers["user-agent"] },
        });

        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: "Account is deactivated" });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null },
      });

      await prisma.loginHistory.create({
        data: { userId: user.id, ip, success: true, userAgent: req.headers["user-agent"] },
      });

      if (user.mfaEnabled) {
        const otp = generateOTP();
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        });
        try {
          await sendEmail({
            to: user.email,
            subject: "Your Smart Inverter's Login OTP",
            html: otpEmailTemplate(user.name, otp),
          });
        } catch (e) {
          logger.warn("MFA email failed:", e.message);
        }
        return res.json({ success: true, requiresMfa: true, userId: user.id, message: "OTP sent to your email" });
      }

      const token = generateToken(user.id, user.role);
      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  }
);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: true, message: "If this email exists, you'll receive a reset OTP." });

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset OTP - Smart Inverter's",
        html: otpEmailTemplate(user.name, otp),
      });
    } catch (e) {
      logger.warn("Password reset email failed:", e.message);
    }

    res.json({ success: true, message: "OTP sent to your email", userId: user.id });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.otpCode !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, otpCode: null, otpExpiresAt: null },
    });

    res.json({ success: true, message: "Password reset successfully. Please login." });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, mfaEnabled: true, createdAt: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

router.put("/profile", authenticate, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
});

router.post("/resend-otp", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    await prisma.user.update({
      where: { id: userId },
      data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Your New OTP - Smart Inverter's",
        html: otpEmailTemplate(user.name, otp),
      });
    } catch (e) {
      logger.warn("Resend OTP email failed:", e.message);
    }

    res.json({ success: true, message: "New OTP sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
});

module.exports = router;
