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
    // Each page's own top-level wrapper reserves padding to clear the fixed navbar
    // (e.g. pt-20). When the ticker is showing, it already clears the navbar itself,
    // so that reserved padding becomes a redundant visible gap — this flag lets
    // globals.css zero out just that one padding value, scoped to page wrappers only.
    document.documentElement.toggleAttribute("data-ticker-active", showing);
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
  // A real spacer div (not margin-top) is used to clear the navbar, since a top margin
  // on the very first flow element can collapse away instead of pushing it down.
  return (
    <>
      <div className="h-16" aria-hidden />
      <div className="h-9 w-full overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 flex items-center shadow-md">
        <div className="flex whitespace-nowrap animate-marquee w-max text-white text-sm font-bold">
          {[0, 1, 2, 3, 4, 5].map((i) => item(String(i)))}
          {[6, 7, 8, 9, 10, 11].map((i) => item(String(i)))}
        </div>
      </div>
    </>
  );
}
