"use client";

import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export function useRoomSettings(roomId: string, room: any, user: any) {
  const storage = getStorage();

  const [newRoomName, setNewRoomName] = useState(room?.name || "");
  const [newRoomImage, setNewRoomImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveRoomSettings() {
    if (!room || !user) return;
    if (room.ownerId !== user.uid) return;

    // 🔥 İsim boşsa izin verme
    if (!newRoomName.trim()) {
      setError("Oda adı boş olamaz.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const roomRef = doc(db, "rooms", roomId);

      let imageURL = room.image;

      /* ----------------------------------------------------
         🔥 SADECE yeni resim seçilmişse upload yap
      ---------------------------------------------------- */
      if (newRoomImage) {
        try {
          const imgRef = ref(
            storage,
            `roomImages/${roomId}/${Date.now()}.jpg`
          );

          await uploadBytes(imgRef, newRoomImage);

          imageURL = await getDownloadURL(imgRef);
        } catch (uploadErr) {
          console.error("❌ Oda resmi yükleme hatası:", uploadErr);
          setError("Resim yüklenirken bir hata oluştu.");
        }
      }

      /* ----------------------------------------------------
         🔥 Firestore güncelleme
      ---------------------------------------------------- */
      await updateDoc(roomRef, {
        name: newRoomName.trim(),
        image: imageURL,
      });
    } catch (err) {
      console.error("❌ saveRoomSettings error:", err);
      setError("Oda ayarları kaydedilemedi!");
    }

    setSaving(false);
  }

  return {
    newRoomName,
    setNewRoomName,

    newRoomImage,
    setNewRoomImage,

    saveRoomSettings,
    saving,
    error,
  };
}
