// src/market/types.ts

export type MarketItemId =
  | "kingdom"
  | "sultanate"
  | "empire";

export type PremiumBadgeId =
  | "kingdom"
  | "sultanate"
  | "empire";

export type PremiumAvatarKey =
  | "super-user"
  | "kingdom"
  | "sultanate"
  | "empire";

export type MarketItem = {
  id: MarketItemId;
  title: string;
  description: string;

  priceVb: number;
  durationDays: number;

  // maskeli görünüm
  maskProfile: {
    nickname: string;          // "Süper Kullanıcı"
    avatarKey: PremiumAvatarKey; // ✅ ARTIK URL DEĞİL
    badge: PremiumBadgeId;
  };

  features: {
    canToggleActive: boolean;
    canHideIdentityInLists: boolean;
  };

  active: boolean;
};

export type UserPremiumStatus = {
  type: MarketItemId;

  purchasedAt: any;
  expiresAt: any;

  isActive: boolean;
  hideRealIdentity: boolean;

  maskProfile: {
    nickname: string;
    avatarKey: PremiumAvatarKey; // ✅ AYNI ŞEKİLDE
    badge: PremiumBadgeId;
  };
};
