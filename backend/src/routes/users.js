const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ADMIN: Get all users
router.get("/", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (search) where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, isVerified: true, createdAt: true, _count: { select: { orders: true, serviceBookings: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// ADMIN: Get single user
router.get("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        orders: { orderBy: { createdAt: "desc" }, take: 5 },
        serviceBookings: { orderBy: { createdAt: "desc" }, take: 5 },
        loginHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// ADMIN: Update user
router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, role, isActive },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
    });
    res.json({ success: true, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

// ADMIN: Create technician
router.post("/technician", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password || "Technician@123", 12);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hashedPassword, role: "TECHNICIAN", isVerified: true },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.status(201).json({ success: true, message: "Technician account created", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create technician" });
  }
});

// ADMIN: Deactivate user
router.put("/:id/toggle-status", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
    });
    res.json({ success: true, message: `User ${updated.isActive ? "activated" : "deactivated"}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle user status" });
  }
});

// ADMIN: Get settings
router.get("/settings/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj = {};
    settings.forEach(s => obj[s.key] = s.value);
    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// ADMIN: Update settings
router.put("/settings/update", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group: "general" },
      });
    }
    res.json({ success: true, message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

module.exports = router;
