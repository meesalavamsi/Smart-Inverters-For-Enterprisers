const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const { sendEmail } = require("../utils/email");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const router = express.Router();
const prisma = new PrismaClient();

function generateBookingNumber() {
  return `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

// PUBLIC: Create service booking
router.post("/", optionalAuth, async (req, res) => {
  const { serviceType, customerName, phone, email, address, preferredDate, preferredTime, notes } = req.body;

  if (!serviceType || !customerName || !phone || !address || !preferredDate || !preferredTime) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    const booking = await prisma.serviceBooking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        serviceType,
        customerName,
        phone,
        email,
        address,
        preferredDate: new Date(preferredDate),
        preferredTime,
        notes,
        userId: req.userId || null,
      },
    });

    try {
      await prisma.notification.create({
        data: {
          title: "New Service Booking",
          message: `${customerName} booked ${serviceType.replace(/_/g, " ")} service for ${preferredDate}`,
          type: "BOOKING",
        },
      });
    } catch (e) { logger.warn("Notification create failed (non-critical):", e.message); }

    // Email to customer
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: `Service Booking Confirmed - ${booking.bookingNumber}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:20px;text-align:center;">
                <h2 style="color:white;margin:0;">Service Booking Confirmed</h2>
              </div>
              <div style="background:white;padding:24px;border:1px solid #e5e7eb;">
                <p>Dear <strong>${customerName}</strong>,</p>
                <p>Your service booking has been received.</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Booking No:</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${booking.bookingNumber}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Service:</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${serviceType.replace(/_/g, " ")}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Date:</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${new Date(preferredDate).toLocaleDateString("en-IN")}</td></tr>
                  <tr><td style="padding:8px;color:#6b7280;">Time:</td><td style="padding:8px;">${preferredTime}</td></tr>
                </table>
                <p style="margin-top:16px;color:#6b7280;">Our team will contact you to confirm the appointment. For queries: <strong>${process.env.BUSINESS_PHONE}</strong></p>
              </div>
            </div>`,
        });
      } catch (e) { logger.warn("Customer booking email failed:", e.message); }
    }

    // Email notification to manager
    const managerEmail = process.env.MANAGER_EMAIL || process.env.SMTP_USER;
    if (managerEmail) {
      try {
        await sendEmail({
          to: managerEmail,
          subject: `🔔 New Booking: ${serviceType.replace(/_/g, " ")} — ${booking.bookingNumber}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:20px;text-align:center;">
                <h2 style="color:white;margin:0;">🔔 New Service Booking</h2>
              </div>
              <div style="background:white;padding:24px;border:1px solid #e5e7eb;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;width:40%;">Booking No</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${booking.bookingNumber}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Service Type</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;text-transform:capitalize;">${serviceType.replace(/_/g, " ")}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Customer Name</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${customerName}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Phone</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;"><a href="tel:${phone}" style="color:#1d4ed8;font-weight:bold;">${phone}</a></td></tr>
                  ${email ? `<tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Email</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${email}</td></tr>` : ""}
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Address</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${address}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Preferred Date</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${new Date(preferredDate).toLocaleDateString("en-IN")}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280;">Preferred Time</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;">${preferredTime}</td></tr>
                  ${notes ? `<tr><td style="padding:8px;color:#6b7280;">Notes</td><td style="padding:8px;">${notes}</td></tr>` : ""}
                </table>
                <div style="margin-top:20px;padding:16px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
                  <p style="margin:0;font-weight:bold;color:#92400e;">Action Required: Please contact the customer to confirm this booking.</p>
                </div>
                <div style="margin-top:16px;text-align:center;">
                  <a href="https://wa.me/${phone}?text=Hello%20${encodeURIComponent(customerName)}%2C%20this%20is%20Smart%20Inverter%27s.%20I%27m%20calling%20regarding%20your%20service%20booking%20${booking.bookingNumber}."
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
        logger.info(`Manager notified for booking ${booking.bookingNumber}`);
      } catch (e) { logger.warn("Manager email notification failed:", e.message); }
    }

    // Log WhatsApp notification link for manager (SMS fallback)
    const managerWA = process.env.MANAGER_WHATSAPP;
    if (managerWA) {
      const waMsg = `🔔 New Booking Alert!\nBooking: ${booking.bookingNumber}\nService: ${serviceType.replace(/_/g, " ")}\nCustomer: ${customerName}\nPhone: ${phone}\nDate: ${new Date(preferredDate).toLocaleDateString("en-IN")} at ${preferredTime}\nAddress: ${address}`;
      logger.info(`WhatsApp notification for manager: https://wa.me/${managerWA}?text=${encodeURIComponent(waMsg)}`);
    }

    res.status(201).json({ success: true, message: "Service booking created successfully!", data: booking });
  } catch (error) {
    logger.error("Create booking error:", error);
    res.status(500).json({ success: false, message: "Failed to create booking" });
  }
});

// CUSTOMER: Get my bookings
router.get("/my", authenticate, async (req, res) => {
  try {
    const bookings = await prisma.serviceBooking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
});

// ADMIN: Get all bookings
router.get("/admin/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 20, search, date } = req.query;
    const where = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (search) where.OR = [
      { customerName: { contains: search } },
      { phone: { contains: search } },
      { bookingNumber: { contains: search } },
    ];
    if (date) {
      const d = new Date(date);
      where.preferredDate = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lt: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" } }),
      prisma.serviceBooking.count({ where }),
    ]);

    res.json({ success: true, data: bookings, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
});

// ADMIN: Update booking status
router.put("/:id/status", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { status, technicianId } = req.body;
    const booking = await prisma.serviceBooking.update({
      where: { id: req.params.id },
      data: { status, ...(technicianId && { technicianId }) },
    });
    res.json({ success: true, message: "Booking updated", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
});

module.exports = router;
