"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, ShoppingBag, DollarSign, Wrench, AlertCircle,
  Star, TrendingUp, Package, Bell, RefreshCw, BarChart3
} from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { toast } from "sonner";

interface AnalyticsData {
  customers: { total: number; thisMonth: number };
  orders: { total: number; thisMonth: number; byStatus: { status: string; _count: { status: number } }[] };
  revenue: { total: number; lastMonth: number; monthly: { period: string; revenue: number; orders: number }[] };
  bookings: { total: number; pending: number };
  issues: { open: number; critical: number };
  feedback: { total: number; avgRating: string };
  topProducts: { id: string; name: string; salesCount: number; price: number }[];
  recentOrders: { id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string; user: { name: string } }[];
  unreadNotifications: number;
}

function StatCard({ icon: Icon, title, value, sub, color, trend }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; value: string | number; sub?: string; color: string; trend?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 text-xs font-semibold mt-2 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
              <TrendingUp className="h-3 w-3" />
              {trend >= 0 ? "+" : ""}{trend}% this month
            </div>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await analyticsApi.getDashboard();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (!user || user.role !== "ADMIN") return null;

  const chartData = data?.revenue.monthly
    ?.slice(0, 7)
    .reverse()
    .map((m) => ({
      month: m.period,
      revenue: Number(m.revenue) || 0,
      orders: Number(m.orders) || 0,
    })) || [];

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.name} 👋</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchData(true)} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {(data?.unreadNotifications ?? 0) > 0 && (
              <button
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={() => router.push("/admin/notifications")}
              >
                <Bell className="h-4 w-4" />
                Notifications
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                  {data?.unreadNotifications}
                </span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-28" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard icon={Users} title="Total Customers" value={data.customers.total}
                sub={`+${data.customers.thisMonth} this month`} color="bg-blue-100 text-blue-600" />
              <StatCard icon={ShoppingBag} title="Total Orders" value={data.orders.total}
                sub={`${data.orders.thisMonth} this month`} color="bg-green-100 text-green-600" />
              <StatCard icon={DollarSign} title="Total Revenue"
                value={formatCurrency(data.revenue.total)}
                sub={`Last month: ${formatCurrency(data.revenue.lastMonth)}`}
                color="bg-yellow-100 text-yellow-600" />
              <StatCard icon={Wrench} title="Pending Bookings"
                value={data.bookings.pending} sub={`${data.bookings.total} total`}
                color="bg-purple-100 text-purple-600" />
              <StatCard icon={AlertCircle} title="Open Issues"
                value={data.issues.open}
                sub={data.issues.critical > 0 ? `${data.issues.critical} critical` : "All under control"}
                color={data.issues.critical > 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"} />
              <StatCard icon={Star} title="Avg Rating"
                value={data.feedback.avgRating + "/5"}
                sub={`${data.feedback.total} reviews`} color="bg-pink-100 text-pink-600" />
              <StatCard icon={Package} title="Products"
                value={data.topProducts.length + "+"} sub="Active products"
                color="bg-indigo-100 text-indigo-600" />
              <StatCard icon={BarChart3} title="Notifications"
                value={data.unreadNotifications} sub="Unread notifications"
                color="bg-cyan-100 text-cyan-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-5">Revenue Trend</h2>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
                        fill="url(#revenueGrad)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
                )}
              </div>

              {/* Order status breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-5">Orders by Status</h2>
                <div className="space-y-3">
                  {data.orders.byStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{s.status.toLowerCase()}</span>
                      <span className="font-bold text-gray-900">{s._count.status}</span>
                    </div>
                  ))}
                  {data.orders.byStatus.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No orders yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Recent Orders</h2>
                  <button onClick={() => router.push("/admin/orders")} className="text-blue-600 text-sm hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.recentOrders.map((order) => (
                    <div key={order.id} className="px-6 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.user?.name} · {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700 text-sm">{formatCurrency(order.totalAmount)}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                          order.status === "DELIVERED" ? "bg-green-100 text-green-700"
                            : order.status === "CANCELLED" ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {data.recentOrders.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
                  )}
                </div>
              </div>

              {/* Top products */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-900">Top Products</h2>
                  <button onClick={() => router.push("/admin/products")} className="text-blue-600 text-sm hover:underline">Manage</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.topProducts.map((product, i) => (
                    <div key={product.id} className="px-6 py-3.5 flex items-center gap-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.salesCount} sold · {formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  ))}
                  {data.topProducts.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">No products with sales yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
