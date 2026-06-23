import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Smart Inverter's for inverter and battery services across Andhra Pradesh and Telangana",
};

const WHATSAPP_URL = "https://wa.me/919133639888?text=Hello!%20I%20want%20to%20know%20about%20Smart%20Inverters.";

const SERVICE_AREAS = {
  "Andhra Pradesh": [
    "Ravulapalem", "Daggara", "Kovvur", "Nidadavolu", "Tanuku",
    "Bhimavaram", "Undi", "Nagaram", "Rajahmundry", "Kakinada",
    "Eluru", "Amalapuram", "Palakol", "Narasapuram",
  ],
  "Telangana": [
    "Hyderabad", "Secunderabad", "Warangal", "Karimnagar", "Khammam",
    "Nalgonda", "Nizamabad", "Mahbubnagar", "Adilabad", "Suryapet",
  ],
};

export default async function ContactPage() {
  const t = await getTranslations("contact");

  const contactDetails = [
    { icon: Phone, label: t("phoneLabel"), value: "9133639888 / 9951447358", href: "tel:9133639888", color: "text-blue-600 bg-blue-50" },
    { icon: MessageCircle, label: t("whatsappLabel"), value: "9133639888", href: WHATSAPP_URL, color: "text-green-600 bg-green-50" },
    { icon: Mail, label: t("emailLabel"), value: "maniagency.rvpm@gmail.com", href: "mailto:maniagency.rvpm@gmail.com", color: "text-purple-600 bg-purple-50" },
    { icon: MapPin, label: t("addressLabel"), value: "Indira Colony (Near Community Hall), Daggara, Ravulapalem, East Godavari, AP", href: "#map", color: "text-red-600 bg-red-50" },
    {
      icon: Clock, label: t("hoursLabel"), value: null, href: null, color: "text-orange-600 bg-orange-50",
      lines: [
        { text: t("workingLine1"), style: "text-gray-700 font-medium" },
        { text: t("workingLine2"), style: "text-gray-400" },
        { text: t("workingLine3"), style: "text-red-600 font-bold" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h1 className="text-4xl font-extrabold">{t("title")}</h1>
          </div>
          <p className="text-blue-200">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact cards */}
          <div className="space-y-4">
            {contactDetails.map((detail) => (
              <div key={detail.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${detail.color} shrink-0`}>
                    <detail.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{detail.label}</p>
                    {"lines" in detail && detail.lines ? (
                      <div className="mt-1 space-y-1">
                        {detail.lines.map((line, i) => (
                          <p key={i} className={`text-sm ${line.style}`}>{line.text}</p>
                        ))}
                      </div>
                    ) : detail.href ? (
                      <a href={detail.href} target={detail.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm text-gray-900 font-medium hover:text-blue-600 transition-colors mt-0.5 block">
                        {detail.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700 mt-0.5">{detail.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold text-lg mb-1">{t("quickWhatsapp")}</h3>
              <p className="text-green-100 text-sm mb-4">{t("quickWhatsappDesc")}</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors">
                <MessageCircle className="h-4 w-4" /> {t("chatWhatsapp")}
              </a>
            </div>
          </div>

          {/* Map + Service area */}
          <div className="lg:col-span-2 space-y-5">
            {/* Google Maps embed */}
            <div id="map" className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" /> {t("findMaps")}
                </h3>
                <a href="https://maps.google.com/?q=Ravulapalem,Andhra+Pradesh" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  {t("openMaps")} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <iframe
                src="https://maps.google.com/maps?q=Ravulapalem,Andhra+Pradesh&output=embed&z=14"
                width="100%" height="280" style={{ border: 0 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Smart Inverter's Location"
              />
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">{t("quickActions")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="tel:9133639888"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors justify-center">
                  <Phone className="h-4 w-4" /> {t("callNow")}
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors justify-center">
                  <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
                </a>
                <Link href="/service-booking"
                  className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors justify-center">
                  {t("bookService")}
                </Link>
                <Link href="/issue-report"
                  className="flex items-center gap-2 border-2 border-orange-500 text-orange-600 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors justify-center">
                  {t("reportIssue")}
                </Link>
              </div>
            </div>

            {/* Service areas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" /> {t("serviceAreas")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Object.entries(SERVICE_AREAS).map(([state, areas]) => (
                  <div key={state}>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full mb-3 ${
                      state === "Andhra Pradesh" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      <span>{state === "Andhra Pradesh" ? "🔵" : "🟠"}</span>
                      {state}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {areas.map(area => (
                        <div key={area} className="flex items-center gap-1.5 text-sm text-gray-600">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${state === "Andhra Pradesh" ? "bg-blue-500" : "bg-orange-500"}`} />
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
                {t("serviceNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
