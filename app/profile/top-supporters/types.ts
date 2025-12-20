export type TopSupporterBadges = {
  level: number;
  vip: number;
  svp: number;
  dealer: boolean;
  admin?: boolean;
  root?: boolean;
};

export type TopSupporterItem = {
  id: string; // doc id (supporterUid)
  supporterUid: string;

  username?: string;
  avatar?: string | null;

  totalVb: number;

  badges?: TopSupporterBadges;

  lastDonationAt?: any;
  updatedAt?: any;
};
