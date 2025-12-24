import { useEffect, useState } from "react";
import { subscribeMarketItems } from "../services/fetchMarketItems";
import { MarketItem, MarketItemType } from "../types";

export function useMarketItems(type: MarketItemType) {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsub = subscribeMarketItems(type, (data) => {
      setItems(data);
      setLoading(false);
    });

    return () => {
      unsub && unsub();
    };
  }, [type]);

  return {
    items,
    loading,
  };
}
