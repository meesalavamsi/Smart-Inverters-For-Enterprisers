const nodemailer = require("nodemailer");
const logger = require("./logger");

// Gmail SMTP transporter — App Password required (myaccount.google.com/apppasswords)
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: (process.env.SMTP_PASS || "").replace(/\s/g, ""),
    },
    tls: {
      rejectUnauthorized: false, // bypass SSL inspection by ISP/router
    },
  });
}

const transporter = createTransporter();

// Test connection on startup
transporter.verify((error) => {
  if (error) {
    logger.error(`[EMAIL] SMTP connection FAILED: ${error.message}`);
    logger.error("[EMAIL] Fix: ensure SMTP_USER and SMTP_PASS are set in .env and Gmail 2-Step Verification is ON");
  } else {
    logger.info(`[EMAIL] SMTP connected ✓ — ready to send from ${process.env.SMTP_USER}`);
  }
});

async function sendEmail({ to, subject, html, text }) {
  const t = createTransporter(); // fresh transporter per send (avoids stale connections)
  try {
    const info = await t.sendMail({
      from: `"Smart Inverter's" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`[EMAIL] Sent: ${subject} → ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    logger.error(`[EMAIL] FAILED to send "${subject}" to ${to}: ${error.message}`);
    throw error;
  }
}

function otpEmailTemplate(name, otp) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:8px;">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">⚡ Smart Inverter's</h1>
        <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Account Verification</p>
      </div>
      <div style="background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
        <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="color:#6b7280;margin:0 0 24px;">Use the OTP below to verify your Smart Inverter's account.</p>
        <div style="background:#eff6ff;border:2px dashed #3b82f6;padding:24px;text-align:center;margin:0 0 24px;border-radius:10px;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your OTP</p>
          <span style="font-size:42px;font-weight:900;color:#1e40af;letter-spacing:12px;">${otp}</span>
        </div>
        <p style="color:#ef4444;font-size:14px;margin:0 0 20px;">⏱ Valid for <strong>10 minutes</strong> only. Do not share this with anyone.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">
          Questions? Call us at <strong>${process.env.BUSINESS_PHONE || "7207762577"}</strong><br>
          Smart Inverter's — Powering Andhra Pradesh & Telangana
        </p>
      </div>
    </div>`;
}

function orderConfirmationTemplate(order, user) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${item.product.name}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${item.price.toLocaleString()}</td>
    </tr>`).join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Order Confirmed! ✅</h1>
        <p style="color:#bfdbfe;">Order #${order.orderNumber}</p>
      </div>
      <div style="background:white;padding:30px;border:1px solid #e5e7eb;">
        <p>Dear <strong>${user.name}</strong>, thank you for your order!</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;text-align:left;">Product</th>
              <th style="padding:10px;text-align:center;">Qty</th>
              <th style="padding:10px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:10px;font-weight:bold;">Total</td>
              <td style="padding:10px;text-align:right;font-weight:bold;color:#1e40af;">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <p style="color:#6b7280;">For queries: <strong>${process.env.BUSINESS_PHONE || "7207762577"}</strong></p>
      </div>
    </div>`;
}

module.exports = { sendEmail, otpEmailTemplate, orderConfirmationTemplate };
