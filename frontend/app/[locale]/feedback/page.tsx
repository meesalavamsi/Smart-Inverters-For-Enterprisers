"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { feedbackApi } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  rating: z.number().min(1).max(5),
  message: z.string().min(10, "Please write at least 10 characters"),
});

type FeedbackForm = z.infer<typeof schema>;

export default function FeedbackPage() {
  const t = useTranslations("feedback");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const selectedRating = form.watch("rating");

  const onSubmit = async (data: FeedbackForm) => {
    setLoading(true);
    try {
      await feedbackApi.create(data);
      setSubmitted(true);
      toast.success(t("success"));
    } catch { toast.error("Submission failed. Please try again."); }
    finally { setLoading(false); }
  };

  const starLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500">Your feedback has been received. We appreciate you taking the time to share your experience!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-4xl font-extrabold mb-2">{t("title")}</h1>
          <p className="text-blue-200">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("name")} *</label>
                <input {...form.register("name")} placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")} *</label>
                <input {...form.register("email")} type="email" placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("rating")} *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => form.setValue("rating", star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`h-9 w-9 ${
                      star <= (hoveredStar || selectedRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }`} />
                  </button>
                ))}
                {(hoveredStar || selectedRating) > 0 && (
                  <span className="text-sm text-gray-500 ml-2">{starLabel[hoveredStar || selectedRating]}</span>
                )}
              </div>
              {form.formState.errors.rating && <p className="text-red-500 text-xs mt-1">Please select a rating</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("message")} *</label>
              <textarea {...form.register("message")} rows={5}
                placeholder="Tell us about your experience with our products and services..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              {form.formState.errors.message && <p className="text-red-500 text-xs mt-1">{form.formState.errors.message.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition-colors">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {t("submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
