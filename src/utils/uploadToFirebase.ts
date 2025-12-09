// utils/uploadToFirebase.ts
import { storage } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Expo'da blob oluşturmanın doğru yöntemi (XHR)
async function uriToBlob(uri: string): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error("Blob oluşturulamadı."));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

// 🔥 Firebase'e upload eden ana fonksiyon
export async function uploadToFirebase(uri: string, path: string): Promise<string> {
  try {
    const blob = await uriToBlob(uri);

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    return url;
  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    throw err;
  }
}

export default uploadToFirebase;
