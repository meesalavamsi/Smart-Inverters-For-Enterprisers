"use client";

import { useEffect, useState } from "react";
import { exchangeOfferApi } from "@/lib/api";

export interface ExchangeOffer {
  text: string;
  amount: number;
}

export function useExchangeOffer() {
  const [offer, setOffer] = useState<ExchangeOffer | null>(null);

  useEffect(() => {
    exchangeOfferApi.get().then((res) => {
      const data = res.data?.data || {};
      const amount = parseFloat(data.exchange_offer_amount) || 0;
      if (data.exchange_offer_enabled === "true" && data.exchange_offer_text && amount > 0) {
        setOffer({ text: data.exchange_offer_text, amount });
      }
    }).catch(() => {});
  }, []);

  return offer;
}
