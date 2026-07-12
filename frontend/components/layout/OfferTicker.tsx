"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { popupApi } from "@/lib/api";

export default function OfferTicker() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    popupApi.get().then((res) => {
      const data = res.data?.data || {};
      if (data.popup_enabled === "true") {
        const combined = [data.popup_title, data.popup_message].filter(Boolean).join(" — ");
        if (combined) setText(combined);
      }
    }).catch(() => {});
  }, []);

  if (!text) return null;

  const item = (key: string) => (
    <span key={key} className="flex items-center gap-2 mx-6 shrink-0">
      <Sparkles className="h-4 w-4 text-yellow-200" />
      {text}
    </span>
  );

  return (
    <>
      {/* Spacer — reserves flow space so page content never overlaps the fixed ticker below,
          regardless of each page's own top padding (which only accounts for the navbar). */}
      <div className="h-9" aria-hidden />
      <div className="fixed top-16 inset-x-0 z-40 h-9 w-full overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 flex items-center shadow-md">
        <div className="flex whitespace-nowrap animate-marquee w-max text-white text-sm font-bold">
          {[0, 1, 2, 3, 4, 5].map((i) => item(String(i)))}
          {[6, 7, 8, 9, 10, 11].map((i) => item(String(i)))}
        </div>
      </div>
    </>
  );
}
