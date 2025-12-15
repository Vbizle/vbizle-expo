import { auth } from "@/firebase/firebaseConfig";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { followingQuery } from "../services/followService";

export function useFollowStatus(targetUid?: string) {
  const me = auth.currentUser;
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (!me || !targetUid || me.uid === targetUid) return;

    let iFollow = false;
    let theyFollow = false;

    const unsubIFollow = onSnapshot(
      followingQuery(me.uid),
      (snap) => {
        iFollow = snap.docs.some(
          (d) => d.data().to === targetUid
        );
        update();
      }
    );

    const unsubTheyFollow = onSnapshot(
      followingQuery(targetUid),
      (snap) => {
        theyFollow = snap.docs.some(
          (d) => d.data().to === me.uid
        );
        update();
      }
    );

    function update() {
      setIsFollowing(iFollow);
      setIsFriend(iFollow && theyFollow);
    }

    return () => {
      unsubIFollow();
      unsubTheyFollow();
    };
  }, [me?.uid, targetUid]);

  return { isFollowing, isFriend };
}
