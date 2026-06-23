"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, BookOpen } from "lucide-react";
import Link from "next/link";
import { videosApi } from "@/lib/api";

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
  category: string;
  duration?: string;
}

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    videosApi.getAll({ limit: "3" } as Record<string, string>)
      .then((res) => setVideos(res.data.data?.slice(0, 3) || []))
      .catch(() => {});
  }, []);

  if (!videos.length) return null;

  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block bg-blue-700 text-blue-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              Learning Center
            </span>
            <h2 className="text-4xl font-extrabold">Learn From Our Experts</h2>
            <p className="mt-2 text-blue-300">Free video guides for installation, maintenance & safety</p>
          </div>
          <Link href="/learning-center"
            className="hidden sm:flex items-center gap-2 text-blue-300 hover:text-white font-semibold transition-colors">
            <BookOpen className="h-4 w-4" /> All Videos
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, i) => (
            <motion.button
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveVideo(video)}
              className="group relative rounded-2xl overflow-hidden aspect-video bg-blue-800/50 border border-blue-700/50 hover:border-blue-400 transition-all text-left"
            >
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                  <Play className="h-6 w-6 text-white ml-1" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">{video.category.replace(/_/g, " ")}</span>
                <p className="text-white font-bold text-sm mt-1 line-clamp-2">{video.title}</p>
                {video.duration && <p className="text-blue-300 text-xs mt-1">⏱ {video.duration}</p>}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="bg-gray-900 p-4">
                <h3 className="text-white font-bold">{activeVideo.title}</h3>
                {activeVideo.description && <p className="text-gray-400 text-sm mt-1">{activeVideo.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
