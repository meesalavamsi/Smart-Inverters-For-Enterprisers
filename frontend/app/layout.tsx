import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://frontend-rho-kohl-18.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Smart Inverter's Ravulapalem | Terranova Lithium Inverter Dealer",
    template: "%s | Smart Inverter's Ravulapalem",
  },
  description:
    "Smart Inverter's — Ravulapalem's exclusive Terranova authorized dealer. Buy LiFePO4 lithium inverter batteries, expert installation & 24/7 service in East Godavari, Andhra Pradesh. Call 9133639888.",
  keywords: [
    "smart inverters ravulapalem",
    "inverter battery ravulapalem",
    "terranova dealer ravulapalem",
    "lithium battery ravulapalem",
    "inverter shop ravulapalem",
    "LiFePO4 inverter andhra pradesh",
    "inverter installation east godavari",
    "battery dealer ravulapalem",
    "inverter service ravulapalem",
    "smart inverters east godavari",
    "terranova authorized dealer",
    "best inverter battery andhra pradesh",
    "home inverter ravulapalem",
    "power backup ravulapalem",
    "inverter repair ravulapalem",
    "solar inverter ravulapalem",
    "9133639888",
  ],
  authors: [{ name: "Smart Inverter's", url: baseUrl }],
  creator: "Smart Inverter's",
  publisher: "Smart Inverter's",
  category: "Electronics & Home Appliances",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "Smart Inverter's Ravulapalem",
    title: "Smart Inverter's Ravulapalem | Terranova Lithium Inverter Dealer",
    description:
      "Ravulapalem's exclusive Terranova authorized dealer. Zero-maintenance LiFePO4 lithium inverters, expert installation & 24/7 support. East Godavari, Andhra Pradesh.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Inverter's Ravulapalem — Terranova Authorized Dealer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Inverter's Ravulapalem | Terranova Lithium Inverter Dealer",
    description:
      "Zero-maintenance LiFePO4 lithium inverters. Expert installation & 24/7 support in Ravulapalem, East Godavari.",
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-IN": `${baseUrl}/en`,
      "te-IN": `${baseUrl}/te`,
      "hi-IN": `${baseUrl}/hi`,
    },
  },
  verification: {
    google: "KyOenAvFOHxRaNk5kJJ3KtARHl5ZJf0MYImHZ-uwxIg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Local Business Structured Data — helps Google Maps & local search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ElectronicsStore",
              name: "Smart Inverter's",
              alternateName: "Smart Inverters Ravulapalem",
              description:
                "Ravulapalem's exclusive Terranova authorized dealer for LiFePO4 lithium inverter batteries, expert installation and 24/7 after-sales support in East Godavari, Andhra Pradesh.",
              url: baseUrl,
              telephone: "+919133639888",
              email: "maniagency.rvpm@gmail.com",
              foundingDate: "2023",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Indira Colony, Near Community Hall, Daggara",
                addressLocality: "Ravulapalem",
                addressRegion: "Andhra Pradesh",
                postalCode: "533238",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "17.0463",
                longitude: "81.8284",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "09:00",
                  closes: "22:00",
                },
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+919133639888",
                  contactType: "customer service",
                  areaServed: "IN",
                  availableLanguage: ["Telugu", "Hindi", "English"],
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+919951447358",
                  contactType: "technical support",
                  areaServed: "IN",
                  availableLanguage: ["Telugu", "Hindi", "English"],
                },
              ],
              sameAs: [
                "https://wa.me/919133639888",
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Inverter & Battery Products",
                itemListElement: [
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Terranova LiFePO4 Lithium Inverter Battery" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Smart Inverter 1kV–5kV" } },
                  { "@type": "Offer", itemOffered: { "@type": "Service", name: "Inverter Installation Service" } },
                  { "@type": "Offer", itemOffered: { "@type": "Service", name: "Battery Repair & Maintenance" } },
                ],
              },
              brand: {
                "@type": "Brand",
                name: "Terranova Green Energy",
              },
              areaServed: [
                { "@type": "City", name: "Ravulapalem" },
                { "@type": "AdministrativeArea", name: "East Godavari" },
                { "@type": "State", name: "Andhra Pradesh" },
              ],
              priceRange: "₹₹",
              currenciesAccepted: "INR",
              paymentAccepted: "Cash, UPI, Bank Transfer",
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
