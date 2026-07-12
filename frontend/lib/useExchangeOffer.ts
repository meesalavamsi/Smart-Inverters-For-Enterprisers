"use client";

import { useEffect, useState } from "react";
import { exchangeOfferApi } from "@/lib/api";

export function useExchangeOffer() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    exchangeOfferApi.get().then((res) => {
      const data = res.data?.data || {};
      if (data.exchange_offer_enabled === "true" && data.exchange_offer_text) {
        setText(data.exchange_offer_text);
      }
    }).catch(() => {});
  }, []);

  return text;
}
