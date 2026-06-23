"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, RefreshCw, Users, ShoppingBag, DollarSign, Star } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

const PERIODS = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "1y", label: "Last Year" },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [period, setPeriod] = useState("30d");
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [revenue, setRevenue] = useState<{ period: string; revenue: number; orders: number }[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ id: string; action: string; entity: string; createdAt: string; user?: { name: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [dash, rev, logs] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getRevenue(period),
        analyticsApi.getAuditLogs({ limit: 20 }),
      ]);
      setDashboard(dash.data.data);
      setRevenue(rev.data.data || []);
      setAuditLogs(logs.data.data || []);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  if (!user || user.role !== "ADMIN") return null;

  const d = dashboard as {
    orders?: { byStatus?: { status: string; _count: { status: number } }[]; total?: number; thisMonth?: number };
    revenue?: { total?: number; lastMonth?: number };
    customers?: { total?: number; thisMonth?: number };
    feedback?: { avgRating?: string; total?: number };
  } | null;

  const orderStatusData = (d?.orders?.byStatus || []).map((s) => ({
    name: s.status,
    value: s._count.status,
  }));

  const revenueChartData = revenue.slice().reverse().map((r) => ({
    period: r.period,
    revenue: Number(r.revenue) || 0,
    orders: Number(r.orders) || 0,
  }));

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">Business performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {PERIODS.map(({ key, label }) => (
                <button key={key} onClick={() => setPeriod(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    period === key ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => fetchData(true)} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: DollarSign, label: "Total Revenue", value: formatCurrency(Number(d?.revenue?.total) || 0), sub: `Last month: ${formatCurrency(Number(d?.revenue?.lastMonth) || 0)}`, color: "bg-blue-100 text-blue-600" },
                { icon: ShoppingBag, label: "Total Orders", value: d?.orders?.total || 0, sub: `${d?.orders?.thisMonth || 0} this month`, color: "bg-green-100 text-green-600" },
                { icon: Users, label: "Customers", value: d?.customers?.total || 0, sub: `+${d?.customers?.thisMonth || 0} new`, color: "bg-purple-100 text-purple-600" },
                { icon: Star, label: "Avg Rating", value: `${d?.feedback?.avgRating || 0}/5`, sub: `${d?.feedback?.total || 0} reviews`, color: "bg-yellow-100 text-yellow-600" },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500">{label}</p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
                      <p className="text-xs text-gray-400 mt-1">{sub}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="font-bold text-gray-900">Revenue & Orders Trend</h2>
              </div>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number, name: string) => name === "revenue" ? formatCurrency(v) : v} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                    <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} fill="none" name="Orders" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No revenue data for this period</div>
              )}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Orders by Status Pie */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-5">Orders by Status</h2>
                {orderStatusData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie data={orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                          {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {orderStatusData.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-sm text-gray-600 capitalize">{s.name.toLowerCase()}</span>
                          </div>
                          <span className="font-bold text-sm text-gray-900">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No orders data</div>
                )}
              </div>

              {/* Audit Log */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No activity logged yet</p>
                  ) : auditLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">{log.action}</span> — {log.entity}
                        </p>
                        {log.user && <p className="text-xs text-gray-400">by {log.user.name}</p>}
                        <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
