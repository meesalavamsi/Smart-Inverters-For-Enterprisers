import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Smart Inverter's - Premium Inverters & Batteries", template: "%s | Smart Inverter's" },
  description: "Smart Inverter's - Your trusted partner for premium inverter batteries, expert installation, and 24/7 support in Ravulapalem, Andhra Pradesh.",
  keywords: ["inverter", "battery", "inverter battery", "Ravulapalem", "Andhra Pradesh", "solar inverter", "smart inverter"],
  authors: [{ name: "Smart Inverter's" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Smart Inverter's",
    title: "Smart Inverter's - Premium Inverters & Batteries",
    description: "Premium inverter batteries with expert installation and after-sales support.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
