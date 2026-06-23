"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, AlertCircle, Phone, ChevronDown, X } from "lucide-react";
import { issuesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate, PRIORITY_COLORS } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Issue {
  id: string;
  reportNumber: string;
  customerName: string;
  phone: string;
  issueType: string;
  productName: string;
  description: string;
  priority: string;
  status: string;
  resolution?: string;
  images?: string;
  createdAt: string;
}

const STATUSES = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function AdminIssuesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selected, setSelected] = useState<Issue | null>(null);
  const [resolution, setResolution] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchIssues = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (priorityFilter !== "ALL") params.priority = priorityFilter;
      const res = await issuesApi.getAdminAll(params);
      setIssues(res.data.data || []);
    } catch {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, [statusFilter, priorityFilter]);

  const handleUpdate = async (id: string, data: { status?: string; priority?: string; resolution?: string }) => {
    setUpdating(true);
    try {
      await issuesApi.update(id, data);
      setIssues((prev) => prev.map((i) => i.id === id ? { ...i, ...data } : i));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...data } : null);
      toast.success("Issue updated");
    } catch {
      toast.error("Failed to update issue");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = issues.filter((i) =>
    i.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
    i.customerName.toLowerCase().includes(search.toLowerCase()) ||
    i.issueType.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Issue Reports</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage customer issue reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by report number, customer, or type..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
            {STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
            {PRIORITIES.map((p) => <option key={p} value={p}>{p === "ALL" ? "All Priorities" : p}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="divide-y divide-gray-50">
                {[...Array(5)].map((_, i) => <div key={i} className="p-5 animate-pulse h-24" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No issues found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => { setSelected(issue); setResolution(issue.resolution || ""); }}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?.id === issue.id ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-700">{issue.reportNumber}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS] || "bg-gray-100 text-gray-600"
                          }`}>{issue.priority}</span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{issue.customerName}</p>
                        <p className="text-xs text-gray-500">{issue.issueType} · {issue.productName}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{issue.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          issue.status === "RESOLVED" || issue.status === "CLOSED" ? "bg-green-100 text-green-700" :
                          issue.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        }`}>{issue.status.replace(/_/g, " ")}</span>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(issue.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Issue Detail</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <p className="text-xs text-gray-400">Report #</p>
                    <p className="font-mono font-bold text-blue-700 text-sm">{selected.reportNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="font-semibold text-sm">{selected.customerName}</p>
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Phone className="h-3 w-3" /> {selected.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Issue</p>
                    <p className="text-sm font-semibold">{selected.issueType}</p>
                    <p className="text-xs text-gray-500">{selected.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Status</label>
                    <select
                      value={selected.status}
                      onChange={(e) => handleUpdate(selected.id, { status: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Priority</label>
                    <select
                      value={selected.priority}
                      onChange={(e) => handleUpdate(selected.id, { priority: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Resolution Notes</label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      rows={3}
                      placeholder="Describe how the issue was resolved..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  </div>
                  <button
                    onClick={() => handleUpdate(selected.id, { resolution })}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {updating ? "Saving..." : "Save Resolution"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Select an issue to view details and update</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
