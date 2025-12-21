import type { UserPremiumStatus } from "@/market/types";
import { isPremiumMaskedInLists } from "@/src/premium/premiumSelectors";
import type { TopSupporterItem } from "./useTopSupporters";

export function mapTopSupporterItem(params: {
  id: string;
  supporterUid: string;
  data: any;
  userData: any;
}): TopSupporterItem {
  const { id, supporterUid, data, userData } = params;

  const premiumStatus: UserPremiumStatus | null =
    (userData?.premiumStatus ?? null) as UserPremiumStatus | null;

  const isMasked = isPremiumMaskedInLists(premiumStatus);

  const totalVb = Number(data.totalVb ?? 0);

  // 🔥 STATÜ AKTİF + GİZLEME AÇIKSA
  if (isMasked && premiumStatus?.maskProfile) {
    return {
      id,
      supporterUid,
      totalVb,

      // 👑 MASKELİ GÖRÜNÜM
      username: premiumStatus.maskProfile.nickname,
      avatar: premiumStatus.maskProfile.avatarKey,

      // ❌ TÜM KİŞİSEL BİLGİLER GİZLİ
      badges: undefined,
      age: undefined,
      gender: undefined,
      country: undefined,

      // 🔹 premiumStatus yine taşınıyor (UI gerekirse bilsin)
      premiumStatus,
    };
  }

  // 🟢 NORMAL KULLANICI — ESKİ DAVRANIŞ BİREBİR
  return {
    id,
    supporterUid,

    username: data.username || userData?.username || "",
    avatar: data.avatar ?? userData?.avatar ?? null,
    totalVb,

    badges: data.badges
      ? {
          level: Number(data.badges.level ?? 0),
          vip: Number(data.badges.vip ?? 0),
          svp: Number(data.badges.svp ?? 0),
          dealer: Boolean(data.badges.dealer === true),
          admin: Boolean(data.badges.admin === true),
          root: Boolean(data.badges.root === true),
        }
      : undefined,

    premiumStatus,

    age:
      typeof userData?.age === "number" ? userData.age : undefined,

    gender:
      userData?.gender === "male" || userData?.gender === "female"
        ? userData.gender
        : undefined,

    country:
      typeof userData?.nationality?.flag === "string"
        ? userData.nationality.flag
        : undefined,
  };
}
