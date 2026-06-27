import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smart-inverters.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "te", "hi"];

  const pages = [
    { path: "",               priority: 1.0, changeFrequency: "weekly"  as const },
    { path: "/products",      priority: 0.9, changeFrequency: "weekly"  as const },
    { path: "/services",      priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/learning-center", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/recycling",     priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/about",         priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact",       priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      urls.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  return urls;
}
