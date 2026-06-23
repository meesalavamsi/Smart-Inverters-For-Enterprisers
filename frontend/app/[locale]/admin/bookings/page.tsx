"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Wrench, Calendar, Phone, MapPin, ChevronDown } from "lucide-react";
import { bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, BOOKING_STATUS_COLORS } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Booking {
  id: string;
  bookingNumber: string;
  serviceType: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function AdminBookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      const res = await bookingsApi.getAdminAll({ status: statusFilter !== "ALL" ? statusFilter : "" });
      setBookings(res.data.data || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await bookingsApi.updateStatus(id, { status });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast.success("Booking status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings.filter((b) =>
    b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  );

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Service Bookings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage all service booking requests</p>
          </div>
          <div className="text-sm text-gray-500">
            {filtered.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking number, name, or phone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 text-sm bg-transparent border-none focus:outline-none"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-5 animate-pulse h-24 flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-sm font-bold text-blue-700">{booking.bookingNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(booking.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 text-sm">{booking.customerName}</p>
                        <a href={`tel:${booking.phone}`} className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 hover:text-blue-600">
                          <Phone className="h-3 w-3" />{booking.phone}
                        </a>
                        <div className="flex items-start gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{booking.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                          {booking.serviceType.replace(/_/g, " ")}
                        </span>
                        {booking.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{booking.notes}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(booking.preferredDate)}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{booking.preferredTime}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS] || "bg-gray-100 text-gray-600"
                        }`}>
                          {booking.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            disabled={updating === booking.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-6 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 appearance-none cursor-pointer"
                          >
                            {["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
