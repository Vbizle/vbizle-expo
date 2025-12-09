import { storage } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export async function uploadVoice(uri, convId) {
  try {
    console.log("🎤 VOICE UPLOAD START:", uri);

    // Dosyayı blob olarak al
    const blob = await (await fetch(uri)).blob();

    // Firebase referansı
    const fileRef = ref(storage, `dm/${convId}/voice_${Date.now()}.m4a`);

    // Yükleme
    await uploadBytes(fileRef, blob, {
      contentType: "audio/m4a",
    });

    // URL al
    const url = await getDownloadURL(fileRef);

    console.log("🎤 VOICE UPLOAD SUCCESS:", url);

    return url;
  } catch (e) {
    console.log("❌ VOICE UPLOAD ERROR:", e);
    throw e;
  }
}
