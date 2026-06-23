"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Zap, Phone, MapPin, Mail, Clock, MessageCircle } from "lucide-react";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);
import { getWhatsAppUrl } from "@/lib/utils";

export default function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("contact");

  const waUrl = getWhatsAppUrl("Hello! I'm interested in your inverter products and services.");

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Strip */}
      <div className="bg-blue-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Need expert help with your inverter?</h3>
              <p className="text-blue-200 text-sm mt-1">Call us or WhatsApp for instant assistance</p>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${tc("phone")}`}
                className="flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
                <Phone className="h-4 w-4" />Call Now
              </a>
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors">
                <MessageCircle className="h-4 w-4" />WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Smart <span className="text-blue-400">Inverter's</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t("description")}</p>
            <div className="mt-4 flex gap-3">
              <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com"} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                <FacebookIcon />
              </a>
              <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com"} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                <InstagramIcon />
              </a>
              <a href={process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com"} target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("quickLinks")}</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Products" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/order-tracking", label: "Order Tracking" },
                { href: "/feedback", label: "Feedback" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("ourServices")}</h4>
            <ul className="space-y-2">
              {[
                "Inverter Installation",
                "Battery Replacement",
                "Repair & Maintenance",
                "Emergency Service",
                "Annual Maintenance Contract",
                "Battery Recycling",
              ].map((s) => (
                <li key={s}>
                  <Link href="/service-booking" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                <span>{tc("address")}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-blue-400" />
                <a href={`tel:${tc("phone")}`} className="text-gray-400 hover:text-blue-400 transition-colors">{tc("phone")}</a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-400" />
                <a href={`mailto:${tc("email")}`} className="text-gray-400 hover:text-blue-400 transition-colors">{tc("email")}</a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                <span>{tc("hours")}</span>
              </li>
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  <MessageCircle className="h-4 w-4" />Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Smart Inverter's. {t("rights")}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
