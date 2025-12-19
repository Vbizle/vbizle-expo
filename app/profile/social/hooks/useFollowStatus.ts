import { auth } from "@/firebase/firebaseConfig";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { followingQuery } from "../services/followService";

type FollowStatus = {
  isFollowing: boolean;
  isFriend: boolean;
  loading: boolean;
};

function isValidUid(uid: any): uid is string {
  return typeof uid === "string" && uid.trim().length > 0 && uid !== "undefined";
}

export function useFollowStatus(targetUid?: string): FollowStatus {
  const meUid = auth.currentUser?.uid;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 TEK ve KESİN GUARD
    if (!isValidUid(meUid) || !isValidUid(targetUid) || meUid === targetUid) {
      setIsFollowing(false);
      setIsFriend(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    let iFollow = false;
    let theyFollow = false;

    const unsubIFollow = onSnapshot(
      followingQuery(meUid),
      (snap) => {
        iFollow = snap.docs.some((d) => d.data()?.to === targetUid);
        update();
      },
      () => setLoading(false)
    );

    const unsubTheyFollow = onSnapshot(
      followingQuery(targetUid),
      (snap) => {
        theyFollow = snap.docs.some((d) => d.data()?.to === meUid);
        update();
      },
      () => setLoading(false)
    );

    function update() {
      setIsFollowing(iFollow);
      setIsFriend(iFollow && theyFollow);
      setLoading(false);
    }

    return () => {
      unsubIFollow();
      unsubTheyFollow();
    };
  }, [meUid, targetUid]);

  return { isFollowing, isFriend, loading };
}
