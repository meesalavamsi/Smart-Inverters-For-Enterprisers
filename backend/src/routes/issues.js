const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const { createUploadMiddleware } = require("../middleware/upload");
const { sendEmail } = require("../utils/email");
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

    try {
      await prisma.notification.create({
        data: {
          title: `New Issue Report - ${priority || "MEDIUM"} Priority`,
          message: `${customerName} reported: ${issueType} for ${productName || "product"}`,
          type: "ISSUE",
        },
      });
    } catch (e) { logger.warn("Notification create failed (non-critical):", e.message); }

    // Email notification to manager
    const managerEmail = process.env.MANAGER_EMAIL || process.env.SMTP_USER;
    if (managerEmail) {
      try {
        await sendEmail({
          to: managerEmail,
          subject: `🚨 New Issue Report - ${priority || "MEDIUM"} Priority — ${issue.reportNumber}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:20px;text-align:center;">
                <h2 style="color:white;margin:0;">🚨 New Issue Report</h2>
                <p style="color:#fecaca;margin:4px 0 0;font-size:14px;">${priority || "MEDIUM"} Priority</p>
              </div>
              <div style="background:white;padding:24px;border:1px solid #e5e7eb;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;width:40%;">Report No</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${issue.reportNumber}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Customer</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${customerName}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Phone</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;"><a href="tel:${phone}" style="color:#1d4ed8;font-weight:bold;">${phone}</a></td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Issue Type</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;text-transform:capitalize;">${issueType.replace(/_/g, " ")}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Product</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${productName || "Not specified"}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Priority</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;"><strong style="color:${priority === "CRITICAL" ? "#dc2626" : priority === "HIGH" ? "#ea580c" : "#6b7280"};">${priority || "MEDIUM"}</strong></td></tr>
                  <tr><td style="padding:8px;color:#6b7280;">Description</td><td style="padding:8px;">${description}</td></tr>
                </table>
                <div style="margin-top:20px;padding:16px;background:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;">
                  <p style="margin:0;font-weight:bold;color:#991b1b;">Action Required: Please contact the customer to resolve this issue within 24 hours.</p>
                </div>
                <div style="margin-top:16px;text-align:center;">
                  <a href="https://wa.me/${phone}?text=Hello%20${encodeURIComponent(customerName)}%2C%20this%20is%20Smart%20Inverter%27s.%20We%20received%20your%20issue%20report%20${issue.reportNumber}%20and%20are%20working%20on%20it."
                     style="display:inline-block;background:#25d366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:8px;">
                    📱 WhatsApp Customer
                  </a>
                  <a href="tel:${phone}" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    📞 Call Customer
                  </a>
                </div>
              </div>
            </div>`,
        });
        logger.info(`Manager notified for issue ${issue.reportNumber}`);
      } catch (e) { logger.warn("Manager issue email failed:", e.message); }
    }

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
