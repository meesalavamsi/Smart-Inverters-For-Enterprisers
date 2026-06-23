import type { Metadata } from "next";
import { Shield, Award, Zap, Target, Heart } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Smart Inverter's - Trusted inverter and battery solutions in Ravulapalem",
};

export default async function AboutPage() {
  const t = await getTranslations("about");

  const milestones = [
    { year: "2015", titleKey: "m1Title", descKey: "m1Desc" },
    { year: "2017", titleKey: "m2Title", descKey: "m2Desc" },
    { year: "2019", titleKey: "m3Title", descKey: "m3Desc" },
    { year: "2021", titleKey: "m4Title", descKey: "m4Desc" },
    { year: "2023", titleKey: "m5Title", descKey: "m5Desc" },
    { year: "2024", titleKey: "m6Title", descKey: "m6Desc" },
  ];

  const values = [
    { icon: Shield, titleKey: "value1Title", descKey: "value1Desc", color: "bg-blue-100 text-blue-600" },
    { icon: Heart, titleKey: "value2Title", descKey: "value2Desc", color: "bg-red-100 text-red-600" },
    { icon: Target, titleKey: "value3Title", descKey: "value3Desc", color: "bg-green-100 text-green-600" },
    { icon: Award, titleKey: "value4Title", descKey: "value4Desc", color: "bg-yellow-100 text-yellow-600" },
  ];

  const stats = [
    { value: "5000+", labelKey: "statCustomers" },
    { value: "10+", labelKey: "statExperience" },
    { value: "5 Yrs", labelKey: "statWarranty" },
    { value: "24/7", labelKey: "statSupport" },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 mb-6">
            <Zap className="h-9 w-9 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4">{t("heroTitle")}</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">{t("heroDesc")}</p>
        </div>
      </div>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">{t("storyBadge")}</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-5">{t("storyTitle")}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{t("storyP1")}</p>
              <p className="text-gray-600 leading-relaxed mb-4">{t("storyP2")}</p>
              <p className="text-gray-600 leading-relaxed">{t("storyP3")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(stat => (
                <div key={stat.labelKey} className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
                  <p className="text-4xl font-extrabold text-blue-700">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{t(stat.labelKey as any)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">{t("valuesTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.titleKey} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${v.color} mb-4`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{t(v.titleKey as any)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t(v.descKey as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">{t("journeyTitle")}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-100 -translate-x-1/2" />
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex items-center gap-8 mb-10 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 inline-block max-w-xs">
                    <p className="font-bold text-blue-700 text-lg">{m.year}</p>
                    <p className="font-semibold text-gray-900">{t(m.titleKey as any)}</p>
                    <p className="text-gray-500 text-sm">{t(m.descKey as any)}</p>
                  </div>
                </div>
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
                  {m.year.slice(2)}
                </div>
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-700">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">{t("ctaTitle")}</h2>
          <p className="text-blue-200 mb-8">{t("ctaDesc")}</p>
          <div className="flex justify-center gap-4">
            <Link href="/products" className="bg-yellow-400 text-blue-900 px-8 py-3.5 rounded-xl font-bold hover:bg-yellow-300 transition-colors">
              {t("ctaBtn1")}
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-colors">
              {t("ctaBtn2")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
