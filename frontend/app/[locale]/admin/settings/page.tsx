"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

const LABELS: Record<string, string> = {
  site_name: "Site Name",
  site_tagline: "Tagline",
  business_phone: "Business Phone",
  business_whatsapp: "WhatsApp Number",
  business_email: "Business Email",
  business_address: "Business Address",
  business_hours: "Business Hours",
  currency: "Currency",
  tax_rate: "Tax Rate (%)",
  free_delivery_threshold: "Free Delivery Above (₹)",
  delivery_charge: "Delivery Charge (₹)",
  maintenance_mode: "Maintenance Mode",
  allow_registration: "Allow Registration",
  require_email_verification: "Require Email Verification",
  max_login_attempts: "Max Login Attempts",
  otp_expiry_minutes: "OTP Expiry (minutes)",
};

const GROUPS: Record<string, string[]> = {
  general: ["site_name", "site_tagline", "maintenance_mode", "allow_registration"],
  business: ["business_phone", "business_whatsapp", "business_email", "business_address", "business_hours"],
  commerce: ["currency", "tax_rate", "free_delivery_threshold", "delivery_charge"],
  security: ["require_email_verification", "max_login_attempts", "otp_expiry_minutes"],
  contact: ["contact_name", "contact_phone", "contact_email", "contact_address"],
};

const GROUP_LABELS: Record<string, string> = {
  general: "General Settings",
  business: "Business Information",
  commerce: "Commerce & Pricing",
  security: "Security Settings",
  contact: "Contact Information",
};

function labelOf(key: string): string {
  if (LABELS[key]) return LABELS[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isBoolValue(val: string) {
  return val === "true" || val === "false";
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getSettings();
      const data = res.data?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setEdits(data as Record<string, string>);
      } else {
        setEdits({});
      }
    } catch {
      setError("Could not load settings. Make sure the backend is running.");
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateSettings(edits);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  // Build grouped display: known groups first, then any extra keys
  const knownKeys = new Set(Object.values(GROUPS).flat());
  const extraKeys = Object.keys(edits).filter((k) => !knownKeys.has(k));
  const allGroupKeys = { ...GROUPS, ...(extraKeys.length ? { other: extraKeys } : {}) };

  // Only show groups that have at least one key present in edits
  const activeGroups = Object.entries(allGroupKeys).filter(([, keys]) =>
    keys.some((k) => k in edits)
  );

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              Settings
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Configure your business platform settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-60`}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-5" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, j) => <div key={j} className="h-10 bg-gray-100 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 font-semibold">{error}</p>
            <button onClick={fetchSettings} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200">
              Retry
            </button>
          </div>
        ) : activeGroups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No settings found</p>
            <p className="text-gray-400 text-sm mt-2">Settings will appear here once configured in the database.</p>
            <button onClick={fetchSettings} className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGroups.map(([group, keys]) => {
              const presentKeys = keys.filter((k) => k in edits);
              return (
                <div key={group} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <h2 className="font-bold text-gray-900">
                        {GROUP_LABELS[group] || group.charAt(0).toUpperCase() + group.slice(1) + " Settings"}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {presentKeys.map((key) => {
                        const val = edits[key] ?? "";
                        const isBool = isBoolValue(val);
                        return (
                          <div key={key}>
                            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                              {labelOf(key)}
                            </label>
                            {isBool ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setEdits((prev) => ({
                                      ...prev,
                                      [key]: prev[key] === "true" ? "false" : "true",
                                    }))
                                  }
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    val === "true" ? "bg-blue-600" : "bg-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                      val === "true" ? "translate-x-6" : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <span className="text-sm text-gray-600">
                                  {val === "true" ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            ) : (
                              <input
                                value={val}
                                onChange={(e) =>
                                  setEdits((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow"
                                placeholder={`Enter ${labelOf(key).toLowerCase()}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
