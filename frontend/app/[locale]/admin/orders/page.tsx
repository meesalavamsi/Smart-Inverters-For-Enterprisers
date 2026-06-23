"use client";

import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";

const ORDER_STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","RETURNED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [updatingId, setUpdatingId] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await ordersApi.getAdminAll(params);
      setOrders(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [search, status, page]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await ordersApi.updateStatus(id, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch { toast.error("Failed to update status"); }
    finally { setUpdatingId(""); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pagination.total} total orders</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search order number..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Order #", "Customer", "Items", "Amount", "Payment", "Status", "Date", "Action"].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                  <p>No orders yet</p>
                </td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-blue-700">{order.orderNumber}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.paymentStatus === "PAID" ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg border font-semibold focus:outline-none cursor-pointer ${ORDER_STATUS_COLORS[order.status] || ""}`}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <button className="text-blue-600 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
