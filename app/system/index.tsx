import { auth, db, storage } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import RootAnnouncementModal from "./components/RootAnnouncementModal";
import SystemMessageItem from "./components/SystemMessageItem";
import { sendRootAnnouncement } from "./services/rootAnnouncementService";
import { canShowRootAnnouncement } from "./services/rootAnnouncementVisibility";
import { isRootUser } from "./services/rootPermission";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __keepRootAnnouncementImport = sendRootAnnouncement;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __keepRootPermissionImport = isRootUser;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __keepRootAnnouncementVisibilityImport = canShowRootAnnouncement;

export default function SystemMessagesScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [showRootModal, setShowRootModal] = useState(false);
const [rootTitle, setRootTitle] = useState("");
const [rootBody, setRootBody] = useState("");
const listRef = useRef<FlatList>(null);

  const firstUnreadIndex = useMemo(() => {
    if (!messages.length) return -1;
    return messages.findIndex((m) => m.read === false);
  }, [messages]);


  const canShowRootAnnouncementUi = canShowRootAnnouncement();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const __keepCanShowRootAnnouncementUi = canShowRootAnnouncementUi;

  /* ======================================================
     🔔 SİSTEM MESAJLARINI DİNLE
  ====================================================== */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "appMessages"),
      where("toUid", "in", [uid, "ALL"]),
       orderBy("createdAt", "asc") // ✅
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];

      snap.forEach((d) => {
        arr.push({
          id: d.id,
          ref: d.ref,
          ...d.data(),
        });
      });

      setMessages(arr);
    });

    return () => unsub();
  }, []);

  /* ======================================================
     ✅ EKRANA GİRİNCE → SYSTEM KART BİLDİRİMİNİ SIFIRLA
     (SADECE systemInbox, başka hiçbir şeye dokunmaz)
  ====================================================== */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    updateDoc(doc(db, "systemInbox", uid), {
      unreadCount: 0,
    }).catch(() => {});
  }, []);

  /* ======================================================
     ✅ EKRANA GİRİNCE → OKUNDU SAY (MEVCUT DAVRANIŞ)
  ====================================================== */
  useEffect(() => {
    if (messages.length === 0) return;

    messages.forEach((m) => {
      if (m.read === false && m.ref) {
        updateDoc(m.ref, {
          read: true,
          readAt: Date.now(),
        }).catch(() => {});
      }
    });
  }, [messages]);
    /* ======================================================
     ⬇️ MESAJ GELDİKÇE / EKRANA GİRİNCE EN ALTA KAYDIR
  ====================================================== */
  useEffect(() => {
    if (messages.length === 0) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
  }, [messages.length]);
  useEffect(() => {
  if (messages.length === 0) return;

  const t = setTimeout(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, 180);

  return () => clearTimeout(t);
}, [messages]);
  async function uploadAnnouncementImage(uri: string) {
  const res = await fetch(uri);
  const blob = await res.blob();

  const fileRef = ref(
    storage,
    `announcements/root/${Date.now()}.jpg`
  );

  await uploadBytes(fileRef, blob);
  return await getDownloadURL(fileRef);
}

 return (
  <View style={{ flex: 1, backgroundColor: "#F2F2F5" }}>
    {/* ================= PREMIUM SYSTEM HEADER ================= */}
    <View
      style={{
        paddingTop: 14,
        paddingBottom: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: "rgba(182, 165, 165, 0.34)",
        backgroundColor: "#ecf5f53a",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ fontSize: 20, marginRight: 12, color: "#160303f6" }}>
          ←
        </Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/icon.png")}
        style={{
          width: 63,
          height: 60,
          borderRadius: 30,
          marginRight: 10,
          borderWidth: 1,
          borderColor: "#10ebebe8",
        }}
      />
             <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              marginRight: 8,
              color: "#172b55ff",
            }}
          >
            Vb
          </Text>

          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: "#2563eb",
              borderWidth: 1,
              borderColor: "#60a5fa",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: "#fff",
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              SİSTEM
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, color: "#010116ff" }}>
          Sistem mesajları
        </Text>
      </View>
    </View>

    {/* ================= MESAJ LİSTESİ ================= */}
<FlatList
  ref={listRef}
  data={messages}
  keyExtractor={(i) => i.id}
  contentContainerStyle={{ padding: 16 }}
  renderItem={({ item }) => (
    <SystemMessageItem item={item} />
  )}
  onContentSizeChange={() => {
    listRef.current?.scrollToEnd({ animated: false });
  }}
  onLayout={() => {
    listRef.current?.scrollToEnd({ animated: false });
  }}
/>

 <RootAnnouncementModal
  visible={showRootModal}
  title={rootTitle}
  body={rootBody}
  onChangeTitle={setRootTitle}
  onChangeBody={setRootBody}
  onClose={() => setShowRootModal(false)}
  onSend={async ({ imageUri, roomId }) => {
    if (!rootTitle || !rootBody) return;

    try {
      let imageUrl: string | undefined;

      if (imageUri) {
        imageUrl = await uploadAnnouncementImage(imageUri);
      }

      await sendRootAnnouncement({
        title: rootTitle,
        body: rootBody,
        imageUrl,
        roomId,
      });

      setRootTitle("");
      setRootBody("");
      setShowRootModal(false);
    } catch (e) {
      console.log("ROOT ANNOUNCEMENT ERROR", e);
    }
  }}
/>
  </View>
);
}
