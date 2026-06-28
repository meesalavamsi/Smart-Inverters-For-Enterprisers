"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, X, Loader2, Upload, CheckCircle } from "lucide-react";
import { productsApi } from "@/lib/api";
import { formatCurrency, getProductImageSrc } from "@/lib/utils";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { toast } from "sonner";

interface Product {
  id: string; name: string; model: string; slug: string;
  price: number; originalPrice?: number; status: string; stockQuantity: number;
  batteryType: string; capacity: string; warranty: string; createdAt: string;
  description?: string; features?: string; specifications?: string;
  tags?: string; seoTitle?: string; seoDescription?: string;
  category: { id: string; name: string };
  images: { url: string; isPrimary: boolean }[];
  _count: { orderItems: number };
}

interface Category { id: string; name: string; }

const defaultForm = {
  name: "", model: "", description: "", price: "",
  originalPrice: "", warranty: "", capacity: "",
  batteryType: "Tubular", features: "", specifications: "",
  stockQuantity: "0", status: "ACTIVE", tags: "",
  seoTitle: "", seoDescription: "", categoryId: "", imageUrl: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAdminAll({ search, limit: 50 });
      setProducts(res.data.data || []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    productsApi.getCategories().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, [search]);

  const openAdd = () => { setForm(defaultForm); setFiles([]); setEditProduct(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      model: p.model,
      description: p.description || "",
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      warranty: p.warranty || "",
      capacity: p.capacity || "",
      batteryType: p.batteryType || "Tubular",
      features: p.features || "",
      specifications: p.specifications || "",
      stockQuantity: String(p.stockQuantity),
      status: p.status,
      tags: p.tags || "",
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || "",
      categoryId: p.category?.id || "",
      imageUrl: "",
    });
    setFiles([]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.model || !form.price || !form.categoryId) {
      toast.error("Name, model, price and category are required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append("images", f));

      if (editProduct) {
        await productsApi.update(editProduct.id, fd);
        toast.success("Product updated!");
      } else {
        await productsApi.create(fd);
        toast.success("Product created and is now live on the website!");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the website?`)) return;
    try {
      await productsApi.delete(id);
      toast.success("Product removed from website");
      fetchProducts();
    } catch { toast.error("Failed to delete product"); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Products & Inverters</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {products.length} products live on website · Add/edit inverters, batteries & future electric products here
            </p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" placeholder="Search products by name or model..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Product", "Category", "Price", "Stock", "Status", "Sales", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                  </td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium">No products yet</p>
                  <p className="text-sm">Click "Add Product" to create your first product</p>
                </td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img src={getProductImageSrc(p.images[0].url)} alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{p.category?.name}</td>
                  <td className="px-5 py-4 text-sm font-bold text-blue-700">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-4 text-sm">
                    <span className={p.stockQuantity <= 5 ? "text-red-600 font-semibold" : "text-gray-700"}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      p.status === "ACTIVE" ? "bg-green-100 text-green-700"
                      : p.status === "INACTIVE" ? "bg-gray-100 text-gray-600"
                      : "bg-red-100 text-red-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{p._count?.orderItems || 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm pt-16">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="w-full max-w-2xl h-[calc(100vh-4rem)] bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editProduct ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Product Name *", placeholder: "e.g. Terranova T-1150 Gen 1 Wall Mount", col: "col-span-2" },
                  { key: "model", label: "Model Number *", placeholder: "e.g. EXML-150" },
                  { key: "price", label: "Price (₹) *", placeholder: "12500", type: "number" },
                  { key: "originalPrice", label: "Original Price (₹)", placeholder: "14000", type: "number" },
                  { key: "warranty", label: "Warranty", placeholder: "3 Years" },
                  { key: "capacity", label: "Capacity", placeholder: "150Ah / 1500VA" },
                  { key: "stockQuantity", label: "Stock Quantity", placeholder: "10", type: "number" },
                ].map(({ key, label, placeholder, type, col }) => (
                  <div key={key} className={col}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type || "text"} placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Battery Type</label>
                <select value={form.batteryType} onChange={e => setForm(f => ({ ...f, batteryType: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["Tubular", "Flat Plate", "Gel", "AGM", "Lithium", "VRLA"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["ACTIVE", "INACTIVE", "OUT_OF_STOCK"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Product description..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                  rows={3} placeholder="Key features (one per line or comma separated)..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (SEO)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="inverter battery, 150ah, tubular..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>

                {/* Show existing images when editing */}
                {editProduct?.images?.length ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Current image:</p>
                    <div className="flex flex-wrap gap-2">
                      {editProduct.images.map((img, i) => (
                        <div key={i} className="relative">
                          <img
                            src={getProductImageSrc(img.url)}
                            alt="" className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          {img.isPrimary && (
                            <span className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">MAIN</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Paste image URL — permanent, doesn't get wiped */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Paste Image URL <span className="text-green-600 font-semibold">(Recommended — image stays permanent)</span>
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://i.ibb.co/... or any public image link"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Upload your image to <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">imgbb.com</a> (free) → copy the Direct link → paste here
                  </p>
                </div>

                {/* Or upload file */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Or upload a file</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Max 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef} type="file" multiple accept="image/*"
                    onChange={e => setFiles(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {files.map((f, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(f)} alt=""
                            className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {editProduct ? "Update Product" : "Create & Publish"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
