"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Search, CheckCircle, XCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import { feedbackApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  isApproved: boolean;
  isDisplayed: boolean;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "DISPLAYED">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchFeedbacks = async () => {
    try {
      const res = await feedbackApi.getAdminAll();
      setFeedbacks(res.data.data || []);
    } catch {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleToggle = async (fb: Feedback, field: "isApproved" | "isDisplayed") => {
    setUpdating(fb.id);
    const updated = {
      isApproved: field === "isApproved" ? !fb.isApproved : fb.isApproved,
      isDisplayed: field === "isDisplayed" ? !fb.isDisplayed : fb.isDisplayed,
    };
    try {
      await feedbackApi.update(fb.id, updated);
      setFeedbacks((prev) => prev.map((f) => f.id === fb.id ? { ...f, ...updated } : f));
      toast.success("Feedback updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback permanently?")) return;
    try {
      await feedbackApi.delete(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      toast.success("Feedback deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "ALL" ||
      (filter === "PENDING" && !f.isApproved) ||
      (filter === "APPROVED" && f.isApproved) ||
      (filter === "DISPLAYED" && f.isDisplayed);
    return matchSearch && matchFilter;
  });

  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : "0";
  const pending = feedbacks.filter((f) => !f.isApproved).length;

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Customer Feedback</h1>
            <p className="text-gray-500 text-sm mt-0.5">Review and approve customer testimonials</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: feedbacks.length, color: "bg-blue-50 text-blue-700" },
            { label: "Pending", value: pending, color: "bg-yellow-50 text-yellow-700" },
            { label: "Approved", value: feedbacks.filter(f => f.isApproved).length, color: "bg-green-50 text-green-700" },
            { label: "Avg Rating", value: `${avgRating}/5`, color: "bg-purple-50 text-purple-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-sm font-medium">{label}</p>
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
              placeholder="Search feedback..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(["ALL", "PENDING", "APPROVED", "DISPLAYED"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-40" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No feedback found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((fb) => (
              <div key={fb.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${
                fb.isDisplayed ? "border-green-200 bg-green-50/30" : fb.isApproved ? "border-blue-200" : "border-gray-100"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{fb.name}</p>
                    <p className="text-xs text-gray-400">{fb.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(fb.createdAt)}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < fb.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{fb.message}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(fb, "isApproved")}
                    disabled={updating === fb.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      fb.isApproved ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {fb.isApproved ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {fb.isApproved ? "Approved" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleToggle(fb, "isDisplayed")}
                    disabled={updating === fb.id || !fb.isApproved}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                      fb.isDisplayed ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {fb.isDisplayed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {fb.isDisplayed ? "Shown on Home" : "Show on Home"}
                  </button>
                  <button
                    onClick={() => handleDelete(fb.id)}
                    className="ml-auto p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
