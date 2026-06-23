"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star, ShoppingCart, MessageCircle, Shield, Zap, ArrowLeft,
  CheckCircle, Package, Truck, ChevronLeft, ChevronRight, ClipboardList
} from "lucide-react";
import { productsApi } from "@/lib/api";
import { useCartStore, useAuthStore } from "@/lib/store";
import { formatCurrency, getWhatsAppUrl } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  model: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  warranty: string;
  capacity: string;
  batteryType: string;
  features: string;
  specifications: string;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  tags?: string;
  images: { id: string; url: string; alt?: string; isPrimary: boolean }[];
  category: { name: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "reviews">("specs");

  useEffect(() => {
    const id = params.id as string;
    productsApi.getBySlug(id).then((res) => {
      setProduct(res.data.data);
    }).catch(() => {
      toast.error("Product not found");
      router.back();
    }).finally(() => setLoading(false));
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!product) return;
    const img = product.images.find(i => i.isPrimary)?.url || product.images[0]?.url;
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: qty, image: img, model: product.model });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBookNow = () => {
    if (!product) return;
    const img = product.images.find(i => i.isPrimary)?.url || product.images[0]?.url;
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: qty, image: img, model: product.model });
    toast.success("Redirecting to order...");
    router.push("/cart");
  };

  const whatsappMsg = product
    ? `Hi! I'm interested in ${product.name} (Model: ${product.model}). Price: ${formatCurrency(product.price)}. Please share more details.`
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl aspect-square animate-pulse" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : [{ id: "1", url: "/placeholder-product.jpg", isPrimary: true }];
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  let specs: Record<string, string> = {};
  let features: string[] = [];
  try { specs = JSON.parse(product.specifications); } catch { specs = { Capacity: product.capacity, Type: product.batteryType, Warranty: product.warranty }; }
  try { features = JSON.parse(product.features); } catch { features = [product.features]; }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-sm">
              <Image
                src={images[imageIdx]?.url?.startsWith("/uploads")
                  ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${images[imageIdx].url}`
                  : images[imageIdx]?.url || "/placeholder-product.jpg"}
                alt={images[imageIdx]?.alt || product.name}
                fill className="object-contain p-6"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=Product"; }}
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImageIdx(i => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setImageIdx(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setImageIdx(i)}
                    className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imageIdx ? "border-blue-500" : "border-gray-200"}`}>
                    <Image
                      src={img.url?.startsWith("/uploads") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img.url}` : img.url}
                      alt="" fill className="object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64?text=Img"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              {product.category.name}
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-3">Model: <span className="font-mono text-gray-700">{product.model}</span></p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-5">
              <span className="text-3xl font-extrabold text-blue-700">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through text-lg">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-5">{product.description}</p>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Zap className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-400">Capacity</p>
                  <p className="text-sm font-semibold">{product.capacity}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-400">Warranty</p>
                  <p className="text-sm font-semibold">{product.warranty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Package className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm font-semibold">{product.batteryType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Truck className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-400">Stock</p>
                  <p className={`text-sm font-semibold ${product.stockQuantity > 0 ? "text-green-600" : "text-red-500"}`}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} Available` : "Out of Stock"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity + buttons */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors">−</button>
                <span className="px-4 py-2 font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors">+</button>
              </div>
            </div>

            {/* Order path — clear steps */}
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700 font-semibold">
              <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] shrink-0">1</span> Review Details
              <span className="text-blue-300">→</span>
              <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] shrink-0">2</span> Book Your Order
              <span className="text-blue-300">→</span>
              <span className="bg-green-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] shrink-0">3</span> We Deliver &amp; Install
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleBookNow}
                disabled={product.stockQuantity === 0}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md"
              >
                <ClipboardList className="h-5 w-5" /> Book Your Order
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart (Continue Shopping)
              </button>
            </div>

            <div className="mt-3">
              <a
                href={getWhatsAppUrl(whatsappMsg)}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors text-sm"
              >
                <MessageCircle className="h-5 w-5" /> Ask on WhatsApp Before Ordering
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(["specs", "features", "reviews"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-800"
                }`}>
                {tab === "specs" ? "Specifications" : tab === "features" ? "Features" : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">{key}</span>
                    <span className="font-semibold text-gray-900 text-sm">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "features" && (
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No reviews yet. Be the first to review this product.</p>
                {user && (
                  <Link href="/feedback" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
                    Write a Review
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
