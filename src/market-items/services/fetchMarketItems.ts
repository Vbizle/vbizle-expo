import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { MarketItem, MarketItemType } from "../types";

const COLLECTION_BY_TYPE: Record<MarketItemType, string> = {
  frame: "market_items_frames",
  svga: "market_items_svga",
};

export function subscribeMarketItems(
  type: MarketItemType,
  cb: (items: MarketItem[]) => void
) {
  const colName = COLLECTION_BY_TYPE[type];
  if (!colName) return () => {};

  const q = query(
    collection(db, colName),
    where("active", "==", true),
    orderBy("priceVb", "asc")
  );

  return onSnapshot(q, (snap) => {
    const items: MarketItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    cb(items);
  });
}
