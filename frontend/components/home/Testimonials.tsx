"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { feedbackApi } from "@/lib/api";

interface Testimonial {
  id: string; name: string; rating: number; message: string; createdAt: string;
  location?: string;
}

const FALLBACK: Testimonial[] = [
  { id: "1", name: "Suresh Rao", rating: 5, message: "Excellent service! They installed our inverter within 2 hours. Very professional team. Highly recommend to anyone in East Godavari.", createdAt: "2025", location: "Ravulapalem" },
  { id: "2", name: "Lakshmi Devi", rating: 5, message: "Battery quality is superb. Already 2 years, still works like new. Zero maintenance as promised. Highly recommended!", createdAt: "2023", location: "Amalapuram" },
  { id: "3", name: "Ravi Kumar", rating: 4, message: "Good products, quick delivery. The WhatsApp support is very responsive. Got my inverter installed the same day.", createdAt: "2024", location: "Kothapeta" },
  { id: "4", name: "Anjali Reddy", rating: 5, message: "Best inverter shop in Ravulapalem. Genuine Terranova products and fair prices. No power issues since installation.", createdAt: "2025", location: "Ravulapalem" },
  { id: "5", name: "Venkata Rao", rating: 5, message: "Had an emergency power issue on Sunday night, they responded immediately. Amazing after-sales support. Truly 24/7 service.", createdAt: "2024", location: "Mandapeta" },
  { id: "6", name: "Padma Kumari", rating: 4, message: "Very satisfied with the battery replacement. Team was courteous and efficient. The lithium battery is much better than the old tubular one.", createdAt: "2025", location: "Ravulapalem" },
];

const COLORS = ["from-blue-600 to-blue-800", "from-purple-600 to-violet-800", "from-cyan-600 to-blue-700", "from-emerald-600 to-teal-800", "from-rose-600 to-pink-800", "from-amber-500 to-orange-600"];

function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="relative rounded-3xl p-7 border border-white/10 flex flex-col gap-4 cursor-default"
      style={{ background: "linear-gradient(145deg, #0d1f40, #091629)" }}
    >
      {/* Quote icon */}
      <div className="absolute top-5 right-5 opacity-10">
        <Quote className="h-10 w-10 text-blue-400" />
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <Star key={s} className={`h-4 w-4 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700 fill-gray-700"}`} />
        ))}
      </div>

      {/* Message */}
      <p className="text-blue-100/80 text-sm leading-relaxed flex-1">&quot;{t.message}&quot;</p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}>
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{t.name}</p>
          <p className="text-xs text-blue-400">
            {t.location ? `${t.location}` : "Verified Customer"}
            {t.createdAt ? ` • ${t.createdAt.slice(0, 4)}` : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK);

  useEffect(() => {
    feedbackApi.getPublic()
      .then((res) => { if (res.data.data?.length) setTestimonials(res.data.data); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #050d24 0%, #020818 100%)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px]" style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 border border-yellow-500/40 text-yellow-300"
            style={{ background: "rgba(234,179,8,0.1)" }}
          >
            ⭐ Customer Reviews
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-extrabold text-white mb-3"
          >
            What Our{" "}
            <span style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Customers Say
            </span>
          </motion.h2>
          <p className="text-blue-300/70">Trusted by thousands of families across Andhra Pradesh & Telangana</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.slice(0, 6).map((t, i) => (
            <TestimonialCard key={t.id} t={t} i={i} />
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="/feedback"
            className="inline-flex items-center gap-2 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-500/20 px-6 py-3 rounded-xl font-semibold transition-all duration-200">
            Leave Your Review →
          </a>
        </div>
      </div>
    </section>
  );
}
