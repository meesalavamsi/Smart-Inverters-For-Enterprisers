"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Recycle, ArrowRight, Leaf, ShieldCheck, Building2, BadgeDollarSign } from "lucide-react";

const FACTS = [
  { icon: Leaf, label: "Save the Environment" },
  { icon: ShieldCheck, label: "Government Compliant" },
  { icon: Building2, label: "Authorized Centers" },
  { icon: BadgeDollarSign, label: "Get Cashback" },
];

export default function RecyclingBanner() {
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
              <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">Eco Responsibility</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Don&apos;t Dump Old Batteries.
            </h2>
            <p className="text-emerald-200/70 text-lg mb-6 max-w-xl">
              Lead-acid batteries contain hazardous chemicals. Improper disposal harms the environment.
              Learn how to responsibly recycle your old inverter batteries.
            </p>
            <Link href="/recycling"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all duration-200 hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 0 20px rgba(5,150,105,0.4)", color: "#fff" }}>
              Learn About Recycling <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-3 md:min-w-[220px]">
            {FACTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl px-5 py-3 border border-emerald-500/20 text-sm font-medium text-emerald-200" style={{ background: "rgba(16,185,129,0.08)" }}>
                <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
