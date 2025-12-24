import { auth, db } from "@/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

/**
 * 🔥 PROFİLDE GÖRÜNEN AKTİF FRAME
 */
export async function setProfileActiveFrame(frame: {
  id: string;
  imageUrl: string;
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await updateDoc(doc(db, "users", uid), {
    activeFrame: {
      frameId: frame.id,
      imageUrl: frame.imageUrl,
      updatedAt: Date.now(),
    },
  });
}
