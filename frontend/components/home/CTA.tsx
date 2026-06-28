"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MessageCircle, ArrowRight, Zap } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function CTA() {
  const t = useTranslations("cta");
  const waUrl = getWhatsAppUrl("Hello! I want to book a service for my inverter.");

  return (
    <section className="py-28 relative overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100 opacity-60" />
        <div className="orb absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-100 opacity-50" style={{ animationDelay: "5s" }} />
        <div className="absolute inset-0 grid-pattern opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold mb-8 shadow-md shadow-blue-200">
            <Zap className="h-4 w-4" />
            {t("badge")}
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            <span className="gradient-text-blue">{t("headline")}</span>
          </h2>

          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2.5 bg-blue-600 text-white px-10 py-[18px] rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-blue-glow-lg hover:-translate-y-1"
            >
              {t("browseProducts")}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/service-booking"
              className="inline-flex items-center justify-center gap-2 border-2 border-blue-200 text-blue-700 px-10 py-[18px] rounded-2xl font-bold text-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
            >
              {t("bookService")}
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-10 py-[18px] rounded-2xl font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-200"
            >
              <MessageCircle className="h-5 w-5" /> {t("whatsapp")}
            </a>
          </div>

          <div className="glass-premium rounded-2xl px-8 py-6 inline-flex flex-col sm:flex-row items-center gap-8 shadow-blue-glow">
            <div className="flex items-center gap-3 text-gray-800">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-medium">{t("callLabel")}</p>
                <a href="tel:9951447358" className="block text-2xl font-extrabold hover:text-blue-600 transition-colors">9951447358</a>
                <a href="tel:9133639888" className="block text-sm font-semibold text-gray-500 hover:text-blue-500 transition-colors">9133639888 (WhatsApp)</a>
              </div>
            </div>
            <div className="w-px h-12 bg-gray-200 hidden sm:block" />
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium mb-1">{t("workingHours")}</p>
              <p className="font-bold text-gray-800">{t("weekdayHours")}</p>
              <p className="text-sm text-gray-500">{t("weekendHours")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
