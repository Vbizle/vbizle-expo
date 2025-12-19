import { functions } from "@/firebase/firebaseConfig";
import { httpsCallable } from "firebase/functions";

type RootAnnouncementPayload = {
  title: string;
  body: string;
};

export async function sendRootAnnouncement(
  payload: RootAnnouncementPayload
) {
  const call = httpsCallable(functions, "sendRootAnnouncement");

  await call({
    title: payload.title,
    body: payload.body,
  });
}
