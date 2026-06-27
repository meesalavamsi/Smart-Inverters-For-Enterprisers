import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import StatsCounter from "@/components/home/StatsCounter";
import Benefits from "@/components/home/Benefits";
import Services from "@/components/home/Services";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BatteryComparison from "@/components/home/BatteryComparison";
import VideoSection from "@/components/home/VideoSection";
import Testimonials from "@/components/home/Testimonials";
import RecyclingBanner from "@/components/home/RecyclingBanner";
import CTA from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Smart Inverter's Ravulapalem | #1 Terranova Lithium Battery Dealer",
  description:
    "Buy Terranova LiFePO4 lithium inverter batteries in Ravulapalem. Zero maintenance, 5-year warranty, expert installation & 24/7 support. East Godavari's trusted inverter shop. Call 9133639888.",
  keywords: [
    "smart inverters ravulapalem",
    "terranova battery ravulapalem",
    "lithium inverter ravulapalem",
    "inverter shop east godavari",
    "LiFePO4 battery dealer andhra pradesh",
    "buy inverter ravulapalem",
    "home inverter battery ravulapalem",
  ],
  alternates: {
    canonical: "/en",
    languages: { "te-IN": "/te", "hi-IN": "/hi" },
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsCounter />
      <Benefits />
      <Services />
      <FeaturedProducts />
      <BatteryComparison />
      <VideoSection />
      <Testimonials />
      <RecyclingBanner />
      <CTA />
    </>
  );
}
