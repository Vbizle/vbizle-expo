import { storage } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/**
 * DM için ses dosyası yükler.
 * @param uri - Cihazdan gelen ses kaydı dosyasının URI yolu
 * @param convId - Konuşma ID’si (vbizle DM_123_456)
 */
export async function uploadVoice(uri: string, convId: string) {
  try {
    console.log("🎤 VOICE UPLOAD → START:", uri);

    // 👉 Ses dosyasını blob olarak çek
    const response = await fetch(uri);
    const blob = await response.blob();

    // 👉 Depolama yolu
    const fileRef = ref(storage, `dm/${convId}/voice_${Date.now()}.m4a`);

    // 👉 Firebase Storage upload
    await uploadBytes(fileRef, blob, {
      contentType: "audio/m4a",
    });

    // 👉 Download URL al
    const url = await getDownloadURL(fileRef);

    console.log("✅ VOICE UPLOAD → DONE:", url);

    return url;
  } catch (error) {
    console.log("❌ VOICE UPLOAD ERROR:", error);
    throw error;
  }
}
