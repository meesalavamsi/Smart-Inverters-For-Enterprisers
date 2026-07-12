"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {settings.popup_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.popup_image} alt="" className="w-full h-48 object-cover" />
            )}

            <div className="p-6 text-center">
              {settings.popup_title && (
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{settings.popup_title}</h2>
              )}
              {settings.popup_message && (
                <p className="text-gray-600 leading-relaxed mb-5">{settings.popup_message}</p>
              )}
              {settings.popup_button_text && settings.popup_button_link && (
                <Link
                  href={settings.popup_button_link}
                  onClick={close}
                  className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {settings.popup_button_text}
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
