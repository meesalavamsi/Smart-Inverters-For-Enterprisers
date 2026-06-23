"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
});

const otpSchema = z.object({ otp: z.string().length(6, "OTP must be 6 digits") });

type LoginForm = z.infer<typeof loginSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || null;
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [userId, setUserId] = useState("");

  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.data.requiresMfa) {
        setUserId(res.data.userId);
        setMfaRequired(true);
        toast.info(res.data.message);
      } else {
        setAuth(res.data.token, res.data.user);
        toast.success("Welcome back!");
        router.push(redirectTo || (res.data.user.role === "ADMIN" ? "/admin" : "/dashboard"));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  const onOtp = async (data: OtpForm) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ userId, otp: data.otp });
      setAuth(res.data.token, res.data.user);
      toast.success("Login successful!");
      router.push(redirectTo || "/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Smart Inverter's</h1>
          <p className="text-blue-200 mt-1">{mfaRequired ? t("verifyOtp") : t("login")}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {!mfaRequired ? (
            <form onSubmit={form.handleSubmit(onLogin)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("email")}</label>
                <input
                  {...form.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("password")}</label>
                <div className="relative">
                  <input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" {...form.register("rememberMe")} className="rounded" />
                  {t("rememberMe")}
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-base transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("signIn")}
              </button>

              <p className="text-center text-sm text-gray-500">
                {t("noAccount")}{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">{t("signUp")}</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtp)} className="space-y-5">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">{t("otpSent")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("otp")}</label>
                <input
                  {...otpForm.register("otp")}
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-[8px]"
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-red-500 text-xs mt-1 text-center">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-base transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("verifyOtp")}
              </button>
              <button type="button" onClick={() => setMfaRequired(false)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
