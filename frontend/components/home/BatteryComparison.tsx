"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Zap, Battery, Play } from "lucide-react";
import { useTranslations } from "next-intl";

const BENEFIT_KEYS = ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5", "benefit6"];
const DRAWBACK_KEYS = ["drawback1", "drawback2", "drawback3", "drawback4", "drawback5", "drawback6"];

const DEMO_VIDEO_ID = "5ofgyZXPmqA";
const YOUTUBE_URL = `https://www.youtube.com/watch?v=${DEMO_VIDEO_ID}`;
const THUMB_URL = `https://img.youtube.com/vi/${DEMO_VIDEO_ID}/maxresdefault.jpg`;

export default function BatteryComparison() {
  const t = useTranslations("comparison");

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #050d24 0%, #020818 100%)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 border border-blue-500/40 text-blue-300"
            style={{ background: "rgba(37,99,235,0.15)" }}>
            {t("badge")}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">
            <span style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              {t("title")}
            </span>
          </h2>
          <p className="text-blue-300/70 max-w-xl mx-auto">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Lithium Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-7 overflow-hidden border border-blue-500/30"
            style={{ background: "linear-gradient(145deg, #0f2855, #0a1f45)", boxShadow: "0 0 40px rgba(37,99,235,0.2)" }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-10 translate-x-10" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,99,235,0.3)", border: "1px solid rgba(37,99,235,0.5)" }}>
                  <Zap className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">{t("lithiumTitle")}</h3>
                  <p className="text-blue-400 text-sm">{t("lithiumSubtitle")}</p>
                </div>
                <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-extrabold px-3 py-1 rounded-full shrink-0">
                  {t("bestBadge")}
                </span>
              </div>

              <ul className="space-y-3.5">
                {BENEFIT_KEYS.map((key, i) => (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-white">{t(key as any)}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Lead Acid Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-7 border border-white/10"
            style={{ background: "linear-gradient(145deg, #0d1520, #090f1a)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Battery className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-300">{t("leadTitle")}</h3>
                <p className="text-gray-500 text-sm">{t("leadSubtitle")}</p>
              </div>
              <span className="ml-auto bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full border border-gray-700 shrink-0">
                {t("outdatedBadge")}
              </span>
            </div>

            <ul className="space-y-3.5">
              {DRAWBACK_KEYS.map((key, i) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <XCircle className="h-5 w-5 text-red-500/70 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-gray-400">{t(key as any)}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {[
            { value: "4000+", labelKey: "stat1Label" },
            { value: "50%", labelKey: "stat2Label" },
            { value: "5 Yrs", labelKey: "stat3Label" },
            { value: t("stat4Value"), labelKey: "stat4Label" },
          ].map(({ value, labelKey }) => (
            <div key={labelKey} className="rounded-2xl p-4 text-center border border-blue-500/20" style={{ background: "rgba(37,99,235,0.08)" }}>
              <p className="text-2xl font-extrabold" style={{ background: "linear-gradient(135deg,#93c5fd,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{value}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{t(labelKey as any)}</p>
            </div>
          ))}
        </motion.div>

        {/* Video CTA */}
        <motion.a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden cursor-pointer group block border border-white/10"
        >
          <img
            src={THUMB_URL}
            alt={t("videoTitle")}
            className="w-full h-56 sm:h-72 object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                `https://img.youtube.com/vi/${DEMO_VIDEO_ID}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-center">
            <div className="text-center text-white">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform backdrop-blur-sm border border-white/30" style={{ background: "rgba(37,99,235,0.5)" }}>
                <Play className="h-8 w-8 fill-white ml-1" />
              </div>
              <p className="text-lg font-bold">{t("videoTitle")}</p>
              <span className="inline-block mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
                {t("videoButton")}
              </span>
            </div>
          </div>
        </motion.a>
      </div>
    </section>
  );
}
