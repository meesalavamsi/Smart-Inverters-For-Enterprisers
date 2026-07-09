"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Search, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { reviewsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; model: string };
}

export default function AdminReviewsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      const res = await reviewsApi.getAdminAll({ limit: 100 });
      setReviews(res.data.data || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (r: Review) => {
    setUpdating(r.id);
    try {
      await reviewsApi.update(r.id, { isApproved: !r.isApproved });
      setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, isApproved: !r.isApproved } : x));
      toast.success(r.isApproved ? "Review unapproved" : "Review approved");
    } catch {
      toast.error("Failed to update review");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await reviewsApi.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch = r.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.product.name.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || (filter === "PENDING" && !r.isApproved) || (filter === "APPROVED" && r.isApproved);
    return matchSearch && matchFilter;
  });

  const pending = reviews.filter((r) => !r.isApproved).length;

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Product Reviews</h1>
            <p className="text-gray-500 text-sm mt-0.5">Approve verified-purchase reviews to show them on product pages</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: reviews.length, color: "bg-blue-50 text-blue-700" },
            { label: "Pending", value: pending, color: "bg-yellow-50 text-yellow-700" },
            { label: "Approved", value: reviews.filter(r => r.isApproved).length, color: "bg-green-50 text-green-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, product or comment..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(["ALL", "PENDING", "APPROVED"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-40" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No reviews found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <div key={r.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${
                r.isApproved ? "border-green-200 bg-green-50/30" : "border-gray-100"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{r.user.name}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-semibold text-blue-600 mb-1">{r.product.name} ({r.product.model})</p>
                {r.title && <p className="font-medium text-gray-800 text-sm mb-1">{r.title}</p>}
                <p className="text-gray-700 text-sm leading-relaxed mb-1">{r.comment}</p>
                <p className="text-xs text-gray-400 mb-4">{formatDate(r.createdAt)}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(r)}
                    disabled={updating === r.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      r.isApproved ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {r.isApproved ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {r.isApproved ? "Approved" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
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
