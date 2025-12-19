import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";


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
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

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
  useEffect(() => {
  if (!me?.uid || !otherUser?.uid) return;

  const meRef = doc(db, "users", me.uid);
  const otherRef = doc(db, "users", otherUser.uid);

  let meLocation: any = null;
  let otherLocation: any = null;

  const calcDistance = () => {
    if (!meLocation || !otherLocation) return;

    const toRad = (v: number) => (v * Math.PI) / 180;

    const R = 6371; // km
    const dLat = toRad(otherLocation.lat - meLocation.lat);
    const dLng = toRad(otherLocation.lng - meLocation.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(meLocation.lat)) *
        Math.cos(toRad(otherLocation.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    setDistanceKm(d);
  };

  const unsubMe = onSnapshot(meRef, (snap) => {
    meLocation = snap.data()?.location;
    calcDistance();
  });

  const unsubOther = onSnapshot(otherRef, (snap) => {
    otherLocation = snap.data()?.location;
    calcDistance();
  });

  return () => {
    unsubMe();
    unsubOther();
  };
}, [me?.uid, otherUser?.uid]);


  // 🔥 DM ekranına girince SON MESAJ OKUNDU olarak kaydet
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

  // 🔥 SON GÖRÜLME (offline kullanıcı için)
  const lastSeenText =
    !otherUser.online && otherUser.lastSeen
      ? formatLastSeen(
          otherUser.lastSeen.toMillis
            ? otherUser.lastSeen.toMillis()
            : otherUser.lastSeen
        )
      : "";
      // 🔥 STATUS TEXT (online / typing / offline)
const statusText = otherTyping
  ? "Yazıyor..."
  : otherUser.online
  ? "Çevrimiçi"
  : lastSeenText;

  return (
    <View style={styles.header}>
      {/* GERİ BUTONU */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.backBtn, { color: "#1C1C1E" }]}>←</Text>
      </TouchableOpacity>

      {/* 🔥 PROFİLE GİDEN ALAN (AVATAR + İSİM) */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/profile/user/[uid]",
            params: { uid: otherUser.uid },
          })
        }
        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
      >
        <View style={{ position: "relative" }}>
          {otherUser.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: "#E8E8EB" } // 💠 MAT BEYAZ UYUMU
              ]}
            />
          )}

         {otherUser.online && <View style={styles.onlineDot} />}
        </View>

        <View>
          <Text style={styles.name}>{otherUser.name}</Text>

          <Text
            style={
              otherTyping
                ? styles.typing
                : otherUser.online
                ? styles.onlineText
                : { color: "#6E6E73", fontSize: 12 }
            }
          >
            {otherTyping
              ? "Yazıyor..."
              : otherUser.online
              ? "Çevrimiçi"
              : lastSeenText}

            {typeof distanceKm === "number" && distanceKm >= 0 && (
              <Text style={{ color: "#6E6E73", fontSize: 12 }}>
                {" · "}
                {distanceKm < 1 ? "1.0" : distanceKm.toFixed(1)} km
              </Text>
            )}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

