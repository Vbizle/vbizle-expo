import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export async function addVip(uid: string, amount: number) {
  if (!uid) return;
  try {
    await updateDoc(doc(db, "users", uid), {
      vipScore: increment(amount)
    });
  } catch (err) {
    console.log("VIP ekleme hatası:", err);
  }
}
