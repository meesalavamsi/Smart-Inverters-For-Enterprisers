"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mail, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const emailSchema = z.object({ email: z.string().email("Valid email required") });
const resetSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Min 8 characters").regex(/[A-Z]/, "Need uppercase").regex(/[0-9]/, "Need number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [userId, setUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const handleEmailSubmit = async (data: EmailForm) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(data.email);
      setUserId(res.data.data?.userId || "");
      toast.success("OTP sent to your email");
      setStep("reset");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ userId, otp: data.otp, newPassword: data.newPassword });
      toast.success("Password reset successfully!");
      setStep("done");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">Smart Inverter&apos;s</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {step === "email" ? "Forgot Password?" : step === "reset" ? "Reset Password" : "Password Reset!"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === "email" ? "Enter your email to receive a reset OTP" :
              step === "reset" ? "Enter the OTP from your email and set a new password" :
              "Your password has been changed successfully"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...emailForm.register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                {loading ? "Sending OTP..." : "Send Reset OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>Check your email for a 6-digit OTP</span>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">OTP Code</label>
                <input
                  {...resetForm.register("otp")}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-2xl font-mono tracking-widest"
                />
                {resetForm.formState.errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.otp.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...resetForm.register("newPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, uppercase, number"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Confirm Password</label>
                <input
                  {...resetForm.register("confirmPassword")}
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">Your password has been successfully reset. You can now login with your new password.</p>
              <Link href="/login"
                className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                Back to Login
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
