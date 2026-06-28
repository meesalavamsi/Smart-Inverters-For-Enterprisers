const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartinverters.in" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@smartinverters.in",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("Admin created:", admin.email);

  // Product categories
  const categories = [
    { name: "Home Inverters", slug: "home-inverters", description: "Inverters for residential use" },
    { name: "Commercial Inverters", slug: "commercial-inverters", description: "High-capacity inverters for businesses" },
    { name: "Solar Inverters", slug: "solar-inverters", description: "Solar-compatible hybrid inverters" },
    { name: "Inverter Batteries", slug: "inverter-batteries", description: "High-performance batteries" },
    { name: "Accessories", slug: "accessories", description: "Cables, stands, connectors" },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories seeded");

  // Real YouTube videos from @maniprasadatreyapuram/shorts
  const videos = [
    { title: "Inverter Installation Guide - Step by Step", youtubeId: "YQNXFfza7_c", category: "INSTALLATION", description: "Complete step-by-step inverter installation at home", order: 1, isActive: true },
    { title: "Home Inverter Setup - Full Demonstration", youtubeId: "Oq2DHDtLuYM", category: "INSTALLATION", description: "Watch our technician set up a home inverter system", order: 2, isActive: true },
    { title: "Battery Connection & Wiring Guide", youtubeId: "Syxae_j-qQc", category: "INSTALLATION", description: "How to safely connect inverter batteries with proper wiring", order: 3, isActive: true },
    { title: "Terranova Inverter - Product Demo", youtubeId: "rHgBnmMBUkU", category: "PRODUCT_DEMO", description: "See the Terranova LiFePO4 smart inverter in action", order: 1, isActive: true },
    { title: "How to Check Inverter Performance", youtubeId: "JCwXK44pNqA", category: "MAINTENANCE", description: "Quick checks to make sure your inverter is running at its best", order: 1, isActive: true },
    { title: "Inverter Troubleshooting - Common Problems Fixed", youtubeId: "KPafO3rMBHw", category: "TROUBLESHOOTING", description: "Diagnose and fix the most common inverter problems", order: 1, isActive: true },
    { title: "Lithium Battery vs Lead Acid - Live Comparison", youtubeId: "OU_WvgnV1Go", category: "PRODUCT_DEMO", description: "Real-world comparison: lithium vs lead acid battery", order: 2, isActive: true },
    { title: "Smart Inverter Complete Setup Walkthrough", youtubeId: "d-kw7pcluLo", category: "INSTALLATION", description: "End-to-end smart inverter installation demonstration", order: 4, isActive: true },
    { title: "Inverter Battery Maintenance Tips", youtubeId: "SRBcYBPE2UM", category: "MAINTENANCE", description: "How to keep your inverter battery in top condition for years", order: 2, isActive: true },
    { title: "Quick Tips: Inverter Usage & Care", youtubeId: "kwMUrbKefds", category: "TIPS_TRICKS", description: "Daily tips to get the most out of your inverter", order: 1, isActive: true },
  ];

  for (const video of videos) {
    const existing = await prisma.youtubeResource.findFirst({ where: { youtubeId: video.youtubeId } });
    if (!existing) await prisma.youtubeResource.create({ data: video });
  }
  console.log("Videos seeded");

  // Sample recycling resources
  const recyclingResources = [
    { name: "State Pollution Control Board - Rajahmundry", type: "Government", address: "Rajahmundry, East Godavari, AP", phone: "0883-2474000", state: "Andhra Pradesh", district: "East Godavari" },
    { name: "E-Waste Recyclers India Pvt Ltd", type: "Authorized Recycler", address: "JNPC, Kakinada", phone: "0884-2300123", state: "Andhra Pradesh", district: "Kakinada" },
    { name: "Battery Recycling Centre - Vijayawada", type: "Collection Centre", address: "Auto Nagar, Vijayawada", phone: "0866-2540001", state: "Andhra Pradesh", district: "Krishna" },
  ];

  for (const r of recyclingResources) {
    const existing = await prisma.recyclingResource.findFirst({ where: { name: r.name } });
    if (!existing) await prisma.recyclingResource.create({ data: r });
  }
  console.log("Recycling resources seeded");

  // Initial settings
  const settings = [
    { key: "site_name", value: "Smart Inverter's", group: "general" },
    { key: "site_tagline", value: "Power Never Stops", group: "general" },
    { key: "business_phone", value: "9133639888", group: "contact" },
    { key: "business_phone2", value: "9951447358", group: "contact" },
    { key: "business_whatsapp", value: "9133639888", group: "contact" },
    { key: "business_address", value: "Indira Colony (Near Community Hall), Daggara, Ravulapalem", group: "contact" },
    { key: "business_email", value: "maniagency.rvpm@gmail.com", group: "contact" },
    { key: "working_hours", value: "Mon-Sat: 9:00 AM - 10:00 PM, Sun: Office Closed, Emergency: 24/7", group: "contact" },
    { key: "currency", value: "INR", group: "general" },
    { key: "currency_symbol", value: "₹", group: "general" },
    { key: "maintenance_mode", value: "false", group: "general" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("Settings seeded");

  console.log("\n✅ Database seeded successfully!");
  console.log("Admin login: admin@smartinverters.in / Admin@123");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
