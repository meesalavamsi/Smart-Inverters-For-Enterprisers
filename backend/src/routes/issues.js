const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const { createUploadMiddleware } = require("../middleware/upload");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();
const upload = createUploadMiddleware("issues");

function generateReportNumber() {
  return `IR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

// PUBLIC: Submit issue report
router.post("/", optionalAuth, upload.array("images", 5), async (req, res) => {
  const { customerName, phone, issueType, productName, description, priority } = req.body;

  if (!customerName || !phone || !issueType || !description) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    const images = req.files?.map(f => `/uploads/issues/${f.filename}`).join(",") || null;

    const issue = await prisma.issueReport.create({
      data: {
        reportNumber: generateReportNumber(),
        customerName,
        phone,
        issueType,
        productName: productName || "Not specified",
        description,
        images,
        priority: priority || "MEDIUM",
        status: "OPEN",
        userId: req.userId || null,
      },
    });

    await prisma.notification.create({
      data: {
        title: `New Issue Report - ${priority || "MEDIUM"} Priority`,
        message: `${customerName} reported: ${issueType} for ${productName || "product"}`,
        type: "ISSUE",
      },
    });

    res.status(201).json({ success: true, message: "Issue reported successfully. We'll contact you shortly.", data: issue });
  } catch (error) {
    logger.error("Create issue error:", error);
    res.status(500).json({ success: false, message: "Failed to submit issue report" });
  }
});

// CUSTOMER: Get my issues
router.get("/my", authenticate, async (req, res) => {
  try {
    const issues = await prisma.issueReport.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch issues" });
  }
});

// ADMIN: Get all issues
router.get("/admin/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.OR = [
      { customerName: { contains: search } },
      { phone: { contains: search } },
      { reportNumber: { contains: search } },
      { issueType: { contains: search } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [issues, total] = await Promise.all([
      prisma.issueReport.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" } }),
      prisma.issueReport.count({ where }),
    ]);

    res.json({ success: true, data: issues, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch issues" });
  }
});

// ADMIN: Update issue status
router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { status, priority, resolution } = req.body;
    const issue = await prisma.issueReport.update({
      where: { id: req.params.id },
      data: { status, priority, resolution },
    });
    res.json({ success: true, message: "Issue updated", data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update issue" });
  }
});

module.exports = router;
