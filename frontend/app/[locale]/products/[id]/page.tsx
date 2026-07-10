import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { getProductImageSrc } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.smartinverters.in";

interface ProductData {
  name: string;
  model: string;
  slug: string;
  description: string;
  price: number;
  capacity: string;
  batteryType: string;
  warranty: string;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  images: { url: string }[];
  category: { name: string };
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found | Smart Inverter's Ravulapalem" };
  }

  const title = product.seoTitle?.trim() || `${product.name} (${product.model}) | Smart Inverter's Ravulapalem`;
  const description =
    product.seoDescription?.trim() ||
    `Buy ${product.name} — ${product.capacity}, ${product.batteryType} battery, ${product.warranty} warranty. Authorized Terranova LiFePO4 lithium inverter dealer in Ravulapalem, Andhra Pradesh. ${product.description || ""}`.slice(0, 300);
  const url = `${SITE_URL}/en/products/${product.slug}`;
  const image = product.images?.[0]?.url
    ? getProductImageSrc(product.images[0].url).startsWith("http")
      ? getProductImageSrc(product.images[0].url)
      : `${SITE_URL}${product.images[0].url}`
    : `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    keywords: product.tags ? product.tags.split(",").map((t) => t.trim()) : undefined,
    alternates: { canonical: url },
    openGraph: {
      title, description, url,
      siteName: "Smart Inverter's Ravulapalem",
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title, description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    model: product.model,
    description: product.description,
    category: product.category?.name,
    image: product.images?.[0]?.url
      ? (getProductImageSrc(product.images[0].url).startsWith("http") ? getProductImageSrc(product.images[0].url) : `${SITE_URL}${product.images[0].url}`)
      : `${SITE_URL}/og-image.png`,
    brand: { "@type": "Brand", name: "Terranova" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/en/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    } : {}),
  } : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
