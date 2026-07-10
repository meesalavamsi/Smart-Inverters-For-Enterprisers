import type { Metadata } from "next";
import ProductsListClient from "./ProductsListClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.smartinverters.in";

export const metadata: Metadata = {
  title: "Lithium & Smart Inverters | LiFePO4 Inverter Batteries",
  description:
    "Shop Terranova smart inverters and LiFePO4 lithium inverter batteries — zero maintenance, 5-year warranty, expert installation & 24/7 support. Authorized dealer in Ravulapalem, Andhra Pradesh.",
  keywords: [
    "smart inverters", "lithium inverters", "lifepo4 inverters", "smart inverter",
    "lithium inverter battery", "inverter battery price", "terranova inverters",
    "smart inverter ravulapalem", "lithium inverter andhra pradesh", "inverter dealer near me",
  ],
  alternates: { canonical: `${SITE_URL}/en/products` },
  openGraph: {
    title: "Lithium & Smart Inverters | Terranova Dealer Ravulapalem",
    description: "Zero-maintenance LiFePO4 lithium inverter batteries with 5-year warranty. Authorized Terranova dealer in Ravulapalem, Andhra Pradesh.",
    url: `${SITE_URL}/en/products`,
    siteName: "Smart Inverter's Ravulapalem",
    type: "website",
  },
};

export default function ProductsPage() {
  return <ProductsListClient />;
}
