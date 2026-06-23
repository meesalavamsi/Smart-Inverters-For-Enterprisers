const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Adding sample products...");

  const cats = await prisma.productCategory.findMany();
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const products = [
    {
      name: "Luminous Eco Volt Neo 1050",
      model: "ECO-VOLT-1050",
      slug: "luminous-eco-volt-neo-1050",
      description: "Best-in-class home UPS inverter with pure sine wave output. Ideal for homes with TVs, fans, lights and a refrigerator. Smart charging technology extends battery life.",
      price: 5499,
      originalPrice: 6200,
      warranty: "2 Years",
      capacity: "900 VA",
      batteryType: "Lead Acid",
      features: JSON.stringify([
        "Pure Sine Wave output",
        "Smart charging technology",
        "LCD display with battery health indicator",
        "Overload and short circuit protection",
        "MCB protection",
        "Low harmonic distortion"
      ]),
      specifications: JSON.stringify({
        "Output Power": "900 VA / 756W",
        "Input Voltage": "100V - 290V",
        "Output Voltage": "220V ± 2%",
        "Battery Type": "12V Lead Acid",
        "Charging Current": "10A",
        "Transfer Time": "< 10ms",
        "Efficiency": "> 90%",
        "Weight": "6.5 kg",
        "Warranty": "2 Years"
      }),
      stockQuantity: 15,
      status: "ACTIVE",
      tags: "home inverter,sine wave,luminous",
      seoTitle: "Luminous Eco Volt Neo 1050 - Home Inverter | Smart Inverter's",
      rating: 4.5,
      reviewCount: 32,
      salesCount: 47,
      categoryId: catMap["home-inverters"],
    },
    {
      name: "Microtek UPS EB 900 VA",
      model: "MICROTEK-EB-900",
      slug: "microtek-ups-eb-900",
      description: "Advanced microcontroller-based UPS inverter with fast battery charging. Perfect for 2-3 bedroom homes. Energy efficient with auto-restart feature.",
      price: 4299,
      originalPrice: 5000,
      warranty: "2 Years",
      capacity: "900 VA",
      batteryType: "Lead Acid",
      features: JSON.stringify([
        "Microcontroller-based design",
        "Fast battery charging",
        "Auto restart after mains restoration",
        "Overload alarm and auto cutoff",
        "LED charge indicator",
        "Built-in MCB protection"
      ]),
      specifications: JSON.stringify({
        "Output Power": "900 VA / 720W",
        "Input Voltage": "90V - 300V",
        "Output Voltage": "220V ± 3%",
        "Battery Type": "12V Lead Acid",
        "Charging Current": "8A",
        "Transfer Time": "< 8ms",
        "Efficiency": "> 88%",
        "Weight": "5.8 kg",
        "Warranty": "2 Years"
      }),
      stockQuantity: 20,
      status: "ACTIVE",
      tags: "home inverter,microtek,affordable",
      rating: 4.2,
      reviewCount: 28,
      salesCount: 62,
      categoryId: catMap["home-inverters"],
    },
    {
      name: "Exide 150Ah Tall Tubular Battery",
      model: "EXIDE-TT-150AH",
      slug: "exide-150ah-tall-tubular",
      description: "Premium tall tubular battery with superior performance. Designed for long power backup and extended cycle life. Ideal for areas with frequent power cuts.",
      price: 12500,
      originalPrice: 14000,
      warranty: "5 Years (3+2)",
      capacity: "150 Ah",
      batteryType: "Lead Acid Tubular",
      features: JSON.stringify([
        "Tall tubular technology",
        "Superior cycle life (500+ cycles)",
        "Low maintenance design",
        "Faster recharge",
        "Corrosion-resistant alloy",
        "Suitable for daily deep discharge"
      ]),
      specifications: JSON.stringify({
        "Capacity": "150 Ah",
        "Voltage": "12V",
        "Technology": "Tall Tubular",
        "Backup Time": "10-12 hrs (2 fans + 4 lights)",
        "Weight": "51 kg",
        "Dimensions": "502 x 191 x 440 mm",
        "Warranty": "5 Years (3 Full + 2 Pro-rata)"
      }),
      stockQuantity: 10,
      status: "ACTIVE",
      tags: "battery,exide,tubular,150ah",
      rating: 4.7,
      reviewCount: 55,
      salesCount: 78,
      categoryId: catMap["inverter-batteries"],
    },
    {
      name: "Amaron Inverter 150Ah",
      model: "AMARON-INV-150AH",
      slug: "amaron-inverter-150ah",
      description: "Amaron's PowerStack technology battery with highest reserve capacity. Handles deep discharge cycles better than conventional batteries. Best for 8-12 hour power cuts.",
      price: 13200,
      originalPrice: 14500,
      warranty: "4 Years (3+1)",
      capacity: "150 Ah",
      batteryType: "Lead Acid Tubular",
      features: JSON.stringify([
        "PowerStack technology",
        "Highest reserve capacity",
        "Factory-charged, ready to use",
        "Silver alloy-positive spines",
        "Electrolyte level indicator",
        "BHD (Battery Health Diagnostics)"
      ]),
      specifications: JSON.stringify({
        "Capacity": "150 Ah (C20)",
        "Voltage": "12V",
        "Technology": "Tubular",
        "Backup": "8-12 hrs (typical home)",
        "Weight": "49 kg",
        "Warranty": "4 Years (3 + 1)"
      }),
      stockQuantity: 8,
      status: "ACTIVE",
      tags: "battery,amaron,inverter,150ah",
      rating: 4.6,
      reviewCount: 41,
      salesCount: 56,
      categoryId: catMap["inverter-batteries"],
    },
    {
      name: "Su-Kam Falcon+ 2 KVA Solar Inverter",
      model: "SUKAM-FALCON-2KVA",
      slug: "sukam-falcon-2kva-solar",
      description: "Hybrid solar inverter with MPPT charge controller. Works with solar panels, grid, and battery simultaneously. Perfect for homes aiming to reduce electricity bills.",
      price: 18999,
      originalPrice: 22000,
      warranty: "3 Years",
      capacity: "2000 VA",
      batteryType: "Solar Compatible",
      features: JSON.stringify([
        "Built-in MPPT solar charge controller",
        "Works on solar + grid + battery",
        "LCD display with solar power generation stats",
        "Grid-tie optional",
        "Auto switch to solar priority",
        "Wi-Fi monitoring ready"
      ]),
      specifications: JSON.stringify({
        "Output Power": "2000 VA / 1600W",
        "Solar Input": "Up to 1500W",
        "MPPT Range": "30V - 100V",
        "Battery": "24V / 48V configurable",
        "Efficiency": "> 95%",
        "Weight": "12 kg",
        "Warranty": "3 Years"
      }),
      stockQuantity: 5,
      status: "ACTIVE",
      tags: "solar inverter,mppt,hybrid,sukam",
      rating: 4.4,
      reviewCount: 19,
      salesCount: 22,
      categoryId: catMap["solar-inverters"],
    },
    {
      name: "Genus Lithium Ion 24V 100Ah Battery",
      model: "GENUS-LI-24V100",
      slug: "genus-lithium-24v-100ah",
      description: "Next-gen lithium iron phosphate (LiFePO4) battery. Zero maintenance, 3x longer life than lead acid, 50% lighter. Works perfectly with any solar or home inverter.",
      price: 35000,
      originalPrice: 40000,
      warranty: "5 Years",
      capacity: "100 Ah",
      batteryType: "Lithium Ion (LiFePO4)",
      features: JSON.stringify([
        "LiFePO4 chemistry — safest lithium",
        "Zero water topping maintenance",
        "3000+ deep charge cycles",
        "Built-in BMS protection",
        "50% lighter than lead acid",
        "Fast charging (0 to 100% in 4 hrs)",
        "No acid spills — eco friendly"
      ]),
      specifications: JSON.stringify({
        "Capacity": "100 Ah",
        "Voltage": "24V",
        "Technology": "LiFePO4",
        "Cycle Life": "3000+ cycles",
        "Weight": "22 kg (vs 48kg lead acid)",
        "Charge Time": "4-5 hours",
        "Operating Temp": "-10°C to 50°C",
        "Warranty": "5 Years"
      }),
      stockQuantity: 6,
      status: "ACTIVE",
      tags: "lithium battery,lifepo4,maintenance free,modern",
      rating: 4.8,
      reviewCount: 12,
      salesCount: 18,
      categoryId: catMap["inverter-batteries"],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({ data: p });
      console.log("Created:", p.name);
    } else {
      console.log("Already exists:", p.name);
    }
  }

  console.log("\n✅ Products seeded!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
