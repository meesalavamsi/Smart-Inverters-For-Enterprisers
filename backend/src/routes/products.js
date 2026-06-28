const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");
const { createUploadMiddleware } = require("../middleware/upload");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const path = require("path");

const router = express.Router();
const prisma = new PrismaClient();
const upload = createUploadMiddleware("products");

// PUBLIC: Get all active products with filters
router.get("/", async (req, res) => {
  try {
    const {
      search, category, batteryType, minPrice, maxPrice,
      capacity, status, sort = "createdAt", order = "desc",
      page = 1, limit = 12,
    } = req.query;

    const where = { status: "ACTIVE" };
    if (search) where.OR = [
      { name: { contains: search } },
      { model: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
    if (category) where.categoryId = category;
    if (batteryType) where.batteryType = batteryType;
    if (capacity) where.capacity = { contains: capacity };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orderBy = sort === "price_asc" ? { price: "asc" }
      : sort === "price_desc" ? { price: "desc" }
      : sort === "popular" ? { salesCount: "desc" }
      : sort === "rating" ? { rating: "desc" }
      : { [sort]: order };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    logger.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// PUBLIC: Get single product
router.get("/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: "ACTIVE" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        videos: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error("Get product error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
});

// ADMIN: Get all products (including inactive)
router.get("/admin/all", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search } }, { model: { contains: search } }];
    if (status) where.status = status;
    if (category) where.categoryId = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ success: true, data: products, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    logger.error("Admin get products error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// ADMIN: Create product
router.post("/", authenticate, authorize("ADMIN"), upload.array("images", 10), async (req, res) => {
  try {
    const {
      name, model, description, price, originalPrice, warranty, capacity,
      batteryType, features, specifications, stockQuantity, status,
      tags, seoTitle, seoDescription, seoKeywords, categoryId,
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + uuidv4().slice(0, 6);

    const product = await prisma.product.create({
      data: {
        name, model, slug, description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        warranty, capacity, batteryType,
        features: typeof features === "string" ? features : JSON.stringify(features),
        specifications: typeof specifications === "string" ? specifications : JSON.stringify(specifications),
        stockQuantity: parseInt(stockQuantity) || 0,
        status: status || "ACTIVE",
        tags, seoTitle, seoDescription, seoKeywords, categoryId,
      },
    });

    if (req.files?.length) {
      const imageData = req.files.map((file, index) => ({
        id: uuidv4(),
        url: `/uploads/products/${file.filename}`,
        alt: name,
        isPrimary: index === 0,
        order: index,
        productId: product.id,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }

    await prisma.auditLog.create({
      data: { action: "CREATE", entity: "Product", entityId: product.id, userId: req.user.id, newData: JSON.stringify({ name }) },
    });

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true },
    });

    res.status(201).json({ success: true, message: "Product created successfully", data: fullProduct });
  } catch (error) {
    logger.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Failed to create product", error: error.message });
  }
});

// ADMIN: Update product
router.put("/:id", authenticate, authorize("ADMIN"), upload.array("images", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name, model, description, price, originalPrice, warranty, capacity,
      batteryType, features, specifications, stockQuantity, status,
      tags, seoTitle, seoDescription, categoryId,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (model !== undefined) updateData.model = model;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined && price !== "") updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice !== "" ? parseFloat(originalPrice) : null;
    if (warranty !== undefined) updateData.warranty = warranty;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (batteryType !== undefined) updateData.batteryType = batteryType;
    if (features !== undefined) updateData.features = features;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (stockQuantity !== undefined && stockQuantity !== "") updateData.stockQuantity = parseInt(stockQuantity);
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (categoryId !== undefined && categoryId !== "") updateData.categoryId = categoryId;

    const product = await prisma.product.update({ where: { id }, data: updateData });

    if (req.files?.length) {
      const imageData = req.files.map((file, index) => ({
        id: uuidv4(),
        url: `/uploads/products/${file.filename}`,
        alt: product.name,
        isPrimary: false,
        order: index + 100,
        productId: product.id,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }

    await prisma.auditLog.create({
      data: { action: "UPDATE", entity: "Product", entityId: id, userId: req.user.id, oldData: JSON.stringify(existing), newData: JSON.stringify(updateData) },
    });

    const fullProduct = await prisma.product.findUnique({ where: { id }, include: { images: true, category: true } });
    res.json({ success: true, message: "Product updated successfully", data: fullProduct });
  } catch (error) {
    logger.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// ADMIN: Delete product
router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.update({ where: { id }, data: { status: "DISCONTINUED" } });
    await prisma.auditLog.create({
      data: { action: "DELETE", entity: "Product", entityId: id, userId: req.user.id },
    });
    res.json({ success: true, message: "Product removed from website" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

// ADMIN: Delete product image
router.delete("/:id/images/:imageId", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
});

// PUBLIC: Get categories
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
});

// ADMIN: CRUD categories
router.post("/categories", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await prisma.productCategory.create({ data: { name, slug, description, image } });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
});

module.exports = router;
