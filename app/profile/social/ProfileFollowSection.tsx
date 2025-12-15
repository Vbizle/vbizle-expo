import { auth } from "@/firebase/firebaseConfig";
import React, { useState } from "react";

import FollowCountersRow from "./components/FollowCountersRow";
import FollowListModal from "./components/FollowListModal";

import { useFollowCounts } from "./hooks/useFollowCounts";
import { useFollowLists } from "./hooks/useFollowLists";
import { unfollowUser } from "./services/followService";

type Mode = "following" | "followers" | "friends";

export default function ProfileFollowSection() {
  const user = auth.currentUser;
  const uid = user?.uid;

  const counts = useFollowCounts(uid);
  const { following, followers, friends } = useFollowLists(uid);

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("following");

  if (!uid) return null;

  return (
    <>
      {/* === COUNTERS === */}
      <FollowCountersRow
        counts={counts}
        onPressFollowing={() => {
          setMode("following");
          setVisible(true);
        }}
        onPressFriends={() => {
          setMode("friends");
          setVisible(true);
        }}
        onPressFollowers={() => {
          setMode("followers");
          setVisible(true);
        }}
      />

      {/* === MODAL (TAB'LI) === */}
      <FollowListModal
        visible={visible}
        mode={mode}              // hangi sayaçtan girildiyse
        following={following}
        friends={friends}
        followers={followers}
        onClose={() => setVisible(false)}
        onUnfollow={(targetUid) => unfollowUser(targetUid)}
      />
    </>
  );
}
