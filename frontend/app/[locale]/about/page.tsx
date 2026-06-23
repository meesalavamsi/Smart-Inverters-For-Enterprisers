import type { Metadata } from "next";
import { Shield, Award, Users, Zap, Target, Heart } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Smart Inverter's - Trusted inverter and battery solutions in Ravulapalem",
};

export default function AboutPage() {
  const milestones = [
    { year: "2015", title: "Founded", desc: "Started as a small inverter shop in Ravulapalem" },
    { year: "2017", title: "500+ Customers", desc: "Expanded service to entire East Godavari district" },
    { year: "2019", title: "Solar Division", desc: "Added solar inverter products and installations" },
    { year: "2021", title: "Authorized Dealer", desc: "Became authorized dealer for multiple top brands" },
    { year: "2023", title: "5000+ Customers", desc: "Trusted by over 5000 families across the region" },
    { year: "2024", title: "Online Platform", desc: "Launched digital platform for seamless service booking" },
  ];

  const values = [
    { icon: Shield, title: "Quality First", desc: "We only sell ISI certified, genuine products from trusted brands.", color: "bg-blue-100 text-blue-600" },
    { icon: Heart, title: "Customer Care", desc: "24/7 support and after-sales service is our commitment.", color: "bg-red-100 text-red-600" },
    { icon: Target, title: "Reliability", desc: "On-time service delivery with no excuses.", color: "bg-green-100 text-green-600" },
    { icon: Award, title: "Excellence", desc: "Industry-leading warranty and certified technicians.", color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 mb-6">
            <Zap className="h-9 w-9 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4">About Smart Inverter's</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Your trusted partner for premium inverter batteries and energy solutions in Ravulapalem since 2015.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">Our Story</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-5">Powering East Godavari Since 2015</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Smart Inverter's was founded with a simple mission: to provide reliable, affordable, and genuine inverter solutions to the people of East Godavari district. What started as a small shop in Daggara, Ravulapalem has grown into a trusted business serving 5000+ families.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe power outages shouldn't disrupt your life. Our expert team ensures fast installation, quality products, and round-the-clock support so your home or business is never left in the dark.
              </p>
              <p className="text-gray-600 leading-relaxed">
                As an authorized dealer for leading brands, we guarantee genuine products backed by manufacturer warranties. Our certified technicians handle everything from installation to maintenance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5000+", label: "Happy Customers" },
                { value: "10+", label: "Years Experience" },
                { value: "3 Yrs", label: "Warranty" },
                { value: "24/7", label: "Support" },
              ].map(stat => (
                <div key={stat.label} className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
                  <p className="text-4xl font-extrabold text-blue-700">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${v.color} mb-4`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-100 -translate-x-1/2" />
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex items-center gap-8 mb-10 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 inline-block max-w-xs">
                    <p className="font-bold text-blue-700 text-lg">{m.year}</p>
                    <p className="font-semibold text-gray-900">{m.title}</p>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
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

      {/* CTA */}
      <section className="py-16 bg-blue-700">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Work with Us?</h2>
          <p className="text-blue-200 mb-8">Join 5000+ families who trust Smart Inverter's for reliable power solutions.</p>
          <div className="flex justify-center gap-4">
            <Link href="/products" className="bg-yellow-400 text-blue-900 px-8 py-3.5 rounded-xl font-bold hover:bg-yellow-300 transition-colors">
              Shop Products
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
