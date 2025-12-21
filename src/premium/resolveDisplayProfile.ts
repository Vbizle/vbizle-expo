import { PREMIUM_AVATARS } from "@/assets/avatars/avatarMap";
import type { UserPremiumStatus } from "@/market/types";
import { isPremiumMaskedInLists } from "./premiumSelectors";

/**
 * Top list / leaderboard / profil ziyaretinde
 * kullanıcıyı nasıl göstereceğimizi belirler
 */
export type DisplayProfile = {
  nickname: string;
  avatarSource?: any; // ❗ URL DEĞİL, Image source
  badge?: string;
  isMasked: boolean;
};

/**
 * NOT:
 * - rank
 * - totalVb
 * - level
 * - sıralama
 * BU FONKSİYONDA ASLA YOK
 */
export function resolveDisplayProfile(params: {
  username: string;
  avatarUrl: string;
  premiumStatus?: UserPremiumStatus | null;
}): DisplayProfile {
  const { username, avatarUrl, premiumStatus } = params;

  // 🔹 Premium maske açık değilse → normal kullanıcı
  if (!isPremiumMaskedInLists(premiumStatus)) {
    return {
      nickname: username,
      avatarSource: avatarUrl ? { uri: avatarUrl } : undefined,
      isMasked: false,
    };
  }

  // 🔹 Premium maske açıksa → Süper Kullanıcı (LOCAL ASSET)
  const avatarKey =
    premiumStatus?.maskProfile?.avatarKey ?? "super-user";

  return {
    nickname: premiumStatus!.maskProfile.nickname,
    avatarSource: PREMIUM_AVATARS[avatarKey],
    badge: premiumStatus!.maskProfile.badge,
    isMasked: true,
  };
}
