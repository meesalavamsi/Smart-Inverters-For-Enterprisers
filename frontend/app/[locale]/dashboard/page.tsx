"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Package, Wrench, AlertCircle, User, LogOut, ShoppingBag } from "lucide-react";
import { ordersApi, bookingsApi, issuesApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, BOOKING_STATUS_COLORS, PRIORITY_COLORS } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomerDashboard() {
  const t = useTranslations("dashboard");
  const { user, clearAuth, updateUser } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "bookings" | "issues" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    Promise.all([
      ordersApi.getMy().then(r => setOrders(r.data.data || [])),
      bookingsApi.getMy().then(r => setBookings(r.data.data || [])),
      issuesApi.getMy().then(r => setIssues(r.data.data || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success("Profile updated!");
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  const TABS = [
    { key: "orders", label: t("myOrders"), icon: ShoppingBag, count: orders.length },
    { key: "bookings", label: t("myBookings"), icon: Wrench, count: bookings.length },
    { key: "issues", label: t("myIssues"), icon: AlertCircle, count: issues.length },
    { key: "profile", label: t("profile"), icon: User, count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-10">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">{t("welcome")}</p>
            <h1 className="text-3xl font-extrabold">{user.name}</h1>
            <p className="text-blue-300 text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={() => { clearAuth(); router.push("/login"); }}
            className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
            <LogOut className="h-4 w-4" />Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex-wrap">
          {TABS.map(tab_item => (
            <button key={tab_item.key}
              onClick={() => setTab(tab_item.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === tab_item.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <tab_item.icon className="h-4 w-4" />
              {tab_item.label}
              {tab_item.count !== null && tab_item.count > 0 && (
                <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 ${tab === tab_item.key ? "bg-white/20" : "bg-gray-100"}`}>
                  {tab_item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100 h-20" />
            ))}
          </div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {tab === "orders" && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link href="/products" className="mt-3 inline-block text-blue-600 font-semibold hover:underline text-sm">
                      Browse Products →
                    </Link>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-blue-700">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)} · {order.paymentMethod}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">{t("total")}</span>
                      <span className="font-extrabold text-blue-700">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "bookings" && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Wrench className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No service bookings yet</p>
                    <Link href="/service-booking" className="mt-3 inline-block text-blue-600 font-semibold hover:underline text-sm">
                      Book a Service →
                    </Link>
                  </div>
                ) : bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-blue-700">{booking.bookingNumber}</p>
                        <p className="text-sm text-gray-600 mt-1">{booking.serviceType.replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-400">{formatDate(booking.preferredDate)} · {booking.preferredTime}</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.address}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${BOOKING_STATUS_COLORS[booking.status] || ""}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "issues" && (
              <div className="space-y-4">
                {issues.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <AlertCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No issues reported</p>
                    <Link href="/issue-report" className="mt-3 inline-block text-orange-600 font-semibold hover:underline text-sm">
                      Report an Issue →
                    </Link>
                  </div>
                ) : issues.map(issue => (
                  <div key={issue.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{issue.reportNumber}</p>
                        <p className="text-sm text-gray-600">{issue.issueType} — {issue.productName}</p>
                        <p className="text-xs text-gray-400 mt-1">{issue.description.slice(0, 100)}...</p>
                        <p className="text-xs text-gray-400">{formatDate(issue.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PRIORITY_COLORS[issue.priority] || ""}`}>
                          {issue.priority}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          issue.status === "RESOLVED" || issue.status === "CLOSED" ? "bg-green-100 text-green-700"
                          : issue.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"}`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>
                    {issue.resolution && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-green-700 font-medium">Resolution: {issue.resolution}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "profile" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-lg">
                <h2 className="font-bold text-gray-900 mb-6">Edit Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
                    <input value={user.email} disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                  </div>
                  <button onClick={handleProfileSave} disabled={saving}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
