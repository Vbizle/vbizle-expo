// src/premium/types.ts

import type { UserPremiumStatus } from "@/market/types";

export type PremiumStatusState = {
  premiumStatus: UserPremiumStatus | null;
  loading: boolean;
};
