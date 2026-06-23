const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC: Get all active videos
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;

    const videos = await prisma.youtubeResource.findMany({
      where,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch videos" });
  }
});

// ADMIN: Create video
router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { title, youtubeId, description, category, thumbnail, duration, order } = req.body;
    if (!title || !youtubeId || !category) {
      return res.status(400).json({ success: false, message: "Title, YouTube ID, and category are required" });
    }
    const video = await prisma.youtubeResource.create({
      data: { title, youtubeId, description, category, thumbnail, duration, order: order || 0 },
    });
    res.status(201).json({ success: true, message: "Video added", data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add video" });
  }
});

// ADMIN: Update video
router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const video = await prisma.youtubeResource.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, message: "Video updated", data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update video" });
  }
});

// ADMIN: Delete video
router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.youtubeResource.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete video" });
  }
});

// PUBLIC: Get recycling resources
router.get("/recycling", async (req, res) => {
  try {
    const resources = await prisma.recyclingResource.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch resources" });
  }
});

// ADMIN: CRUD recycling resources
router.post("/recycling", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const resource = await prisma.recyclingResource.create({ data: req.body });
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add resource" });
  }
});

router.put("/recycling/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const resource = await prisma.recyclingResource.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update resource" });
  }
});

router.delete("/recycling/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.recyclingResource.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete resource" });
  }
});

module.exports = router;
