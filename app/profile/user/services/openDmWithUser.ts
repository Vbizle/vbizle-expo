import { auth } from "@/firebase/firebaseConfig";
import { router } from "expo-router";

export function openDmWithUser(targetUid: string) {
  const myUid = auth.currentUser?.uid;
  if (!myUid || !targetUid) return;

  // DM route: app/messages/[uid]
  router.push(`/messages/${targetUid}`);
}
