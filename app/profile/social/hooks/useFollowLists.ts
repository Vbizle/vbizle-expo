import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { followersQuery, followingQuery } from "../services/followService";
import { MiniUser } from "../types";

async function getUser(uid: string): Promise<MiniUser> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { uid };
  const d: any = snap.data();
  return {
    uid,
    username: d.username,
    avatar: d.avatar,
  };
}

export function useFollowLists(uid?: string) {
  const [following, setFollowing] = useState<MiniUser[]>([]);
  const [followers, setFollowers] = useState<MiniUser[]>([]);
  const [friends, setFriends] = useState<MiniUser[]>([]);

  useEffect(() => {
    if (!uid) return;

    let followingIds = new Set<string>();
    let followerIds = new Set<string>();

    const unsubFollowing = onSnapshot(
      followingQuery(uid),
      async (snap) => {
        followingIds = new Set(
          snap.docs.map((d) => d.data().to)
        );

        const list = await Promise.all(
          [...followingIds].map(getUser)
        );
        setFollowing(list);
        updateFriends();
      }
    );

    const unsubFollowers = onSnapshot(
      followersQuery(uid),
      async (snap) => {
        followerIds = new Set(
          snap.docs.map((d) => d.data().from)
        );

        const list = await Promise.all(
          [...followerIds].map(getUser)
        );
        setFollowers(list);
        updateFriends();
      }
    );

    async function updateFriends() {
      const ids = [...followingIds].filter((id) =>
        followerIds.has(id)
      );
      const list = await Promise.all(ids.map(getUser));
      setFriends(list);
    }

    return () => {
      unsubFollowing();
      unsubFollowers();
    };
  }, [uid]);

  return {
    following,
    followers,
    friends,
  };
}
