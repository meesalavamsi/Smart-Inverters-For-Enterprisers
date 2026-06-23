"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Clock, Headphones, Award, Recycle } from "lucide-react";

const benefits = [
  { icon: Shield, title: "Genuine Products", desc: "100% authentic ISI certified inverters and batteries from top brands.", gradient: "from-blue-500 to-blue-700", glow: "rgba(37,99,235,0.2)" },
  { icon: Zap, title: "Expert Installation", desc: "Certified technicians install your inverter safely and correctly.", gradient: "from-amber-400 to-orange-500", glow: "rgba(251,146,60,0.2)" },
  { icon: Clock, title: "Same Day Service", desc: "We respond quickly. Most services completed the same day.", gradient: "from-emerald-400 to-green-600", glow: "rgba(52,211,153,0.2)" },
  { icon: Headphones, title: "24/7 Support", desc: "Round the clock WhatsApp and phone support for all queries.", gradient: "from-violet-500 to-purple-700", glow: "rgba(139,92,246,0.2)" },
  { icon: Award, title: "3 Year Warranty", desc: "Industry-leading warranty on all inverter batteries we sell.", gradient: "from-rose-400 to-red-600", glow: "rgba(244,63,94,0.2)" },
  { icon: Recycle, title: "Eco Responsible", desc: "Proper battery disposal and recycling programs available.", gradient: "from-teal-400 to-cyan-600", glow: "rgba(20,184,166,0.2)" },
];

function TiltCard({ children, glow }: { children: React.ReactNode; glow: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale3d(1.04,1.04,1.04)`;
    el.style.boxShadow = `${-x * 24}px ${-y * 24}px 50px ${glow}, 0 10px 40px rgba(0,0,0,0.06)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(700px) rotateX(0) rotateY(0) scale3d(1,1,1)";
    el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
      className="h-full bg-white rounded-3xl p-7 border border-gray-100 cursor-default"
    >
      {children}
    </div>
  );
}

export default function Benefits() {
  return (
    <section className="py-28 bg-gradient-to-b from-white to-blue-50/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold mb-5 shadow-md shadow-blue-200"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4"
          >
            The Smart Inverter's{" "}
            <span className="gradient-text-blue">Advantage</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Trusted by 5000+ families across Andhra Pradesh & Telangana for quality, reliability, and exceptional service.
          </motion.p>
        </div>

        {/* 3D Tilt Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <TiltCard glow={b.glow}>
                {/* Icon with gradient */}
                <div
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${b.gradient} text-white mb-6 shadow-lg`}
                  style={{ transform: "translateZ(20px)" }}
                >
                  <b.icon className="h-7 w-7" />
                </div>
                {/* Content */}
                <div style={{ transform: "translateZ(10px)" }}>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
                {/* Bottom gradient line */}
                <div className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${b.gradient} opacity-60`} />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
