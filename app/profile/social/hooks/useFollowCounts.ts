import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { followersQuery, followingQuery } from "../services/followService";
import { FollowCounts } from "../types";

export function useFollowCounts(uid?: string) {
  const [counts, setCounts] = useState<FollowCounts>({
    following: 0,
    followers: 0,
    friends: 0,
  });

  useEffect(() => {
    if (!uid) return;

    let followingIds = new Set<string>();
    let followerIds = new Set<string>();

    const unsubFollowing = onSnapshot(
      followingQuery(uid),
      (snap) => {
        followingIds = new Set(
          snap.docs.map((d) => d.data().to)
        );
        update();
      }
    );

    const unsubFollowers = onSnapshot(
      followersQuery(uid),
      (snap) => {
        followerIds = new Set(
          snap.docs.map((d) => d.data().from)
        );
        update();
      }
    );

    function update() {
      const friends = [...followingIds].filter((id) =>
        followerIds.has(id)
      ).length;

      setCounts({
        following: followingIds.size,
        followers: followerIds.size,
        friends,
      });
    }

    return () => {
      unsubFollowing();
      unsubFollowers();
    };
  }, [uid]);

  return counts;
}
