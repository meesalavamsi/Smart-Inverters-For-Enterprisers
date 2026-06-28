"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2, MessageCircle, Phone, Lock, UserPlus, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { getWhatsAppUrl } from "@/lib/utils";

const schema = z.object({
  customerName: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(10, "Please enter complete address"),
  serviceType: z.enum(["INSTALLATION", "REPAIR", "MAINTENANCE", "BATTERY_REPLACEMENT", "EMERGENCY"]),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof schema>;

const SERVICE_TYPES = [
  { value: "INSTALLATION", label: "Installation", emoji: "⚡", desc: "New inverter/battery installation" },
  { value: "REPAIR", label: "Repair", emoji: "🔧", desc: "Fix inverter or battery issues" },
  { value: "MAINTENANCE", label: "Maintenance", emoji: "🛠️", desc: "Regular service and checkup" },
  { value: "BATTERY_REPLACEMENT", label: "Battery Replacement", emoji: "🔋", desc: "Replace old battery" },
  { value: "EMERGENCY", label: "Emergency Service", emoji: "🚨", desc: "Urgent power issue" },
];

export default function ServiceBookingPage() {
  const t = useTranslations("booking");
  const { user } = useAuthStore();
  const [submitted, setSubmitted] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<BookingForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceType: "INSTALLATION",
      customerName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const selectedType = form.watch("serviceType");

  const onSubmit = async (data: BookingForm) => {
    setLoading(true);
    try {
      const res = await bookingsApi.create(data as Record<string, string>);
      setBookingNumber(res.data.data.bookingNumber);
      setSubmitted(true);
      toast.success(t("success"));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  const waMsg = `Hello! I'd like to book a ${form.getValues("serviceType")?.replace(/_/g, " ")} service. My name is ${form.getValues("customerName") || "[Name]"}, phone: ${form.getValues("phone") || "[Phone]"}.`;

  // 🔒 Auth wall — must be logged in to book
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
          <div className="mx-auto max-w-4xl px-4">
            <h1 className="text-4xl font-extrabold mb-2">{t("title")}</h1>
            <p className="text-blue-200">{t("subtitle")}</p>
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Top banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-white shrink-0" />
              <p className="text-white font-bold text-sm">Account Required for Security</p>
            </div>

            <div className="p-8 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center mx-auto mb-5">
                <Lock className="h-9 w-9 text-blue-600" />
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                Please Login or Register First
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                To book a service or maintenance, you must have an account.
              </p>
              <p className="text-gray-400 text-sm mb-8">
                మీరు సేవ బుక్ చేయాలంటే ముందు రిజిస్టర్ / లాగిన్ చేయాలి.
              </p>

              {/* Benefits */}
              <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left space-y-2">
                {[
                  "Track your booking status anytime",
                  "Get SMS & email updates on your service",
                  "Easy rebooking with saved details",
                  "Secure — your data is protected",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm text-blue-800">
                    <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    {point}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Register Now (Free)
                </Link>
                <Link
                  href={`/login?redirect=/service-booking`}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Already have account? Login
                </Link>
              </div>

              <p className="text-xs text-gray-400 mt-5">
                Registration is free and takes less than 1 minute.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-3">Your booking number is:</p>
          <div className="bg-blue-50 rounded-xl px-6 py-3 mb-5">
            <p className="text-2xl font-extrabold text-blue-700 tracking-wide">{bookingNumber}</p>
          </div>
          <p className="text-gray-500 text-sm mb-6">Our team will call you shortly to confirm the appointment.</p>
          <div className="flex gap-3 justify-center">
            <a href={`tel:9133639888`}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              <Phone className="h-4 w-4" />Call Us
            </a>
            <a href={getWhatsAppUrl(`My booking number is ${bookingNumber}. Please confirm.`)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors">
              <MessageCircle className="h-4 w-4" />WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-extrabold mb-2">{t("title")}</h1>
          <p className="text-blue-200">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {/* Service type selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t("serviceType")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_TYPES.map((s) => (
                    <label key={s.value}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedType === s.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <input type="radio" value={s.value} {...form.register("serviceType")} className="sr-only" />
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{s.label}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                      {selectedType === s.value && (
                        <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Customer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("name")} *</label>
                  <input {...form.register("customerName")} placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  {form.formState.errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone")} *</label>
                  <input {...form.register("phone")} type="tel" placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
                  <input {...form.register("email")} type="email" placeholder="you@example.com (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("address")} *</label>
                <textarea {...form.register("address")} rows={2}
                  placeholder="Full address with landmark, street, and area"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                {form.formState.errors.address && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("notes")}</label>
                <textarea {...form.register("notes")} rows={2}
                  placeholder="Any special instructions or details about the issue..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition-colors shadow-md">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {t("submit")}
              </button>
            </form>
          </div>

          {/* Sidebar info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Contact Us Directly</h3>
              <div className="space-y-3">
                <a href="tel:9133639888"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">9133639888</span>
                </a>
                <a href={getWhatsAppUrl(waMsg)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span>{t("whatsapp")}</span>
                </a>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-3">Service Area</h3>
              <ul className="space-y-1.5 text-sm text-blue-700">
                {["Ravulapalem", "Daggara", "Kovvur", "Nidadavolu", "East Godavari District"].map(area => (
                  <li key={area} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{area}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
              <h3 className="font-bold text-yellow-800 mb-2">⏱️ Working Hours</h3>
              <p className="text-sm text-yellow-700">Mon–Sat: 9:00 AM – 10:00 PM</p>
              <p className="text-sm text-yellow-600">Sunday: Office Closed</p>
              <p className="text-sm font-semibold text-red-600 mt-2">🚨 Emergency: 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
