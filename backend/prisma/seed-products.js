const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Adding Terranova products...");

  // Update categories to match Terranova product lines
  const categoryUpdates = [
    { slug: "home-inverters", name: "Home Inverters", description: "Terranova Lithium Home UPS Inverters — compact & wall mountable" },
    { slug: "commercial-inverters", name: "High Capacity Inverters", description: "Terranova 2kV, 3kV, 5kV floor-stand inverters for large homes & offices" },
    { slug: "solar-inverters", name: "Solar Inverters", description: "Solar-compatible hybrid inverter systems" },
    { slug: "inverter-batteries", name: "Lithium Battery Packs", description: "Terranova LiFePO4 standalone battery packs" },
    { slug: "accessories", name: "Accessories", description: "Cables, stands, connectors and accessories" },
  ];

  for (const cat of categoryUpdates) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { ...cat, isActive: true },
    });
  }

  const cats = await prisma.productCategory.findMany();
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  // Delete old lead-acid / water-based products
  const oldSlugs = [
    "luminous-eco-volt-neo-1050",
    "microtek-ups-eb-900",
    "exide-150ah-tall-tubular",
    "amaron-inverter-150ah",
    "sukam-falcon-2kva-solar",
    "genus-lithium-24v-100ah",
  ];
  for (const slug of oldSlugs) {
    await prisma.product.deleteMany({ where: { slug } });
  }
  console.log("Old products removed");

  const COMMON_FEATURES = [
    "Zero maintenance — no water topping ever",
    "LiFePO4 chemistry — safest lithium technology",
    "3000+ deep charge cycles",
    "Built-in BMS (Battery Management System)",
    "UPS & Inverter mode",
    "S-BR Technology Inside",
    "Overload protection",
    "Short circuit protection",
    "Battery deep discharge protection",
    "Battery over charge protection",
    "Over temperature protection",
    "Toxic gas free — eco friendly",
  ];

  const products = [
    {
      name: "Terranova T-1000 Gen 1 — Floor Mount",
      model: "TERRA-T1000-G1-FM",
      slug: "terranova-t1000-gen1-floor-mount",
      description: "Compact lithium inverter with inbuilt LiFePO4 battery. 800VA Home UPS with S-BR technology. Zero maintenance — no water, no acid, no fumes. Perfect for 2–3 bedroom homes. Floor mountable design.",
      price: 34000,
      warranty: "5 Years Battery / 2 Years Electronics",
      capacity: "1 kV / 800 VA",
      batteryType: "LiFePO4 (Lithium Iron Phosphate)",
      features: JSON.stringify(COMMON_FEATURES),
      specifications: JSON.stringify({
        "Model": "T-1000 Gen 1",
        "Output Power": "800 VA / 640W",
        "Battery Capacity": "960 Wh LiFePO4",
        "Technology": "S-BR + LiFePO4",
        "Mounting": "Floor Mountable",
        "Warranty (Battery)": "5 Years",
        "Warranty (Electronics)": "2 Years",
        "Charge Cycles": "3000+",
        "Manufacturer": "Terranova Green Energy Pvt. Ltd.",
      }),
      stockQuantity: 10,
      status: "ACTIVE",
      tags: "terranova,lithium,lifepo4,home inverter,floor mount,800va,zero maintenance",
      seoTitle: "Terranova T-1000 Gen 1 Floor Mount Lithium Inverter | Smart Inverter's",
      seoDescription: "Buy Terranova T-1000 Gen 1 800VA LiFePO4 lithium inverter at ₹34,000. Zero maintenance, 5-year battery warranty. Available at Smart Inverter's, Ravulapalem.",
      rating: 4.8,
      reviewCount: 0,
      salesCount: 0,
      categoryId: catMap["home-inverters"],
    },
    {
      name: "Terranova T-1150 Gen 1 — Wall Mount",
      model: "TERRA-T1150-G1-WM",
      slug: "terranova-t1150-gen1-wall-mount",
      description: "Elegant wall-mountable lithium inverter with inbuilt LiFePO4 battery. 1000VA Home UPS — perfect for modern homes that want a clean, space-saving installation. Zero maintenance, no acid, no fumes.",
      price: 39000,
      warranty: "5 Years Battery / 2 Years Electronics",
      capacity: "1 kV / 1000 VA",
      batteryType: "LiFePO4 (Lithium Iron Phosphate)",
      features: JSON.stringify(COMMON_FEATURES),
      specifications: JSON.stringify({
        "Model": "T-1150 Gen 1",
        "Output Power": "1000 VA / 800W",
        "Battery Capacity": "1152 Wh LiFePO4",
        "Technology": "S-BR + LiFePO4",
        "Mounting": "Wall Mountable",
        "Warranty (Battery)": "5 Years",
        "Warranty (Electronics)": "2 Years",
        "Charge Cycles": "3000+",
        "Manufacturer": "Terranova Green Energy Pvt. Ltd.",
      }),
      stockQuantity: 10,
      status: "ACTIVE",
      tags: "terranova,lithium,lifepo4,home inverter,wall mount,1000va,zero maintenance",
      seoTitle: "Terranova T-1150 Gen 1 Wall Mount Lithium Inverter | Smart Inverter's",
      seoDescription: "Buy Terranova T-1150 Gen 1 1000VA LiFePO4 wall mount inverter at ₹39,000. Zero maintenance, 5-year battery warranty. Available at Smart Inverter's, Ravulapalem.",
      rating: 4.9,
      reviewCount: 0,
      salesCount: 0,
      categoryId: catMap["home-inverters"],
    },
    {
      name: "Terranova 2 kV Standalone — Floor Stand",
      model: "TERRA-2KV-STANDALONE",
      slug: "terranova-2kv-standalone-floor",
      description: "High-capacity 2kV standalone lithium inverter system. Ideal for large homes, shops, and small offices. Robust floor-stand design with powerful LiFePO4 battery backup.",
      price: 69000,
      warranty: "5 Years Battery",
      capacity: "2 kV / 2000 VA",
      batteryType: "LiFePO4 (Lithium Iron Phosphate)",
      features: JSON.stringify(COMMON_FEATURES),
      specifications: JSON.stringify({
        "Output Power": "2000 VA / 1600W",
        "Battery Type": "LiFePO4",
        "Mounting": "Floor Stand",
        "Warranty (Battery)": "5 Years",
        "Charge Cycles": "3000+",
        "Manufacturer": "Terranova Green Energy Pvt. Ltd.",
      }),
      stockQuantity: 5,
      status: "ACTIVE",
      tags: "terranova,lithium,2kv,standalone,floor stand,large home,office",
      seoTitle: "Terranova 2kV Standalone Lithium Inverter | Smart Inverter's",
      rating: 4.8,
      reviewCount: 0,
      salesCount: 0,
      categoryId: catMap["commercial-inverters"],
    },
    {
      name: "Terranova 2 kV — Wall Mount",
      model: "TERRA-2KV-WALLMOUNT",
      slug: "terranova-2kv-wall-mount",
      description: "2kV wall-mountable lithium inverter — same powerful performance as the standalone but with a sleek wall-mount design. Perfect for homes and offices with limited floor space.",
      price: 76000,
      warranty: "5 Years Battery",
      capacity: "2 kV / 2000 VA",
      batteryType: "LiFePO4 (Lithium Iron Phosphate)",
      features: JSON.stringify(COMMON_FEATURES),
      specifications: JSON.stringify({
        "Output Power": "2000 VA / 1600W",
        "Battery Type": "LiFePO4",
        "Mounting": "Wall Mountable",
        "Warranty (Battery)": "5 Years",
        "Charge Cycles": "3000+",
        "Manufacturer": "Terranova Green Energy Pvt. Ltd.",
      }),
      stockQuantity: 5,
      status: "ACTIVE",
      tags: "terranova,lithium,2kv,wall mount,home,office",
      seoTitle: "Terranova 2kV Wall Mount Lithium Inverter | Smart Inverter's",
      rating: 4.8,
      reviewCount: 0,
      salesCount: 0,
      categoryId: catMap["commercial-inverters"],
    },
    {
      name: "Terranova 3 kV — High Capacity",
      model: "TERRA-3KV",
      slug: "terranova-3kv",
      description: "3kV high-capacity Terranova lithium inverter for large homes, commercial establishments, and businesses with heavy power requirements. Zero maintenance LiFePO4 technology.",
      price: 112000,
      warranty: "5 Years Battery",
      capacity: "3 kV / 3000 VA",
      batteryType: "LiFePO4 (Lithium Iron Phosphate)",
      features: JSON.stringify(COMMON_FEATURES),
      specifications: JSON.stringify({
        "Output Power": "3000 VA / 2400W",
        "Battery Type": "LiFePO4",
        "Warranty (Battery)": "5 Years",
        "Charge Cycles": "3000+",
        "Manufacturer": "Terranova Green Energy Pvt. Ltd.",
      }),
      stockQuantity: 3,
      status: "ACTIVE",
      tags: "terranova,lithium,3kv,high capacity,commercial",
      seoTitle: "Terranova 3kV Lithium Inverter | Smart Inverter's",
      rating: 4.9,
      reviewCount: 0,
      salesCount: 0,
      categoryId: catMap["commercial-inverters"],
    },
    {
      name: "Terranova 5 kV — Industrial Grade",
      model: "TERRA-5KV",
      slug: "terranova-5kv",
      description: "5kV industrial-grade Terranova lithium inverter. For large establishments, factories, and heavy commercial use. The most powerful unit in the Terranova lineup — zero maintenance, maximum reliability.",
      price: 178000,
      warranty: "5 Years Battery",
      capacity: "5 kV / 5000 VA",
      batteryType: "LiFePO4 (Lithium Iron Phosphate)",
      features: JSON.stringify(COMMON_FEATURES),
      specifications: JSON.stringify({
        "Output Power": "5000 VA / 4000W",
        "Battery Type": "LiFePO4",
        "Warranty (Battery)": "5 Years",
        "Charge Cycles": "3000+",
        "Manufacturer": "Terranova Green Energy Pvt. Ltd.",
      }),
      stockQuantity: 2,
      status: "ACTIVE",
      tags: "terranova,lithium,5kv,industrial,commercial,heavy duty",
      seoTitle: "Terranova 5kV Industrial Lithium Inverter | Smart Inverter's",
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      categoryId: catMap["commercial-inverters"],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({ data: p });
      console.log("Created:", p.name, "— ₹" + p.price.toLocaleString("en-IN"));
    } else {
      await prisma.product.update({ where: { slug: p.slug }, data: p });
      console.log("Updated:", p.name);
    }
  }

  console.log("\n✅ Terranova products seeded successfully!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
