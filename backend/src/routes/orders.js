const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");
const { sendEmail, orderConfirmationTemplate } = require("../utils/email");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SI-${ts}-${rand}`;
}

// CUSTOMER: Create order
router.post("/", authenticate, async (req, res) => {
  const { items, shippingAddress, paymentMethod = "COD", notes } = req.body;

  if (!items?.length || !shippingAddress) {
    return res.status(400).json({ success: false, message: "Items and shipping address are required" });
  }

  try {
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.status !== "ACTIVE") {
        return res.status(400).json({ success: false, message: `Product ${item.productId} is not available` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      enrichedItems.push({ product, quantity: item.quantity, price: product.price });
      totalAmount += product.price * item.quantity;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
        userId: req.user.id,
        items: {
          create: enrichedItems.map(i => ({
            id: uuidv4(),
            productId: i.product.id,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, model: true } } } },
      },
    });

    // Decrease stock
    for (const item of enrichedItems) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: { stockQuantity: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
      });
    }

    // Notify admin (non-critical — don't let this fail the order)
    try {
      await prisma.notification.create({
        data: {
          title: "New Order Received",
          message: `Order ${order.orderNumber} placed for ₹${totalAmount.toLocaleString()}`,
          type: "ORDER",
        },
      });
    } catch (e) {
      logger.warn("Notification create failed (non-critical):", e.message);
    }

    // Respond immediately — emails fire in background so button doesn't spin
    res.status(201).json({ success: true, message: "Order placed successfully!", data: order });

    // Customer confirmation email (background — non-blocking)
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - ${order.orderNumber} | Smart Inverter's`,
      html: orderConfirmationTemplate(order, req.user),
    }).then(() => logger.info(`Order confirmation email sent to ${req.user.email}`))
      .catch(e => logger.warn("Customer order email failed:", e.message));

    // Manager notification email (background — non-blocking)
    const managerEmail = process.env.MANAGER_EMAIL || process.env.SMTP_USER;
    if (managerEmail && managerEmail !== "your-email@gmail.com") {
      const itemsList = order.items.map(i => `• ${i.product.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString()}`).join("\n");
      sendEmail({
        to: managerEmail,
        subject: `🛒 New Order: ${order.orderNumber} — ₹${totalAmount.toLocaleString()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:20px;text-align:center;">
              <h2 style="color:white;margin:0;">🛒 New Order Received</h2>
            </div>
            <div style="background:white;padding:24px;border:1px solid #e5e7eb;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;width:40%;">Order Number</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${order.orderNumber}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Customer</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${req.user.name}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Customer Email</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${req.user.email}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Payment</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${paymentMethod}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Shipping To</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${typeof shippingAddress === "object" ? JSON.stringify(shippingAddress) : shippingAddress}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Total Amount</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-size:18px;font-weight:bold;color:#1d4ed8;">₹${totalAmount.toLocaleString()}</td></tr>
              </table>
              <div style="margin-top:16px;background:#f9fafb;border-radius:8px;padding:16px;">
                <p style="font-weight:bold;margin:0 0 8px;color:#374151;">Items Ordered:</p>
                <pre style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#4b5563;white-space:pre-wrap;">${itemsList}</pre>
              </div>
              <div style="margin-top:16px;padding:16px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
                <p style="margin:0;font-weight:bold;color:#92400e;">Please process this order and arrange delivery.</p>
              </div>
              ${notes ? `<p style="margin-top:12px;color:#6b7280;"><strong>Customer Notes:</strong> ${notes}</p>` : ""}
            </div>
          </div>`,
      }).then(() => logger.info(`Manager notified for order ${order.orderNumber}`))
        .catch(e => logger.warn("Manager order email failed:", e.message));
    }
  } catch (error) {
    logger.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

// CUSTOMER: Get my orders
router.get("/my", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: { select: { name: true, model: true }, include: { images: { where: { isPrimary: true }, take: 1 } } } },
          },
        },
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// PUBLIC: Track order by order number
router.get("/track/:orderNumber", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        items: { include: { product: { select: { name: true, model: true } } } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to track order" });
  }
});

// ADMIN: Get all orders
router.get("/admin/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// ADMIN: Update order status
router.put("/:id/status", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, ...(paymentStatus && { paymentStatus }) },
      include: { user: true },
    });

    await prisma.notification.create({
      data: {
        title: "Order Status Updated",
        message: `Your order ${order.orderNumber} status: ${status}`,
        type: "ORDER",
        userId: order.userId,
      },
    });

    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

module.exports = router;
