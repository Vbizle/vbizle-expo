import { auth } from "@/firebase/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import FollowCountersRow from "./components/FollowCountersRow";
import FollowListModal from "./components/FollowListModal";

import { useFollowCounts } from "./hooks/useFollowCounts";
import { useFollowLists } from "./hooks/useFollowLists";
import { unfollowUser } from "./services/followService";

type Mode = "following" | "followers" | "friends";

export default function ProfileFollowSection() {
  const { uid: routeUid } = useLocalSearchParams<{ uid?: string }>();
  const viewerUid = auth.currentUser?.uid;

  const profileUid = routeUid ?? viewerUid;
  if (!profileUid || !viewerUid) return null;

  const isOwner = profileUid === viewerUid;

  const counts = useFollowCounts(profileUid);
  const { following, followers, friends } = useFollowLists(profileUid);

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("following");

  return (
    <>
      {/* === COUNTERS === */}
      <FollowCountersRow
        counts={counts}
        onPressFollowing={
          isOwner
            ? () => {
                setMode("following");
                setVisible(true);
              }
            : undefined
        }
        onPressFriends={
          isOwner
            ? () => {
                setMode("friends");
                setVisible(true);
              }
            : undefined
        }
        onPressFollowers={
          isOwner
            ? () => {
                setMode("followers");
                setVisible(true);
              }
            : undefined
        }
      />

      {/* === MODAL === */}
      {isOwner && (
        <FollowListModal
          visible={visible}
          mode={mode}
          following={following}
          friends={friends}
          followers={followers}
          onClose={() => setVisible(false)}
          onUnfollow={(targetUid) => unfollowUser(targetUid)}
        />
      )}
    </>
  );
}
