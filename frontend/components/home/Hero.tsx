"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Phone, Shield, CheckCircle } from "lucide-react";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-400 animate-spin" />
    </div>
  ),
});

const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), { ssr: false });

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center" style={{ background: "linear-gradient(135deg, #020818 0%, #050d24 40%, #0a1628 70%, #020c1b 100%)" }}>

      {/* Particle network */}
      <ParticleCanvas />

      {/* Blue glow behind 3D scene */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }} />
      <div className="absolute left-0 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 pt-28 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center min-h-[80vh]">

          {/* ── Left: Text ── */}
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2.5 border border-blue-500/30 bg-blue-500/10 text-blue-300 px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              ⚡ Available 24/7 — Emergency Service
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-[4.8rem] font-extrabold leading-[1.03] tracking-tight">
                <span className="text-white">{t("title")}</span>
                <br />
                <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 40%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {t("titleHighlight")}
                </span>
              </h1>
            </motion.div>

            {/* Trust line — #1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-1"
            >
              {[
                "✓ Authorized Terranova Dealer",
                "✓ 10+ Years Experience",
                "✓ East Godavari",
                "✓ 5000+ Happy Customers",
              ].map((item) => (
                <span key={item} className="text-sm font-semibold text-green-400">{item}</span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="text-lg text-blue-200/80 leading-relaxed max-w-xl"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 0 30px rgba(37,99,235,0.5), 0 4px 24px rgba(37,99,235,0.3)" }}
              >
                {t("cta")}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/service-booking"
                className="inline-flex items-center gap-2 border border-blue-500/40 bg-blue-500/10 text-blue-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-500/20 hover:border-blue-400/60 hover:text-white transition-all duration-300 backdrop-blur-sm"
              >
                {t("ctaSecondary")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-5"
            >
              <div className="flex flex-col gap-1">
                <a href="tel:9951447358" className="flex items-center gap-2.5 text-blue-200 hover:text-white transition-colors font-semibold">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-blue-400" />
                  </div>
                  9951447358
                </a>
                <a href="tel:9133639888" className="flex items-center gap-2.5 text-blue-200/70 hover:text-white transition-colors text-sm font-medium pl-11">
                  9133639888 (WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-blue-200/70">
                <div className="h-9 w-9 rounded-xl bg-green-600/20 border border-green-500/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                Terranova Authorized Distributor
              </div>
            </motion.div>

            {/* Trusted brands */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-wrap gap-2.5"
            >
              {["Terranova", "LiFePO4 Tech", "Zero Maintenance", "5 Yr Warranty", "Eco Friendly"].map((brand) => (
                <span key={brand} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-blue-500/20 bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  {brand}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── Right: 3D Scene ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative h-[500px] lg:h-[640px]"
          >
            <Hero3DScene />

            {/* Glowing floating badges */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-8 right-6 z-10 rounded-2xl px-4 py-2.5 text-sm font-bold text-white border border-blue-400/30 backdrop-blur-md"
              style={{ background: "rgba(37,99,235,0.35)", boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}
            >
              🔋 LiFePO4 Certified
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: "easeInOut" }}
              className="absolute bottom-12 left-4 z-10 rounded-2xl px-4 py-2.5 text-sm font-bold text-white border border-green-400/30 backdrop-blur-md"
              style={{ background: "rgba(16,185,129,0.3)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
            >
              ⚡ 48 Hr Service
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, delay: 2.5, ease: "easeInOut" }}
              className="absolute top-1/2 right-0 z-10 rounded-2xl px-4 py-2.5 text-sm font-bold text-white border border-purple-400/30 backdrop-blur-md"
              style={{ background: "rgba(139,92,246,0.3)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
            >
              ⭐ 5000+ Happy
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(2,8,24,0.8))" }} />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-6 h-10 rounded-full border border-blue-500/40 flex items-center justify-center"
        >
          <div className="w-1.5 h-3 rounded-full bg-blue-400/70" />
        </motion.div>
      </div>
    </section>
  );
}
