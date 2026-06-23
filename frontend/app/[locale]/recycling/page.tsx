"use client";

import { useEffect, useState } from "react";
import { Recycle, MapPin, Phone, Mail, Globe, Leaf, AlertTriangle, CheckCircle, Battery } from "lucide-react";
import { videosApi } from "@/lib/api";
import { getWhatsAppUrl } from "@/lib/utils";

interface RecyclingCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  district?: string;
  state?: string;
}

const TIPS = [
  { icon: AlertTriangle, color: "text-red-500 bg-red-50", title: "Never Throw in Trash", body: "Old batteries contain lead and acid that harm soil and water. Never throw them in regular bins." },
  { icon: Battery, color: "text-blue-500 bg-blue-50", title: "Store Safely Until Disposal", body: "Keep old batteries upright in a dry place, away from children. Use plastic bags to prevent leaks." },
  { icon: Recycle, color: "text-green-500 bg-green-50", title: "Return to Us", body: "Bring your old battery to our shop — we'll ensure it is responsibly recycled. We may even offer exchange discounts." },
  { icon: CheckCircle, color: "text-purple-500 bg-purple-50", title: "Choose Certified Recyclers", body: "Only hand over batteries to registered e-waste or battery recyclers with CPCB authorization." },
];

export default function RecyclingPage() {
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videosApi.getRecycling().then((res) => {
      setCenters(res.data.data || []);
    }).catch(() => setCenters([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-800 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Leaf className="h-4 w-4" /> Eco Responsibility
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Battery Recycling Program</h1>
          <p className="text-green-100 max-w-xl mx-auto">
            Protect the environment. Dispose of your old inverter batteries responsibly through our free recycling program.
          </p>
          <a
            href={getWhatsAppUrl("Hi! I want to return my old battery for recycling. Please guide me.")}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors"
          >
            <Phone className="h-5 w-5" /> Schedule Battery Pickup
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Why Recycle */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Why Proper Disposal Matters</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Lead-acid batteries contain hazardous chemicals. Improper disposal pollutes groundwater and harms communities.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {TIPS.map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white mb-14">
          <h2 className="text-xl font-extrabold mb-6 text-center">Our Recycling Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { step: "1", title: "Contact Us", desc: "Call or WhatsApp to schedule a pickup or drop-off" },
              { step: "2", title: "Safe Handover", desc: "We safely collect your old battery with protective equipment" },
              { step: "3", title: "Certified Recycling", desc: "Battery goes to an authorized recycler — we track it end-to-end" },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-extrabold mx-auto mb-3">{step}</div>
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-green-100 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recycling Centers */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Authorized Recycling Centers</h2>
          <p className="text-gray-500 text-sm mb-6">These are certified collection points in Andhra Pradesh where you can safely drop off old batteries.</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-36" />
              ))}
            </div>
          ) : centers.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <Recycle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No recycling centers listed yet. Contact us directly to arrange responsible disposal.</p>
              <a
                href={getWhatsAppUrl("Hi! I need help with battery recycling. Please guide me.")}
                target="_blank" rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
              >
                Contact Us on WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {centers.map((center) => (
                <div key={center.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <Recycle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{center.name}</h3>
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-0.5">
                        {center.type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                      <span>{center.address}{center.district ? `, ${center.district}` : ""}{center.state ? `, ${center.state}` : ""}</span>
                    </div>
                    {center.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                        <a href={`tel:${center.phone}`} className="hover:text-blue-600">{center.phone}</a>
                      </div>
                    )}
                    {center.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        <a href={`mailto:${center.email}`} className="hover:text-blue-600">{center.email}</a>
                      </div>
                    )}
                    {center.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                        <a href={center.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">{center.website}</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <Leaf className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Get an Exchange Discount</h3>
          <p className="text-gray-600 mb-4">Return your old battery when buying a new one and get up to ₹500 off! Contact us to know more.</p>
          <a
            href={getWhatsAppUrl("Hi! I want to return my old battery and get a discount on a new one.")}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            Claim Exchange Offer
          </a>
        </div>
      </div>
    </div>
  );
}
