"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, MinusCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/utils";

const BRAND_COMPARE = [
  {
    feature: "Battery Type",
    terranova: "LiFePO4 Lithium",
    luminous: "Tubular / Lead-Acid",
    exide: "Tubular / Lead-Acid",
    amaron: "VRLA / Lead-Acid",
  },
  {
    feature: "Lifespan",
    terranova: "8–10 Years",
    luminous: "3–5 Years",
    exide: "3–5 Years",
    amaron: "3–4 Years",
  },
  {
    feature: "Maintenance",
    terranova: "Zero — No water filling",
    luminous: "Regular water top-up",
    exide: "Regular water top-up",
    amaron: "Low (sealed)",
  },
  {
    feature: "Charge Time",
    terranova: "3–4 Hours (Fast)",
    luminous: "10–14 Hours",
    exide: "10–14 Hours",
    amaron: "8–10 Hours",
  },
  {
    feature: "Weight",
    terranova: "Very Light (~10–15 kg)",
    luminous: "Heavy (40–60 kg)",
    exide: "Heavy (40–60 kg)",
    amaron: "Medium (30–50 kg)",
  },
  {
    feature: "Eco Friendly",
    terranova: "Yes — No lead, no acid",
    luminous: "No — Contains lead & acid",
    exide: "No — Contains lead & acid",
    amaron: "Partially",
  },
  {
    feature: "Warranty",
    terranova: "5 Years Complete",
    luminous: "2–3 Years",
    exide: "2–3 Years",
    amaron: "1–2 Years",
  },
  {
    feature: "Performance in Heat",
    terranova: "Excellent",
    luminous: "Degrades faster",
    exide: "Degrades faster",
    amaron: "Moderate",
  },
];

const WHY_US = [
  { title: "Authorized Dealer", desc: "We are the official authorized distributor of Terranova and MICAH's batteries in East Godavari. You get 100% genuine products with valid warranty." },
  { title: "10+ Years Local Experience", desc: "Our team has been serving Ravulapalem and surrounding areas for over a decade. We understand local power supply patterns and recommend the right product for your home." },
  { title: "Same-Day Installation", desc: "No waiting weeks for delivery. We install within 24–48 hours. For emergency breakdowns, we offer same-day response across East Godavari." },
  { title: "Fair & Transparent Pricing", desc: "No hidden charges. The price you see is what you pay. We believe in long-term customer relationships, not one-time sales." },
  { title: "After-Sales Support", desc: "Our support doesn't stop at installation. Call or WhatsApp us anytime — we respond to queries and service requests 7 days a week." },
  { title: "Free Load Assessment", desc: "Not sure which inverter size you need? Our technicians visit your home, assess your power load, and recommend the exact right system — for free." },
];

function Check() { return <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />; }
function Cross() { return <XCircle className="h-5 w-5 text-red-400 shrink-0" />; }
function Neutral() { return <MinusCircle className="h-5 w-5 text-yellow-400 shrink-0" />; }

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold mb-3"
          >
            Why Choose Smart Inverter&apos;s?
          </motion.h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Compare brands, understand the technology, and see why thousands of East Godavari families trust us.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-14">

        {/* Why Us grid */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WHY_US.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Brand comparison table */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
            Terranova vs Luminous vs Exide vs Amaron
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">Side-by-side comparison to help you make an informed decision</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="text-left px-5 py-4 font-bold">Feature</th>
                    <th className="px-4 py-4 font-bold text-center">
                      <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">★ Terranova</span>
                    </th>
                    <th className="px-4 py-4 font-bold text-center text-blue-200">Luminous</th>
                    <th className="px-4 py-4 font-bold text-center text-blue-200">Exide</th>
                    <th className="px-4 py-4 font-bold text-center text-blue-200">Amaron</th>
                  </tr>
                </thead>
                <tbody>
                  {BRAND_COMPARE.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-5 py-3.5 font-semibold text-gray-700">{row.feature}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-green-700 font-semibold text-xs bg-green-50 px-2 py-1 rounded-lg">{row.terranova}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">{row.luminous}</td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">{row.exide}</td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-500">{row.amaron}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">* Data based on manufacturer specifications and industry averages. Actual performance may vary.</p>
        </section>

        {/* Why Lithium over Tubular */}
        <section className="bg-blue-900 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-extrabold mb-6 text-center">Lithium vs Tubular Battery — Quick Decision Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-4 text-lg">Choose Lithium (LiFePO4) if you...</h3>
              <ul className="space-y-2.5">
                {[
                  "Want zero maintenance (no water filling ever)",
                  "Have frequent power cuts (3+ hours/day)",
                  "Want longer battery life (8–10 years)",
                  "Want lightweight and compact design",
                  "Care about eco-friendly, non-toxic materials",
                  "Want fast charging (3–4 hours vs 12+ hours)",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check /> <span className="text-blue-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 rounded-xl p-5">
              <h3 className="font-bold text-red-400 mb-4 text-lg">Tubular batteries may not suit if you...</h3>
              <ul className="space-y-2.5">
                {[
                  "Cannot do regular water top-ups",
                  "Have limited space (tubular is bulky)",
                  "Experience very frequent power cuts",
                  "Need power backup to start immediately",
                  "Prefer a one-time investment with low replacements",
                  "Live in a hot climate region (like Andhra Pradesh)",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Cross /> <span className="text-blue-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Still not sure? Talk to our expert.</h2>
          <p className="text-gray-500 mb-6">We'll assess your power needs and recommend the exact right system — for free.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
              Browse Products
            </Link>
            <a
              href={getWhatsAppUrl("Hi! I'd like a free inverter assessment for my home. Can you help me choose the right product?")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" /> Free Assessment on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
