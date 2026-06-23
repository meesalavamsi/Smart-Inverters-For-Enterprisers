"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Recycle, ArrowRight, Leaf, ShieldCheck, Building2, BadgeDollarSign } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RecyclingBanner() {
  const t = useTranslations("recycling");

  const FACTS = [
    { icon: Leaf, labelKey: "fact1" },
    { icon: ShieldCheck, labelKey: "fact2" },
    { icon: Building2, labelKey: "fact3" },
    { icon: BadgeDollarSign, labelKey: "fact4" },
  ];

  return (
    <section className="py-16 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #020818 0%, #041a0e 100%)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-emerald-500/20"
          style={{ background: "linear-gradient(135deg, rgba(5,46,22,0.8) 0%, rgba(6,78,59,0.4) 100%)", backdropFilter: "blur(10px)" }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center border border-emerald-500/30" style={{ background: "rgba(16,185,129,0.2)" }}>
                <Recycle className="h-7 w-7 text-emerald-400" />
              </div>
              <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">{t("badge")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t("title")}</h2>
            <p className="text-emerald-200/70 text-lg mb-6 max-w-xl">{t("description")}</p>
            <Link href="/recycling"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all duration-200 hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 0 20px rgba(5,150,105,0.4)", color: "#fff" }}>
              {t("button")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-3 md:min-w-[220px]">
            {FACTS.map(({ icon: Icon, labelKey }) => (
              <div key={labelKey} className="flex items-center gap-3 rounded-xl px-5 py-3 border border-emerald-500/20 text-sm font-medium text-emerald-200" style={{ background: "rgba(16,185,129,0.08)" }}>
                <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                {t(labelKey as any)}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
