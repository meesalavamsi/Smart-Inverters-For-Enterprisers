"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BadgeCheck, Star, Wrench, Home, HeartHandshake, CreditCard, Leaf } from "lucide-react";

const BADGES = [
  { icon: BadgeCheck, label: "Authorized Terranova Dealer", color: "text-blue-700 bg-blue-50 border-blue-100" },
  { icon: ShieldCheck, label: "GST Registered", color: "text-green-700 bg-green-50 border-green-100" },
  { icon: Star, label: "5-Year Warranty", color: "text-yellow-700 bg-yellow-50 border-yellow-100" },
  { icon: BadgeCheck, label: "100% Genuine Products", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { icon: CreditCard, label: "Secure Payments", color: "text-indigo-700 bg-indigo-50 border-indigo-100" },
  { icon: Home, label: "Home Installation", color: "text-orange-700 bg-orange-50 border-orange-100" },
  { icon: Wrench, label: "After-sales Support", color: "text-teal-700 bg-teal-50 border-teal-100" },
  { icon: HeartHandshake, label: "10+ Years Experience", color: "text-rose-700 bg-rose-50 border-rose-100" },
  { icon: Leaf, label: "Eco Friendly", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
];

export default function TrustBadges() {
  return (
    <section className="py-10 bg-gray-50 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
          Why Customers Trust Us
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {BADGES.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${b.color}`}
            >
              <b.icon className="h-4 w-4 shrink-0" />
              {b.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
