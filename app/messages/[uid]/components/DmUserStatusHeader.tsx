import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function DmUserStatusHeader({
  styles,
  router,
  otherUser,
  otherTyping,
  convId,
  me,
  messages,
  setMetaSeen,
}) {
  // 🔥 LastSeen formatlama fonksiyonu
  function formatLastSeen(ts) {
    if (!ts) return "";

    const now = Date.now();
    const diffMs = now - ts;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Az önce aktifti";
    if (diffMin < 60) return `${diffMin} dk önce aktifti`;
    if (diffHr < 24) return `${diffHr} saat önce aktifti`;
    return `${diffDay} gün önce aktifti`;
  }

  // 🔥 META dinle → okundu bilgisini index'e gönder
  useEffect(() => {
    if (!convId) return;

    const metaRef = doc(db, "dm", convId, "meta", "info");

    const unsub = onSnapshot(metaRef, (snap) => {
      const data = snap.data();
      if (data?.seen) {
        setMetaSeen(data.seen);
      }
    });

    return () => unsub();
  }, [convId]);

  // 🔥 DM ekranına girince SON MESAJ timestamp'ini OKUNDU olarak kaydet
  useEffect(() => {
    if (!convId || !me?.uid || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    const msgTime = lastMsg?.time?.toMillis?.() || Date.now();

    const metaRef = doc(db, "dm", convId, "meta", "info");

    updateDoc(metaRef, {
      [`seen.${me.uid}`]: {
        lastSeenTime: msgTime,
      },
    });
  }, [messages.length, convId, me?.uid]);

  // 🔥 SON GÖRÜLME BİLGİSİ (offline kullanıcı için)
  const lastSeenText =
    !otherUser.online && otherUser.lastSeen
      ? formatLastSeen(
          otherUser.lastSeen.toMillis
            ? otherUser.lastSeen.toMillis()
            : otherUser.lastSeen
        )
      : "";

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backBtn}>←</Text>
      </TouchableOpacity>

      <View style={{ position: "relative" }}>
        {otherUser.avatar ? (
          <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: "#222" }]} />
        )}
        {otherUser.online && <View style={styles.onlineDot} />}
      </View>

      <View>
        <Text style={styles.name}>{otherUser.name}</Text>

        {/* 🔥 Durum metni */}
        <Text
          style={
            otherTyping
              ? styles.typing
              : otherUser.online
              ? styles.onlineText
              : styles.onlineText
          }
        >
          {otherTyping
            ? "Yazıyor..."
            : otherUser.online
            ? "Çevrimiçi"
            : lastSeenText}
        </Text>
      </View>
    </View>
  );
}
