// src/premium/premiumSelectors.ts

import type { UserPremiumStatus } from "@/market/types";

export function isPremiumActive(
  premiumStatus?: UserPremiumStatus | null
): boolean {
  if (!premiumStatus) return false;

  const now = Date.now();
  const expiresAt = premiumStatus.expiresAt?.toMillis?.();

  if (!expiresAt) return false;

  return premiumStatus.isActive && expiresAt > now;
}

export function isPremiumMaskedInLists(
  premiumStatus?: UserPremiumStatus | null
): boolean {
  return (
    isPremiumActive(premiumStatus) &&
    premiumStatus.hideRealIdentity === true
  );
}
