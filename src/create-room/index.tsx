import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { auth, db, storage } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  runTransaction,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

// Expo’da Capacitor kontrolü
const isNative = true;

export default function CreateRoomPage() {
  const router = useRouter();
  const user = auth.currentUser;

  const [roomName, setRoomName] = useState("");
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // 🔥 Kullanıcı Firestore dokümanı yoksa oluştur
  // -----------------------------------------------------
  useEffect(() => {
    if (!user) return;

    async function ensureUserDoc() {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          username: user.email?.split("@")[0] || "Misafir",
          avatar: "/user.png",
          createdAt: Date.now(),
        });
      }
    }

    ensureUserDoc();
  }, [user]);

  // -----------------------------------------------------
  // 🔥 Fotoğraf seç (Expo ImagePicker)
  // -----------------------------------------------------
  async function handleSelectFile() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const base64 = asset.base64!;
      const uri = `data:image/jpeg;base64,${base64}`;

      const blob = await fetch(uri).then((r) => r.blob());

      setImageFile(blob);
      setPreview(uri);
    } catch (err) {
      console.log("Image error:", err);
    }
  }

  // -----------------------------------------------------
  // 🔥 ODA NUMARASI ARTIRICI COUNTER (100 → 101 → 102)
  // -----------------------------------------------------
  async function getNextRoomNumber() {
    const counterRef = doc(db, "_counters", "roomCounter");

    const next = await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);

      if (!snap.exists()) {
        tx.set(counterRef, { last: 100 });
        return 100;
      }

      const last = snap.data().last || 100;
      const newNum = last + 1;

      tx.update(counterRef, { last: newNum });
      return newNum;
    });

    return next;
  }

  // -----------------------------------------------------
  // 🔥 ODA OLUŞTUR
  // -----------------------------------------------------
  async function handleCreateRoom() {
    if (!roomName) {
      alert("Oda ismi gerekli!");
      return;
    }

    if (!user) {
      alert("Giriş yapmalısınız!");
      return;
    }

    setLoading(true);

    try {
      // Kullanıcının zaten odası var mı?
      const q = query(collection(db, "rooms"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const id = snap.docs[0].id;
        alert("Zaten bir odanız var");
        router.push(`/rooms/${id}`);
        return;
      }

      // 🔥 Resim yükle
      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `roomImages/${user.uid}/${Date.now()}.jpg`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      // 🔥 Host bilgisi
      const uref = doc(db, "users", user.uid);
      const usnap = await getDoc(uref);

      const hostName = usnap.exists() ? usnap.data().username : "Host";
      const hostAvatar = usnap.exists() ? usnap.data().avatar : "/user.png";

      // 🔥 Oda numarasını al (100,101,102…)
      const roomNumber = await getNextRoomNumber();

      // 🔥 Oda oluştur
      const roomRef = await addDoc(collection(db, "rooms"), {
        name: roomName,
        image: imageUrl,
        ownerId: user.uid,

        roomNumber,

        onlineUsers: [user.uid],
        onlineCount: 1,

        videoId: "",
        isPlaying: false,
        currentTime: 0,
        lastUpdate: Date.now(),
        videoVolume: 100,

        hostState: { camera: false, mic: false },
        guestState: { camera: false, mic: false },
        guestSeat: null,

        hostName,
        hostAvatar,
        guestName: null,
        guestAvatar: null,

        createdAt: Date.now(),
      });

      router.push(`/rooms/${roomRef.id}`);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Giriş yapmanız gerekiyor.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Oda Oluştur</Text>

      <TextInput
        placeholder="Oda Adı"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={roomName}
        onChangeText={setRoomName}
      />

      <Text style={styles.label}>Oda Resmi</Text>

      <TouchableOpacity onPress={handleSelectFile} style={styles.fileBtn}>
        <Text style={{ color: "#fff" }}>Fotoğraf Seç</Text>
      </TouchableOpacity>

      {preview !== "" && (
        <Image source={{ uri: preview }} style={styles.preview} />
      )}

      <TouchableOpacity
        disabled={loading}
        onPress={handleCreateRoom}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Odayı Oluştur</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    color: "#bbb",
    marginBottom: 6,
  },
  fileBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 20,
    alignItems: "center",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
