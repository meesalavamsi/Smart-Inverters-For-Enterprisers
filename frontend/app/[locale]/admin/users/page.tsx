"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Plus, X, Check, UserCog } from "lucide-react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

const emptyForm = { name: "", email: "", password: "", phone: "" };

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const [admins, techs] = await Promise.all([
        usersApi.getAll({ role: "ADMIN" }),
        usersApi.getAll({ role: "TECHNICIAN" }),
      ]);
      const all = [...(admins.data.data || []), ...(techs.data.data || [])];
      const unique = all.filter((u, i, arr) => arr.findIndex(x => x.id === u.id) === i);
      setUsers(unique);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddTechnician = async () => {
    if (!form.name || !form.email || !form.password) { toast.error("Name, email and password are required"); return; }
    setSaving(true);
    try {
      const res = await usersApi.createTechnician(form);
      setUsers((prev) => [...prev, res.data.data]);
      setForm(emptyForm);
      setShowForm(false);
      toast.success("Technician added successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to add technician");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      await usersApi.toggleStatus(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success("User status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    TECHNICIAN: "bg-blue-100 text-blue-700",
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Staff Users</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage admin and technician accounts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Technician
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add New Technician</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Full Name *", type: "text", placeholder: "Technician name" },
                { key: "email", label: "Email *", type: "email", placeholder: "tech@example.com" },
                { key: "phone", label: "Phone", type: "tel", placeholder: "+91..." },
                { key: "password", label: "Password *", type: "password", placeholder: "Secure password" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddTechnician} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                <Check className="h-4 w-4" /> {saving ? "Creating..." : "Create Technician"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff users..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => <div key={i} className="p-5 animate-pulse h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <UserCog className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No staff users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["User", "Contact", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-500">{u.phone || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${roleColors[u.role] || "bg-gray-100 text-gray-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-500">{formatDate(u.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleToggle(u.id)}
                          disabled={toggling === u.id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            u.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
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
