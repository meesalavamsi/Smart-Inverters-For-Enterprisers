const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// AUTH: Create a Razorpay order for the given amount
router.post("/create-order", authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    const amountPaise = Math.round((amount || 0) * 100);
    if (!amount || amountPaise < 100) {
      return res.status(400).json({ success: false, message: "Amount must be at least ₹1" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error("Razorpay create-order error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
});

// AUTH: Verify payment signature and mark our order as paid
router.post("/verify", authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`[PAYMENT] Signature mismatch for order ${orderId}`);
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.user.id } });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: order.status === "PENDING" ? "CONFIRMED" : order.status },
    });

    logger.info(`[PAYMENT] Order ${order.orderNumber} verified and marked PAID (payment: ${razorpay_payment_id})`);

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    logger.error("Razorpay verify error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

module.exports = router;
