"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Wrench, Zap, Settings, Battery, AlertTriangle, ArrowRight, Phone } from "lucide-react";

const services = [
  { icon: Zap, titleKey: "installation", descKey: "installationDesc", gradient: "from-blue-500 to-blue-700", glow: "shadow-blue-200", href: "/service-booking?type=INSTALLATION", num: "01" },
  { icon: Wrench, titleKey: "repair", descKey: "repairDesc", gradient: "from-orange-400 to-red-500", glow: "shadow-orange-200", href: "/service-booking?type=REPAIR", num: "02" },
  { icon: Settings, titleKey: "maintenance", descKey: "maintenanceDesc", gradient: "from-green-500 to-emerald-700", glow: "shadow-green-200", href: "/service-booking?type=MAINTENANCE", num: "03" },
  { icon: Battery, titleKey: "replacement", descKey: "replacementDesc", gradient: "from-purple-500 to-violet-700", glow: "shadow-purple-200", href: "/service-booking?type=BATTERY_REPLACEMENT", num: "04" },
  { icon: AlertTriangle, titleKey: "emergency", descKey: "emergencyDesc", gradient: "from-rose-500 to-red-700", glow: "shadow-rose-200", href: "/service-booking?type=EMERGENCY", num: "05" },
];

export default function Services() {
  const t = useTranslations("services");

  return (
    <section className="py-28 bg-gray-950 relative overflow-hidden">
      {/* Background 3D depth decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-900/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-900/30 blur-[100px]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(99,179,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-blue-500/20 border border-blue-500/40 text-blue-300 px-6 py-2 rounded-full text-sm font-bold mb-5"
          >
            Our Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-white mb-4"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Professional inverter and battery services by certified technicians. Available across Andhra Pradesh & Telangana.
          </motion.p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.titleKey}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
            >
              <Link
                href={service.href}
                className={`group block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-3xl p-7 transition-all duration-300 hover:shadow-2xl hover:${service.glow} relative overflow-hidden`}
              >
                {/* Big number in background */}
                <span className="absolute top-4 right-5 text-7xl font-black text-white/[0.03] select-none">
                  {service.num}
                </span>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${service.gradient} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-7 w-7" />
                </div>

                {/* Text */}
                <h3 className="font-extrabold text-xl text-white mb-3">{t(service.titleKey)}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{t(service.descKey)}</p>

                {/* CTA */}
                <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 group-hover:gap-3 transition-all duration-300">
                  {t("bookNow")} <ArrowRight className="h-4 w-4" />
                </span>

                {/* Gradient line at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </Link>
            </motion.div>
          ))}

          {/* Emergency CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="relative bg-gradient-to-br from-blue-600 to-blue-900 rounded-3xl p-7 overflow-hidden shadow-2xl shadow-blue-900/50"
          >
            {/* Glow orb inside card */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 text-yellow-300 mb-6 border border-white/20">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="font-extrabold text-xl text-white mb-3">Emergency? Call Now!</h3>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Power outage at night or on holidays? We&apos;re available 24/7 across the region.
              </p>
              <a
                href="tel:9133639888"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-yellow-300 hover:text-blue-900 transition-all duration-300 shadow-lg"
              >
                <Phone className="h-4 w-4" /> 9133639888
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
