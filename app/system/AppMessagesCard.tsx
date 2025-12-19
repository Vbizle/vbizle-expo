import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export default function AppMessagesCard() {
  const router = useRouter();

  const [lastMessage, setLastMessage] = useState("Henüz mesaj yok");
  const [unreadCount, setUnreadCount] = useState(0);

  /* ======================================================
     ✅ OKUNMAMIŞ SAYISI → TEK KAYNAK: systemInbox/{uid}
     (read alanına BAKMIYORUZ)
  ====================================================== */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const inboxRef = doc(db, "systemInbox", uid);

    const unsub = onSnapshot(inboxRef, (snap) => {
      if (!snap.exists()) {
        setUnreadCount(0);
        return;
      }
      const d: any = snap.data();
      setUnreadCount(Number(d.unreadCount || 0));
    });

    return () => unsub();
  }, []);

  /* ======================================================
     ✅ SON MESAJ ÖNİZLEME → appMessages'tan sadece SON 1 kayıt
     (okundu/okunmadı sayımı yok)
  ====================================================== */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "appMessages"),
      where("toUid", "in", [uid, "ALL"]),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLastMessage("Henüz mesaj yok");
        return;
      }

      const d: any = snap.docs[0].data();
      setLastMessage(d?.body || "Henüz mesaj yok");
    });

    return () => unsub();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/system")}
      style={{
        marginHorizontal: 14,
        marginTop: 1,
        marginBottom: 8,
        padding: 8,
        borderRadius: 14,

        // 🔹 DAHA AÇIK, DM UYUMLU ARKAPLAN
        backgroundColor: "#e5e7eb",           // metalik açık gri
borderColor: "#9ca3af",               // çelik kenar
shadowColor: "#000",
shadowOpacity: 0.12,
shadowRadius: 6,
elevation: 4,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* 🔹 AVATAR */}
      <Image
  source={require("@/assets/icon.png")}
  style={{
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#60a5fa", // metalik mavi çerçeve
  }}
/>

      {/* 🔹 TEXT */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
         <Text
  style={{
    fontSize: 16,
    fontWeight: "800",
    marginRight: 6,
    color: "#111827",          // koyu metalik yazı
    letterSpacing: 0.5,
  }}
          >
            Vb
          </Text>

          {/* 🔒 SİSTEM ROZET */}
         <View
  style={{
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#1d4ed8",
    borderWidth: 1,
    borderColor: "#93c5fd",
  }}
          >
            <Text
              style={{
                fontSize: 10,
                color: "white",
                fontWeight: "600",
              }}
            >
              SİSTEM
            </Text>
          </View>
        </View>

        {/* 🔥 SON MESAJ ÖN İZLEME */}
        <Text
          numberOfLines={1}
          style={{
            color: "#374151",
fontSize: 13,
fontWeight: "500",
            marginTop: 2,
          }}
        >
          {lastMessage}
        </Text>
      </View>

      {/* 🔴 OKUNMAMIŞ SAYISI */}
      {unreadCount > 0 && (
        <View
          style={{
           backgroundColor: "#c01d2aff",
borderWidth: 1,
borderColor: "#fecaca",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            marginLeft: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
