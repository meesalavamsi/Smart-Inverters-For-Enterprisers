import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import StatsCounter from "@/components/home/StatsCounter";
import Benefits from "@/components/home/Benefits";
import TrustBadges from "@/components/home/TrustBadges";
import Services from "@/components/home/Services";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BatteryComparison from "@/components/home/BatteryComparison";
import VideoSection from "@/components/home/VideoSection";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import RecyclingBanner from "@/components/home/RecyclingBanner";
import CTA from "@/components/home/CTA";
import { FAQ_DATA } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "Smart Inverter's Ravulapalem | #1 Terranova Lithium Battery Dealer",
  description:
    "Buy Terranova LiFePO4 lithium inverter batteries in Ravulapalem. Zero maintenance, 5-year warranty, expert installation & 24/7 support. East Godavari's trusted inverter shop. Call 9951447358.",
  keywords: [
    "smart inverters ravulapalem",
    "terranova battery ravulapalem",
    "lithium inverter ravulapalem",
    "inverter shop east godavari",
    "LiFePO4 battery dealer andhra pradesh",
    "buy inverter ravulapalem",
    "inverter dealer amalapuram",
    "inverter dealer kothapeta",
    "inverter dealer mandapeta",
    "terranova authorized dealer east godavari",
    "home inverter battery ravulapalem",
  ],
  alternates: {
    canonical: "/en",
    languages: { "te-IN": "/te", "hi-IN": "/hi" },
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.smartinvertersravulapalem.in",
  name: "Smart Inverter's Ravulapalem",
  description:
    "Authorized Terranova Lithium Battery Dealer in Ravulapalem, East Godavari. Expert inverter installation and service across Andhra Pradesh.",
  url: "https://www.smartinvertersravulapalem.in",
  telephone: "+919951447358",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ravulapalem",
    addressLocality: "Ravulapalem",
    addressRegion: "Andhra Pradesh",
    postalCode: "533238",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "17.0497",
    longitude: "81.8316",
  },
  openingHours: "Mo-Su 09:00-21:00",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "5000",
    bestRating: "5",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Smart Inverter's Ravulapalem",
  url: "https://www.smartinvertersravulapalem.in",
  logo: "https://www.smartinvertersravulapalem.in/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+919951447358",
    contactType: "customer service",
    availableLanguage: ["English", "Telugu"],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <Hero />
      <StatsCounter />
      <TrustBadges />
      <Benefits />
      <Services />
      <FeaturedProducts />
      <BatteryComparison />
      <VideoSection />
      <Testimonials />
      <FAQ />
      <RecyclingBanner />
      <CTA />
    </>
  );
}
