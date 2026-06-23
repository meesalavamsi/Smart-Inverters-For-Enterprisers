"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, UserCheck, UserX, Phone, Mail, Calendar } from "lucide-react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  _count?: { orders: number; serviceBookings: number };
}

export default function AdminCustomersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    usersApi.getAll({ role: "CUSTOMER" }).then((res) => {
      setCustomers(res.data.data || []);
    }).catch(() => toast.error("Failed to load customers")).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      await usersApi.toggleStatus(id);
      setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
      toast.success("Customer status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search);
    const matchFilter =
      filter === "ALL" ||
      (filter === "ACTIVE" && c.isActive) ||
      (filter === "INACTIVE" && !c.isActive);
    return matchSearch && matchFilter;
  });

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-sm mt-0.5">{customers.length} registered customers</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: customers.length, icon: Users, color: "bg-blue-50 text-blue-700" },
            { label: "Active", value: customers.filter(c => c.isActive).length, icon: UserCheck, color: "bg-green-50 text-green-700" },
            { label: "Verified", value: customers.filter(c => c.isVerified).length, icon: UserCheck, color: "bg-purple-50 text-purple-700" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-4 flex items-center gap-4 ${color}`}>
              <Icon className="h-8 w-8 opacity-70" />
              <div>
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-sm font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => <div key={i} className="p-5 animate-pulse h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No customers found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Customer", "Contact", "Activity", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                          {customer.isVerified && (
                            <span className="text-xs text-green-600 font-medium">Verified</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-600">{customer._count?.orders || 0} orders</p>
                      <p className="text-xs text-gray-400">{customer._count?.serviceBookings || 0} bookings</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {customer.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(customer.id)}
                        disabled={toggling === customer.id}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          customer.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {customer.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        {customer.isActive ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
