import { SUPER_USER_NICKNAME } from "./constants";
import type { MarketItem } from "./types";

export const MARKET_CATALOG: MarketItem[] = [
  {
    id: "kingdom",
    title: "Krallık",
    description:
      "Belirlenen süre boyunca listelerde kimliğini gizleyip Süper Kullanıcı olarak görünebilirsin.",
    priceVb: 500_000,
    durationDays: 30,
    maskProfile: {
      nickname: SUPER_USER_NICKNAME,
      avatarKey: "kingdom", // ✅ SADECE BU DEĞİŞTİ
      badge: "kingdom",
    },
    features: {
      canToggleActive: true,
      canHideIdentityInLists: true,
    },
    active: true,
  },

  {
    id: "sultanate",
    title: "Hünkarlık",
    description:
      "Daha uzun süre ve daha özel görünümle Süper Kullanıcı olarak listelerde yer al.",
    priceVb: 1_000_000,
    durationDays: 60,
    maskProfile: {
      nickname: SUPER_USER_NICKNAME,
      avatarKey: "sultanate", // ✅ SADECE BU DEĞİŞTİ
      badge: "sultanate",
    },
    features: {
      canToggleActive: true,
      canHideIdentityInLists: true,
    },
    active: true,
  },

  {
    id: "empire",
    title: "İmparatorluk",
    description:
      "En üst paket: uzun süreli Süper Kullanıcı görünümü.",
    priceVb: 2_500_000,
    durationDays: 90,
    maskProfile: {
      nickname: SUPER_USER_NICKNAME,
      avatarKey: "empire", // ✅ SADECE BU DEĞİŞTİ
      badge: "empire",
    },
    features: {
      canToggleActive: true,
      canHideIdentityInLists: true,
    },
    active: true,
  },
];
