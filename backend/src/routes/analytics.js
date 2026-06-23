const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/dashboard", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalCustomers,
      newCustomersThisMonth,
      totalOrders,
      ordersThisMonth,
      revenueData,
      revenueLastMonth,
      totalBookings,
      pendingBookings,
      openIssues,
      criticalIssues,
      totalFeedback,
      avgRating,
      topProducts,
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.serviceBooking.count(),
      prisma.serviceBooking.count({ where: { status: "PENDING" } }),
      prisma.issueReport.count({ where: { status: "OPEN" } }),
      prisma.issueReport.count({ where: { status: "OPEN", priority: "CRITICAL" } }),
      prisma.feedback.count(),
      prisma.feedback.aggregate({ _avg: { rating: true } }),
      prisma.product.findMany({ orderBy: { salesCount: "desc" }, take: 5, select: { id: true, name: true, model: true, salesCount: true, price: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } } }),
      prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
      // PostgreSQL-compatible monthly revenue (was SQLite strftime — crashes on Neon)
      prisma.$queryRaw`SELECT TO_CHAR("createdAt", 'YYYY-MM') as period, SUM("totalAmount") as revenue, COUNT(*)::int as orders FROM "Order" WHERE "paymentStatus" = 'PAID' GROUP BY period ORDER BY period DESC LIMIT 12`,
      prisma.notification.count({ where: { isRead: false, userId: null } }),
    ]);

    res.json({
      success: true,
      data: {
        customers: { total: totalCustomers, thisMonth: newCustomersThisMonth },
        orders: { total: totalOrders, thisMonth: ordersThisMonth, byStatus: ordersByStatus },
        revenue: {
          total: revenueData._sum.totalAmount || 0,
          lastMonth: revenueLastMonth._sum.totalAmount || 0,
          monthly: monthlyRevenue,
        },
        bookings: { total: totalBookings, pending: pendingBookings },
        issues: { open: openIssues, critical: criticalIssues },
        feedback: { total: totalFeedback, avgRating: avgRating._avg.rating?.toFixed(1) || "0.0" },
        topProducts,
        recentOrders,
        unreadNotifications,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
});

router.get("/revenue", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    // PostgreSQL TO_CHAR format strings (replaces SQLite strftime)
    let pgFormat = "YYYY-MM";
    if (period === "daily") pgFormat = "YYYY-MM-DD";
    else if (period === "yearly") pgFormat = "YYYY";

    const data = await prisma.$queryRawUnsafe(`
      SELECT TO_CHAR("createdAt", '${pgFormat}') as period,
             SUM("totalAmount") as revenue,
             COUNT(*)::int as orders
      FROM "Order"
      WHERE "paymentStatus" = 'PAID'
      GROUP BY period
      ORDER BY period DESC
      LIMIT 24`);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch revenue data" });
  }
});

router.get("/notifications", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

router.put("/notifications/:id/read", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
});

router.put("/notifications/read-all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { userId: null, isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
});

router.get("/audit-logs", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip, take: parseInt(limit), orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ success: true, data: logs, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
});

module.exports = router;
