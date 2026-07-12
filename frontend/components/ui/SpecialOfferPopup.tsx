"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { popupApi } from "@/lib/api";

interface PopupSettings {
  popup_enabled?: string;
  popup_title?: string;
  popup_message?: string;
  popup_image?: string;
  popup_button_text?: string;
  popup_button_link?: string;
}

const DISMISS_KEY = "offer_popup_dismissed";

export default function SpecialOfferPopup() {
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    popupApi.get().then((res) => {
      const data: PopupSettings = res.data?.data || {};
      if (data.popup_enabled === "true" && (data.popup_title || data.popup_message)) {
        setSettings(data);
        setVisible(true);
      }
    }).catch(() => {});
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "true");
  };

  if (!settings) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 0 0 4px rgba(255,255,255,0.15), 0 25px 80px rgba(249,115,22,0.5), 0 0 100px rgba(236,72,153,0.35)" }}
          >
            {/* Vibrant gradient background */}
            <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-1">
              <div className="rounded-[22px] bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 overflow-hidden">

                <button
                  onClick={close}
                  className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:scale-110 transition-transform"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Decorative sparkles */}
                <Sparkles className="absolute top-6 left-6 h-6 w-6 text-yellow-200 animate-pulse" />
                <Sparkles className="absolute bottom-24 right-10 h-4 w-4 text-yellow-100 animate-pulse" style={{ animationDelay: "0.5s" }} />

                {settings.popup_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.popup_image} alt="" className="w-full h-56 object-cover" />
                )}

                <div className="px-8 pt-8 pb-9 text-center">
                  {settings.popup_title && (
                    <h2
                      className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight"
                      style={{ textShadow: "0 0 20px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.3)" }}
                    >
                      {settings.popup_title}
                    </h2>
                  )}
                  {settings.popup_message && (
                    <p className="text-orange-50 text-lg leading-relaxed mb-6 font-medium">
                      {settings.popup_message}
                    </p>
                  )}
                  {settings.popup_button_text && settings.popup_button_link && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      <Link
                        href={settings.popup_button_link}
                        onClick={close}
                        className="inline-block bg-white text-red-600 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl hover:bg-yellow-50 transition-colors"
                      >
                        {settings.popup_button_text}
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
