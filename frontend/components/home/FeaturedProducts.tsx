"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Package, ShoppingCart } from "lucide-react";
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
  reviewCount: number; stockQuantity: number;
  images: { url: string }[]; category: { name: string };
}

function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale3d(1.03,1.03,1.03)`;
    el.style.boxShadow = `${-x * 20}px ${-y * 20}px 50px rgba(37,99,235,0.25), 0 0 30px rgba(37,99,235,0.15)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(700px) rotateX(0) rotateY(0) scale3d(1,1,1)";
    el.style.boxShadow = "0 4px 30px rgba(0,0,0,0.4)";
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className}
      style={{ transition: "transform 0.12s ease, box-shadow 0.12s ease", transformStyle: "preserve-3d", willChange: "transform", boxShadow: "0 4px 30px rgba(0,0,0,0.4)", ...style }}>
      {children}
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const t = useTranslations("featured");
  const { addItem } = useCartStore();
  const router = useRouter();
  const primaryImage = product.images[0]?.url;
  const discount = 0;

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: primaryImage, model: product.model });
    toast.success(t("addedToCart"));
    router.push("/cart");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <TiltCard className="rounded-3xl overflow-hidden flex flex-col h-full border border-white/10 cursor-default"
        style={{ background: "linear-gradient(145deg, #0f1f3d, #0a1628)" } as React.CSSProperties}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          {primaryImage ? (
            <Image
              src={primaryImage.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL}${primaryImage}` : primaryImage}
              alt={product.name} fill
              className="object-contain p-4 hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Package className="h-14 w-14 text-blue-800" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/40 text-blue-300" style={{ background: "rgba(37,99,235,0.2)" }}>
            {product.category.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-white text-base leading-tight line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-xs text-blue-400 mb-3">{t("model")} {product.model}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-xs px-2 py-0.5 rounded border border-blue-500/30 text-blue-300">{product.capacity}</span>
            <span className="text-xs px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">{product.batteryType}</span>
            <span className="text-xs px-2 py-0.5 rounded border border-green-500/30 text-green-300">🛡️ {product.warranty}</span>
          </div>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700 fill-gray-700"}`} />
              ))}
              <span className="text-xs text-blue-400 ml-1">({product.reviewCount})</span>
            </div>
          )}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-extrabold text-blue-400">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${product.slug}`}
                className="flex-1 text-center border border-blue-500/40 text-blue-300 hover:bg-blue-500/10 hover:text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-200">
                {t("details")}
              </Link>
              <button onClick={handleBook}
                className="flex-1 flex items-center justify-center gap-1.5 text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 0 15px rgba(37,99,235,0.4)" }}>
                <ShoppingCart className="h-3.5 w-3.5" /> {t("order")}
              </button>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const t = useTranslations("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getAll({ limit: 4, sort: "popular" })
      .then((res) => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !products.length) return null;

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #020818 0%, #050d24 100%)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[200px]" style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-xs font-bold px-4 py-2 rounded-full mb-4 border border-blue-500/40 text-blue-300"
              style={{ background: "rgba(37,99,235,0.15)" }}
            >
              {t("badge")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-extrabold text-white"
            >
              <span style={{ background: "linear-gradient(135deg,#60a5fa,#3b82f6,#06b6d4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                {t("title")}
              </span>
            </motion.h2>
            <p className="mt-2 text-blue-300/70">{t("subtitle")}</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 hover:gap-3 transition-all duration-200">
            {t("viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-blue-400 font-semibold">
            {t("viewAllMobile")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
