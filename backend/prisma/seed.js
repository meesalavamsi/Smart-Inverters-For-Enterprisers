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

  // Sample YouTube videos
  const videos = [
    { title: "How to Install an Inverter at Home", youtubeId: "dQw4w9WgXcQ", category: "INSTALLATION", description: "Step-by-step home inverter installation guide", duration: "12:45", order: 1 },
    { title: "Inverter Battery Safety Tips", youtubeId: "dQw4w9WgXcQ", category: "SAFETY", description: "Essential safety precautions for inverter batteries", duration: "8:30", order: 1 },
    { title: "Battery Maintenance Best Practices", youtubeId: "dQw4w9WgXcQ", category: "MAINTENANCE", description: "How to extend battery life", duration: "10:15", order: 1 },
    { title: "Troubleshooting Common Inverter Problems", youtubeId: "dQw4w9WgXcQ", category: "TROUBLESHOOTING", description: "Fix common inverter issues", duration: "15:20", order: 1 },
    { title: "Solar Inverter Setup Guide", youtubeId: "dQw4w9WgXcQ", category: "INSTALLATION", description: "How to set up a solar inverter system", duration: "18:00", order: 2 },
    { title: "How to Check Battery Water Level", youtubeId: "dQw4w9WgXcQ", category: "MAINTENANCE", description: "Checking and topping up battery water", duration: "5:30", order: 2 },
  ];

  for (const video of videos) {
    const existing = await prisma.youtubeResource.findFirst({ where: { youtubeId: video.youtubeId, title: video.title } });
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
    { key: "business_phone", value: "7207762577", group: "contact" },
    { key: "business_whatsapp", value: "7207762577", group: "contact" },
    { key: "business_address", value: "Indira Colony (Near Community Hall), Daggara, Ravulapalem", group: "contact" },
    { key: "business_email", value: "info@smartinverters.in", group: "contact" },
    { key: "working_hours", value: "Mon-Sat: 9:00 AM - 7:00 PM, Sun: 10:00 AM - 2:00 PM", group: "contact" },
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
