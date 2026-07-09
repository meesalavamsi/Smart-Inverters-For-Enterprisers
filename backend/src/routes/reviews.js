const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

async function recomputeProductRating(productId) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating || 0,
      reviewCount: agg._count.rating,
    },
  });
}

// PUBLIC: Get approved reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, isApproved: true },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    logger.error("Get product reviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
});

// AUTH: Check if the logged-in user can review a product (must have a delivered order for it)
router.get("/eligibility/:productId", authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: req.user.id },
    });
    if (existingReview) {
      return res.json({ success: true, canReview: false, alreadyReviewed: true, review: existingReview });
    }

    const purchase = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user.id, status: "DELIVERED" } },
    });

    res.json({
      success: true,
      canReview: !!purchase,
      alreadyReviewed: false,
      reason: purchase ? null : "You can review a product after it has been delivered to you.",
    });
  } catch (error) {
    logger.error("Review eligibility error:", error);
    res.status(500).json({ success: false, message: "Failed to check review eligibility" });
  }
});

// AUTH: Submit a review (verified-purchase only)
router.post("/", authenticate, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Product, rating and comment are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const existingReview = await prisma.review.findFirst({ where: { productId, userId: req.user.id } });
    if (existingReview) {
      return res.status(409).json({ success: false, message: "You have already reviewed this product" });
    }

    const purchase = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user.id, status: "DELIVERED" } },
    });
    if (!purchase) {
      return res.status(403).json({ success: false, message: "You can review a product after it has been delivered to you" });
    }

    const review = await prisma.review.create({
      data: { productId, userId: req.user.id, rating: parseInt(rating), title: title || null, comment },
    });

    logger.info(`[REVIEW] User ${req.user.id} submitted review for product ${productId}, pending approval`);

    res.status(201).json({ success: true, message: "Review submitted! It will appear once approved.", data: review });
  } catch (error) {
    logger.error("Submit review error:", error);
    res.status(500).json({ success: false, message: "Failed to submit review" });
  }
});

// ADMIN: Get all reviews for moderation
router.get("/admin/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;
    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, product: { select: { name: true, model: true } } },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      success: true, data: reviews,
      pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    logger.error("Get admin reviews error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
});

// ADMIN: Approve/reject a review
router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved },
    });
    await recomputeProductRating(review.productId);
    res.json({ success: true, message: "Review updated", data: review });
  } catch (error) {
    logger.error("Update review error:", error);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
});

// ADMIN: Delete a review
router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const review = await prisma.review.delete({ where: { id: req.params.id } });
    await recomputeProductRating(review.productId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    logger.error("Delete review error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
});

module.exports = router;
