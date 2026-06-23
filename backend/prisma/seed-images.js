const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Linking product images...");

  // Image URLs (served by backend at /uploads/products/...)
  const IMG = {
    box:       "/uploads/products/terranova-compact-box.jpeg",
    brochure:  "/uploads/products/terranova-brochure-specs.jpeg",
    clean:     "/uploads/products/terranova-product-clean.jpeg",
    wallBig:   "/uploads/products/terranova-wall-mount-installed.jpeg",
    floor:     "/uploads/products/terranova-floor-setup.jpeg",
  };

  const assignments = [
    {
      slug: "terranova-t1000-gen1-floor-mount",
      images: [
        { url: IMG.clean,    alt: "Terranova T-1000 Gen 1 — Lithium Inverter with Inbuilt Battery", isPrimary: true,  order: 1 },
        { url: IMG.box,      alt: "Terranova compact unit — 5 Year Battery Warranty",               isPrimary: false, order: 2 },
        { url: IMG.floor,    alt: "Terranova floor stand setup installed",                           isPrimary: false, order: 3 },
        { url: IMG.brochure, alt: "Terranova T-1000 specifications and benefits",                    isPrimary: false, order: 4 },
      ],
    },
    {
      slug: "terranova-t1150-gen1-wall-mount",
      images: [
        { url: IMG.clean,    alt: "Terranova T-1150 Gen 1 — Lithium Inverter Wall Mount",           isPrimary: true,  order: 1 },
        { url: IMG.box,      alt: "Terranova compact unit box — 5 Year Battery Warranty",           isPrimary: false, order: 2 },
        { url: IMG.brochure, alt: "Terranova T-1150 specifications and benefits",                    isPrimary: false, order: 3 },
      ],
    },
    {
      slug: "terranova-2kv-standalone-floor",
      images: [
        { url: IMG.floor,   alt: "Terranova 2kV standalone floor unit installed",                   isPrimary: true,  order: 1 },
        { url: IMG.wallBig, alt: "Terranova high capacity inverter unit",                            isPrimary: false, order: 2 },
      ],
    },
    {
      slug: "terranova-2kv-wall-mount",
      images: [
        { url: IMG.wallBig, alt: "Terranova 2kV wall mount installed — Digital Home UPS",           isPrimary: true,  order: 1 },
        { url: IMG.floor,   alt: "Terranova inverter system",                                        isPrimary: false, order: 2 },
      ],
    },
    {
      slug: "terranova-3kv",
      images: [
        { url: IMG.wallBig, alt: "Terranova 3kV high capacity inverter",                             isPrimary: true,  order: 1 },
        { url: IMG.floor,   alt: "Terranova floor stand inverter setup",                             isPrimary: false, order: 2 },
      ],
    },
    {
      slug: "terranova-5kv",
      images: [
        { url: IMG.wallBig, alt: "Terranova 5kV industrial grade inverter",                          isPrimary: true,  order: 1 },
        { url: IMG.floor,   alt: "Terranova high capacity inverter installation",                    isPrimary: false, order: 2 },
      ],
    },
  ];

  for (const { slug, images } of assignments) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) { console.log("NOT FOUND:", slug); continue; }

    // Remove existing images first
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    // Add new images
    for (const img of images) {
      await prisma.productImage.create({ data: { ...img, productId: product.id } });
    }
    console.log(`✅ ${product.name} — ${images.length} images linked`);
  }

  console.log("\n✅ All product images linked!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
