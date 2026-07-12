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

  const isAdmin = /\/admin(\/|$)/.test(pathname);
  const showing = !!text && !isAdmin;

  useEffect(() => {
    // Every page reserves top padding assuming only the navbar is above it. The ticker
    // adds its own clearance (margin-top) plus height, which would double-count that
    // padding — this negative margin on <main> (see layout.tsx) cancels the navbar's
    // portion back out so each page's existing padding stays correct either way.
    document.documentElement.style.setProperty("--ticker-correction", showing ? "-4rem" : "0px");
  }, [showing]);

  if (!showing) return null;

  const item = (key: string) => (
    <span key={key} className="flex items-center gap-2 mx-6 shrink-0">
      <Sparkles className="h-4 w-4 text-yellow-200" />
      {text}
    </span>
  );

  // Normal document flow (not fixed) — sits right below the fixed navbar on load, then
  // scrolls away naturally with the rest of the page, and pushes page content down by
  // exactly its own height with no manual spacing/gap math needed.
  return (
    <div className="mt-16 h-9 w-full overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 flex items-center shadow-md">
      <div className="flex whitespace-nowrap animate-marquee w-max text-white text-sm font-bold">
        {[0, 1, 2, 3, 4, 5].map((i) => item(String(i)))}
        {[6, 7, 8, 9, 10, 11].map((i) => item(String(i)))}
      </div>
    </div>
  );
}
