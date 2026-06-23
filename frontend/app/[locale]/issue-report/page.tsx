"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { issuesApi } from "@/lib/api";
import { ISSUE_TYPES } from "@/lib/utils";

const schema = z.object({
  customerName: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  issueType: z.string().min(1, "Issue type required"),
  productName: z.string().optional(),
  description: z.string().min(20, "Please describe the issue in detail (min 20 chars)"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

type IssueForm = z.infer<typeof schema>;

export default function IssueReportPage() {
  const t = useTranslations("issue");
  const [submitted, setSubmitted] = useState(false);
  const [reportNumber, setReportNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<IssueForm>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM" },
  });

  const onSubmit = async (data: IssueForm) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v || ""));
      images.forEach(img => fd.append("images", img));
      const res = await issuesApi.create(fd);
      setReportNumber(res.data.data.reportNumber);
      setSubmitted(true);
    } catch { toast.error("Submission failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Issue Reported!</h2>
          <p className="text-gray-500 mb-3">Your report number is:</p>
          <div className="bg-orange-50 rounded-xl px-6 py-3 mb-5">
            <p className="text-2xl font-extrabold text-orange-700 tracking-wide">{reportNumber}</p>
          </div>
          <p className="text-gray-500 text-sm">{t("success")}</p>
        </motion.div>
      </div>
    );
  }

  const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low", color: "text-green-700 bg-green-50 border-green-200", emoji: "🟢" },
    { value: "MEDIUM", label: "Medium", color: "text-yellow-700 bg-yellow-50 border-yellow-200", emoji: "🟡" },
    { value: "HIGH", label: "High", color: "text-orange-700 bg-orange-50 border-orange-200", emoji: "🟠" },
    { value: "CRITICAL", label: "Critical", color: "text-red-700 bg-red-50 border-red-200", emoji: "🔴" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-yellow-300" />
            <h1 className="text-4xl font-extrabold">{t("title")}</h1>
          </div>
          <p className="text-orange-200">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("name")} *</label>
                <input {...form.register("customerName")} placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                {form.formState.errors.customerName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.customerName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone")} *</label>
                <input {...form.register("phone")} type="tel" placeholder="9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("issueType")} *</label>
              <select {...form.register("issueType")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                <option value="">Select issue type</option>
                {ISSUE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              {form.formState.errors.issueType && <p className="text-red-500 text-xs mt-1">{form.formState.errors.issueType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("productName")}</label>
              <input {...form.register("productName")} placeholder="e.g. Terranova T-1150 Gen 1 or model number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("priority")} *</label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map(p => (
                  <label key={p.value}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.watch("priority") === p.value ? p.color + " border-current" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input type="radio" value={p.value} {...form.register("priority")} className="sr-only" />
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-xs font-semibold">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")} *</label>
              <textarea {...form.register("description")} rows={5}
                placeholder="Describe the issue in detail — when it started, what happened, error messages, etc."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none" />
              {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("images")}</label>
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors">
                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload photos of the issue</p>
                <p className="text-xs text-gray-400 mt-1">Max 5 images · JPG, PNG</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => setImages(Array.from(e.target.files || []).slice(0, 5))} />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(img)} alt="" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition-colors">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {t("submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
