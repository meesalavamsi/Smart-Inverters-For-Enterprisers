"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, Package, ChevronLeft, ChevronRight, X, ShoppingCart, Eye } from "lucide-react";

import { productsApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Product {
  id: string; name: string; model: string; slug: string;
  price: number; originalPrice?: number; warranty: string;
  capacity: string; batteryType: string; rating: number;
  reviewCount: number; stockQuantity: number; status: string;
  images: { url: string }[]; category: { name: string };
}

interface Category { id: string; name: string; }

const BATTERY_TYPES = ["Tubular", "Flat Plate", "Gel", "AGM", "Lithium", "VRLA"];
const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "createdAt", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function ProductsPage() {
  const t = useTranslations("products");
  const router = useRouter();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [showFilters, setShowFilters] = useState(false);

  const handleBookNow = (product: Product) => {
    const img = product.images[0]?.url;
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: img, model: product.model });
    toast.success(`${product.name} added! Redirecting to order...`);
    router.push("/cart");
  };

  const [filters, setFilters] = useState({
    search: "", category: "", batteryType: "",
    minPrice: "", maxPrice: "", sort: "popular", page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: filters.page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.batteryType) params.batteryType = filters.batteryType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;

      const res = await productsApi.getAll(params);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0, limit: 12 });
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    productsApi.getCategories().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const updateFilter = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => setFilters({ search: "", category: "", batteryType: "", minPrice: "", maxPrice: "", sort: "popular", page: 1 });

  const activeFilterCount = [filters.category, filters.batteryType, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-extrabold mb-2">{t("title")}</h1>
          <p className="text-blue-200">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search & controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("filters")}
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={filters.category} onChange={e => updateFilter("category", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Battery Type</label>
              <select value={filters.batteryType} onChange={e => updateFilter("batteryType", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Types</option>
                {BATTERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input type="number" placeholder="0" value={filters.minPrice}
                onChange={e => updateFilter("minPrice", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input type="number" placeholder="50000" value={filters.maxPrice}
                onChange={e => updateFilter("maxPrice", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 md:col-span-4 flex justify-end">
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                <X className="h-3 w-3" /> Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-6 bg-gray-100 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">{t("noProducts")}</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:underline text-sm">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product, i) => {
              const primaryImage = product.images[0]?.url;
              const discount = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 bg-gray-50 overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL}${primaryImage}` : primaryImage}
                        alt={product.name} fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                    {product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-gray-900/70 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">{product.category.name}</p>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{product.model}</p>
                    <div className="flex gap-1 flex-wrap mb-2">
                      <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded">{product.capacity}</span>
                      <span className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded">{product.warranty}</span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-xl font-extrabold text-blue-700">{formatCurrency(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Link href={`/products/${product.slug}`}
                          className="flex items-center justify-center gap-1.5 w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-lg font-semibold text-xs transition-colors">
                          <Eye className="h-3.5 w-3.5" /> Review Details
                        </Link>
                        <button
                          onClick={() => handleBookNow(product)}
                          disabled={product.stockQuantity === 0}
                          className="flex items-center justify-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-xs transition-colors">
                          <ShoppingCart className="h-3.5 w-3.5" /> Book Your Order
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button key={page}
                  onClick={() => setFilters(f => ({ ...f, page }))}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${pagination.page === page ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
