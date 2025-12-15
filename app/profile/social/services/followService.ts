// app/profile/social/services/followService.ts

import { auth, db } from "@/firebase/firebaseConfig";
import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

/* ======================================================
   COLLECTION
====================================================== */
const FOLLOWS_COL = "follows";

/* ======================================================
   FOLLOW USER
====================================================== */
export async function followUser(targetUid: string) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not authenticated");
  if (me.uid === targetUid) return;

  const q = query(
    collection(db, FOLLOWS_COL),
    where("from", "==", me.uid),
    where("to", "==", targetUid)
  );

  const snap = await getDocs(q);
  if (!snap.empty) return; // zaten takip ediliyor

  await addDoc(collection(db, FOLLOWS_COL), {
    from: me.uid,
    to: targetUid,
    createdAt: serverTimestamp(),
  });
}

/* ======================================================
   UNFOLLOW USER
====================================================== */
export async function unfollowUser(targetUid: string) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not authenticated");

  const q = query(
    collection(db, FOLLOWS_COL),
    where("from", "==", me.uid),
    where("to", "==", targetUid)
  );

  const snap = await getDocs(q);
  snap.forEach((doc) => deleteDoc(doc.ref));
}

/* ======================================================
   IS FOLLOWING?
====================================================== */
export async function isFollowing(targetUid: string): Promise<boolean> {
  const me = auth.currentUser;
  if (!me) return false;

  const q = query(
    collection(db, FOLLOWS_COL),
    where("from", "==", me.uid),
    where("to", "==", targetUid)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/* ======================================================
   QUERY HELPERS
====================================================== */
export function followersQuery(uid: string) {
  return query(
    collection(db, FOLLOWS_COL),
    where("to", "==", uid)
  );
}

export function followingQuery(uid: string) {
  return query(
    collection(db, FOLLOWS_COL),
    where("from", "==", uid)
  );
}
