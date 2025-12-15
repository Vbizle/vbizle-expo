// app/profile/social/types.ts

import { Timestamp } from "firebase/firestore";

export type FollowDoc = {
  from: string;        // takip eden uid
  to: string;          // takip edilen uid
  createdAt: Timestamp;
};

export type FollowCounts = {
  following: number;
  followers: number;
  friends: number;
};

export type MiniUser = {
  uid: string;
  username?: string;
  avatar?: string;
};
