import { storage } from "@/firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadVoice(uri, convId) {
  try {
    console.log("VOICE UPLOAD START:", uri);

    const blob = await (await fetch(uri)).blob();

    const fileRef = ref(storage, `dm/${convId}/voice_${Date.now()}.m4a`);
    await uploadBytes(fileRef, blob, {
      contentType: "audio/m4a",
    });

    const url = await getDownloadURL(fileRef);

    console.log("VOICE UPLOAD OK:", url);

    return url;
  } catch (e) {
    console.log("VOICE UPLOAD ERROR:", e);
    throw e;
  }
}
