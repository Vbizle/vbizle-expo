import { functions } from "@/firebase/firebaseConfig";
import { httpsCallable } from "firebase/functions";

type RootAnnouncementPayload = {
  title: string;
  body: string;
  imageUrl?: string;
  roomId?: string;
};

export async function sendRootAnnouncement(
  payload: RootAnnouncementPayload
) {
  const call = httpsCallable(functions, "sendRootAnnouncement");

  await call({
    title: payload.title,
    body: payload.body,

    // 🔥 YENİ: meta alanı
    meta: {
      imageUrl: payload.imageUrl || null,
      action: payload.roomId ? "JOIN_ROOM" : null,
      roomId: payload.roomId || null,
    },
  });
}
