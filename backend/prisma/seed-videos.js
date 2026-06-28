const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const videos = [
  {
    title: "Inverter Installation Guide - Step by Step",
    youtubeId: "YQNXFfza7_c",
    category: "INSTALLATION",
    description: "Complete step-by-step inverter installation at home by our certified technicians",
    order: 1,
    isActive: true,
  },
  {
    title: "Home Inverter Setup - Full Demonstration",
    youtubeId: "Oq2DHDtLuYM",
    category: "INSTALLATION",
    description: "Watch our technician set up a home inverter system from start to finish",
    order: 2,
    isActive: true,
  },
  {
    title: "Battery Connection & Wiring Guide",
    youtubeId: "Syxae_j-qQc",
    category: "INSTALLATION",
    description: "How to safely connect inverter batteries with proper wiring",
    order: 3,
    isActive: true,
  },
  {
    title: "Terranova Inverter - Product Demo",
    youtubeId: "rHgBnmMBUkU",
    category: "PRODUCT_DEMO",
    description: "See the Terranova LiFePO4 smart inverter in action",
    order: 1,
    isActive: true,
  },
  {
    title: "How to Check Inverter Performance",
    youtubeId: "JCwXK44pNqA",
    category: "MAINTENANCE",
    description: "Quick checks to make sure your inverter is running at its best",
    order: 1,
    isActive: true,
  },
  {
    title: "Inverter Troubleshooting - Common Problems Fixed",
    youtubeId: "KPafO3rMBHw",
    category: "TROUBLESHOOTING",
    description: "Diagnose and fix the most common inverter problems at home",
    order: 1,
    isActive: true,
  },
  {
    title: "Lithium Battery vs Lead Acid - Live Comparison",
    youtubeId: "OU_WvgnV1Go",
    category: "PRODUCT_DEMO",
    description: "Real-world comparison showing why lithium beats lead acid every time",
    order: 2,
    isActive: true,
  },
  {
    title: "Smart Inverter Complete Setup Walkthrough",
    youtubeId: "d-kw7pcluLo",
    category: "INSTALLATION",
    description: "End-to-end smart inverter installation demo for East Godavari customers",
    order: 4,
    isActive: true,
  },
  {
    title: "Inverter Battery Maintenance Tips",
    youtubeId: "SRBcYBPE2UM",
    category: "MAINTENANCE",
    description: "How to keep your inverter battery in top condition for years",
    order: 2,
    isActive: true,
  },
  {
    title: "Quick Tips: Inverter Usage & Care",
    youtubeId: "kwMUrbKefds",
    category: "TIPS_TRICKS",
    description: "Daily tips to get the most out of your inverter and save electricity",
    order: 1,
    isActive: true,
  },
];

async function main() {
  console.log("Seeding videos...");

  // Remove old dummy/placeholder videos and add real ones
  await prisma.youtubeResource.deleteMany({});
  console.log("Cleared existing videos");

  for (const video of videos) {
    await prisma.youtubeResource.create({ data: video });
    console.log(`✓ ${video.title}`);
  }

  console.log(`\n✅ ${videos.length} videos seeded successfully!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
