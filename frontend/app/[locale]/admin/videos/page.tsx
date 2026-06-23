"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Video, Edit2, X, Check } from "lucide-react";
import { videosApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface YtVideo {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
  category: string;
  duration?: string;
  order: number;
  isActive: boolean;
}

interface RecyclingCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  district?: string;
}

const CATEGORIES = ["INSTALLATION", "MAINTENANCE", "TROUBLESHOOTING", "PRODUCT_DEMO", "TIPS_TRICKS"];

const emptyVideo = { title: "", youtubeId: "", description: "", category: "INSTALLATION", duration: "", order: 0 };
const emptyCenter = { name: "", type: "COLLECTION_CENTER", address: "", phone: "", district: "", state: "Andhra Pradesh" };

export default function AdminVideosPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [videos, setVideos] = useState<YtVideo[]>([]);
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"videos" | "recycling">("videos");
  const [showForm, setShowForm] = useState(false);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [form, setForm] = useState(emptyVideo);
  const [centerForm, setCenterForm] = useState(emptyCenter);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    Promise.all([videosApi.getAll(), videosApi.getRecycling()]).then(([v, r]) => {
      setVideos(v.data.data || []);
      setCenters(r.data.data || []);
    }).catch(() => toast.error("Failed to load data")).finally(() => setLoading(false));
  }, []);

  const handleAddVideo = async () => {
    if (!form.title || !form.youtubeId) { toast.error("Title and YouTube ID are required"); return; }
    setSaving(true);
    try {
      const res = await videosApi.create(form);
      setVideos((prev) => [...prev, res.data.data]);
      setForm(emptyVideo);
      setShowForm(false);
      toast.success("Video added");
    } catch {
      toast.error("Failed to add video");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await videosApi.delete(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddCenter = async () => {
    if (!centerForm.name || !centerForm.address) { toast.error("Name and address are required"); return; }
    setSaving(true);
    try {
      const res = await videosApi.createRecycling(centerForm);
      setCenters((prev) => [...prev, res.data.data]);
      setCenterForm(emptyCenter);
      setShowCenterForm(false);
      toast.success("Recycling center added");
    } catch {
      toast.error("Failed to add center");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCenter = async (id: string) => {
    if (!confirm("Delete this recycling center?")) return;
    try {
      await videosApi.deleteRecycling(id);
      setCenters((prev) => prev.filter((c) => c.id !== id));
      toast.success("Center deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Videos & Resources</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage learning center videos and recycling centers</p>
          </div>
          <button
            onClick={() => tab === "videos" ? setShowForm(true) : setShowCenterForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add {tab === "videos" ? "Video" : "Center"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
          {(["videos", "recycling"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                tab === t ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-800"
              }`}>
              {t === "videos" ? "YouTube Videos" : "Recycling Centers"}
            </button>
          ))}
        </div>

        {/* Add Video Form */}
        {showForm && tab === "videos" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add New Video</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Video title" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">YouTube Video ID *</label>
                <input value={form.youtubeId} onChange={(e) => setForm({ ...form, youtubeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. dQw4w9WgXcQ" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Duration</label>
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. 12:30" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Brief description..." />
              </div>
            </div>
            {form.youtubeId && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Preview thumbnail:</p>
                <img src={`https://img.youtube.com/vi/${form.youtubeId}/mqdefault.jpg`} alt="Preview" className="h-20 rounded-lg" />
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddVideo} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Add Video"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {/* Add Center Form */}
        {showCenterForm && tab === "recycling" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add Recycling Center</h3>
              <button onClick={() => setShowCenterForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Name *", placeholder: "Center name" },
                { key: "type", label: "Type", placeholder: "COLLECTION_CENTER" },
                { key: "address", label: "Address *", placeholder: "Full address" },
                { key: "phone", label: "Phone", placeholder: "+91..." },
                { key: "district", label: "District", placeholder: "e.g. East Godavari" },
                { key: "state", label: "State", placeholder: "Andhra Pradesh" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
                  <input value={centerForm[key as keyof typeof centerForm]}
                    onChange={(e) => setCenterForm({ ...centerForm, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddCenter} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Add Center"}
              </button>
              <button onClick={() => setShowCenterForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {/* Videos List */}
        {tab === "videos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? [...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl aspect-video animate-pulse" />) :
              videos.length === 0 ? (
                <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Video className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">No videos yet. Add your first video.</p>
                </div>
              ) : videos.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                  <div className="relative">
                    <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt={v.title} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {v.category.replace(/_/g, " ")}
                    </span>
                    <button onClick={() => handleDeleteVideo(v.id)}
                      className="absolute top-2 right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">{v.title}</p>
                    {v.duration && <p className="text-xs text-gray-400 mt-1">Duration: {v.duration}</p>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Recycling Centers List */}
        {tab === "recycling" && (
          <div className="space-y-3">
            {loading ? [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-24" />) :
              centers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-400">No recycling centers added yet.</p>
                </div>
              ) : centers.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{c.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{c.type}</span>
                    </div>
                    <p className="text-sm text-gray-500">{c.address}{c.district ? `, ${c.district}` : ""}</p>
                    {c.phone && <p className="text-xs text-gray-400 mt-0.5">{c.phone}</p>}
                  </div>
                  <button onClick={() => handleDeleteCenter(c.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            }
          </div>
        )}
      </main>
    </div>
  );
}
