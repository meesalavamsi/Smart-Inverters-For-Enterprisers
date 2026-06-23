"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Search, BookOpen, Zap, Battery, Wrench, Recycle, HelpCircle } from "lucide-react";
import { videosApi } from "@/lib/api";
import { useTranslations } from "next-intl";

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
  category: string;
  thumbnail?: string;
  duration?: string;
}

export default function LearningCenterPage() {
  const t = useTranslations("learning");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);

  const CATEGORIES = [
    { key: "ALL", label: t("catAll"), icon: BookOpen },
    { key: "INSTALLATION", label: t("catInstallation"), icon: Wrench },
    { key: "MAINTENANCE", label: t("catMaintenance"), icon: Battery },
    { key: "TROUBLESHOOTING", label: t("catTroubleshooting"), icon: HelpCircle },
    { key: "PRODUCT_DEMO", label: t("catProductDemo"), icon: Zap },
    { key: "TIPS_TRICKS", label: t("catTips"), icon: Recycle },
  ];

  useEffect(() => {
    videosApi.getAll().then((res) => {
      setVideos(res.data.data || []);
    }).catch(() => {
      setVideos([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) => {
    const matchCat = category === "ALL" || v.category === category;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" /> {t("badge")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t("title")}</h1>
          <p className="text-blue-100 max-w-xl mx-auto">{t("description")}</p>
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                category === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{t("emptyTitle")}</h3>
            <p className="text-gray-400 text-sm">{t("emptyDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setPlaying(video)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-blue-700 fill-blue-700 ml-1" />
                    </div>
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </span>
                  )}
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full capitalize">
                    {(video.category || "").replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium">
                    <Play className="h-3.5 w-3.5" /> {t("watchNow")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPlaying(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setPlaying(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="h-7 w-7" />
              </button>
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  title={playing.title}
                />
              </div>
              <div className="p-4 bg-gray-900">
                <h3 className="text-white font-semibold">{playing.title}</h3>
                {playing.description && <p className="text-gray-400 text-sm mt-1">{playing.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
