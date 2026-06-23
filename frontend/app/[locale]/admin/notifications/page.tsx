"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Check } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  ORDER: "bg-blue-100 text-blue-700",
  BOOKING: "bg-purple-100 text-purple-700",
  ISSUE: "bg-red-100 text-red-700",
  FEEDBACK: "bg-yellow-100 text-yellow-700",
  SYSTEM: "bg-gray-100 text-gray-700",
};

export default function AdminNotificationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchNotifications = async () => {
    try {
      const res = await analyticsApi.getNotifications();
      setNotifications(res.data.data || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await analyticsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await analyticsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" />
              {markingAll ? "Marking..." : "Mark All Read"}
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => <div key={i} className="p-5 animate-pulse h-20" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="h-14 w-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-1">No notifications yet</h3>
              <p className="text-gray-400 text-sm">Notifications about orders, bookings, and issues will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                    !n.isRead ? "bg-blue-50/50" : "hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[n.type] || TYPE_COLORS.SYSTEM}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {n.title}
                          {!n.isRead && <span className="ml-2 inline-block h-2 w-2 bg-blue-500 rounded-full" />}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0 px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" /> Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
