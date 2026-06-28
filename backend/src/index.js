require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const logger = require("./utils/logger");

const app = express();

// Ensure logs dir
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ];
    if (!origin) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    if (origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: "Too many requests, please try again later" } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: "Too many authentication attempts" } });
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Smart Inverter Business API", version: "1.0.0", description: "Enterprise API for Smart Inverter's Business Platform" },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    },
  },
  apis: ["./src/routes/*.js"],
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Request logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/videos", require("./routes/videos"));
app.use("/api/users", require("./routes/users"));
app.use("/api/analytics", require("./routes/analytics"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    service: "Smart Inverter Business API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Smart Inverter API running on http://localhost:${PORT}`);
  logger.info(`API Docs: http://localhost:${PORT}/api/docs`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  autoSeedVideos();
});

async function autoSeedVideos() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const realVideoIds = [
      "YQNXFfza7_c", "Oq2DHDtLuYM", "Syxae_j-qQc", "rHgBnmMBUkU", "JCwXK44pNqA",
      "KPafO3rMBHw", "OU_WvgnV1Go", "d-kw7pcluLo", "SRBcYBPE2UM", "kwMUrbKefds",
    ];
    const existing = await prisma.youtubeResource.count({ where: { youtubeId: { in: realVideoIds } } });
    if (existing >= realVideoIds.length) {
      logger.info("[VIDEOS] Real videos already in DB — skipping auto-seed");
      return;
    }
    logger.info("[VIDEOS] Seeding real YouTube Shorts videos...");
    await prisma.youtubeResource.deleteMany({});
    const videos = [
      { title: "Inverter Installation Guide - Step by Step", youtubeId: "YQNXFfza7_c", category: "INSTALLATION", description: "Complete step-by-step inverter installation at home by our certified technicians", order: 1, isActive: true },
      { title: "Home Inverter Setup - Full Demonstration", youtubeId: "Oq2DHDtLuYM", category: "INSTALLATION", description: "Watch our technician set up a home inverter system from start to finish", order: 2, isActive: true },
      { title: "Battery Connection & Wiring Guide", youtubeId: "Syxae_j-qQc", category: "INSTALLATION", description: "How to safely connect inverter batteries with proper wiring", order: 3, isActive: true },
      { title: "Terranova Inverter - Product Demo", youtubeId: "rHgBnmMBUkU", category: "PRODUCT_DEMO", description: "See the Terranova LiFePO4 smart inverter in action", order: 1, isActive: true },
      { title: "How to Check Inverter Performance", youtubeId: "JCwXK44pNqA", category: "MAINTENANCE", description: "Quick checks to make sure your inverter is running at its best", order: 1, isActive: true },
      { title: "Inverter Troubleshooting - Common Problems Fixed", youtubeId: "KPafO3rMBHw", category: "TROUBLESHOOTING", description: "Diagnose and fix the most common inverter problems at home", order: 1, isActive: true },
      { title: "Lithium Battery vs Lead Acid - Live Comparison", youtubeId: "OU_WvgnV1Go", category: "PRODUCT_DEMO", description: "Real-world comparison: lithium vs lead acid battery", order: 2, isActive: true },
      { title: "Smart Inverter Complete Setup Walkthrough", youtubeId: "d-kw7pcluLo", category: "INSTALLATION", description: "End-to-end smart inverter installation demonstration", order: 4, isActive: true },
      { title: "Inverter Battery Maintenance Tips", youtubeId: "SRBcYBPE2UM", category: "MAINTENANCE", description: "How to keep your inverter battery in top condition for years", order: 2, isActive: true },
      { title: "Quick Tips: Inverter Usage & Care", youtubeId: "kwMUrbKefds", category: "TIPS_TRICKS", description: "Daily tips to get the most out of your inverter", order: 1, isActive: true },
    ];
    for (const v of videos) await prisma.youtubeResource.create({ data: v });
    logger.info(`[VIDEOS] ✅ ${videos.length} real videos seeded successfully`);
  } catch (e) {
    logger.warn("[VIDEOS] Auto-seed failed (non-critical):", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
