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
  title: "Smart Inverter's - Premium Inverters & Batteries in Ravulapalem",
  description: "Buy premium inverters and batteries online. Expert installation, repair, and maintenance services in Ravulapalem, Andhra Pradesh. 7207762577",
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
