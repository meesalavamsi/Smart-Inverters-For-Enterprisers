"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { popupApi } from "@/lib/api";

export default function OfferTicker() {
  const pathname = usePathname();
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

  // Admin pages have their own layout math (pt-16, exactly matches navbar height) — skip there.
  if (!text || /\/admin(\/|$)/.test(pathname)) return null;

  const item = (key: string) => (
    <span key={key} className="flex items-center gap-2 mx-6 shrink-0">
      <Sparkles className="h-4 w-4 text-yellow-200" />
      {text}
    </span>
  );

  return (
    <>
      {/* Spacer — reserves just enough flow space to close the gap between the ticker and
          each page's own top padding (most pages use pt-20, which already has ~16px of
          buffer beyond the 64px navbar; the ticker itself is 36px tall, so a 20px spacer
          exactly closes that gap: 20 + 80 = 64 (navbar) + 36 (ticker) = 100px). */}
      <div className="h-5" aria-hidden />
      <div className="fixed top-16 inset-x-0 z-40 h-9 w-full overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 flex items-center shadow-md">
        <div className="flex whitespace-nowrap animate-marquee w-max text-white text-sm font-bold">
          {[0, 1, 2, 3, 4, 5].map((i) => item(String(i)))}
          {[6, 7, 8, 9, 10, 11].map((i) => item(String(i)))}
        </div>
      </div>
    </>
  );
}
