const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC: Submit feedback
router.post("/", optionalAuth, async (req, res) => {
  const { name, email, rating, message } = req.body;
  if (!name || !email || !rating || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: { name, email, rating: parseInt(rating), message, userId: req.userId || null },
    });
    res.status(201).json({ success: true, message: "Thank you for your feedback!", data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
});

// PUBLIC: Get approved feedback (testimonials)
router.get("/public", async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { isApproved: true, isDisplayed: true },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, rating: true, message: true, createdAt: true },
    });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
});

// ADMIN: Get all feedback
router.get("/admin/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 20, rating } = req.query;
    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === "true";
    if (rating) where.rating = parseInt(rating);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" } }),
      prisma.feedback.count({ where }),
    ]);

    const avgRating = await prisma.feedback.aggregate({ _avg: { rating: true } });
    const distribution = await prisma.feedback.groupBy({ by: ["rating"], _count: { rating: true } });

    res.json({
      success: true, data: feedbacks,
      stats: { avgRating: avgRating._avg.rating?.toFixed(1), distribution },
      pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
});

// ADMIN: Approve/reject feedback
router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { isApproved, isDisplayed } = req.body;
    const feedback = await prisma.feedback.update({
      where: { id: req.params.id },
      data: { isApproved, isDisplayed },
    });
    res.json({ success: true, message: "Feedback updated", data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update feedback" });
  }
});

// ADMIN: Delete feedback
router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete feedback" });
  }
});

module.exports = router;
