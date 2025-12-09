import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";

import { useRouter } from "expo-router";

import { db } from "../../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function RoomHeader({
  room,
  user,
  onOnlineClick,
  onSearchClick,
  onEditClick,
  onDonationClick,
}) {
  const router = useRouter();

  const [showExitPopup, setShowExitPopup] = useState(false);

  const isOwner = user.uid === room.ownerId;

  /* ---------------------------------------------------
      🔴 OWNER → ODAYI KAPAT
  --------------------------------------------------- */
  async function closeRoom() {
    if (!isOwner) return;

    await updateDoc(doc(db, "rooms", room.roomId), {
      active: false,
      onlineUsers: [],
      onlineCount: 0,
    });

    router.replace("/");
  }

  /* ---------------------------------------------------
      🔵 MİNİMİZE (EXPO)
  --------------------------------------------------- */
  function handleMinimize() {
    // Mobilde minimize başka ekranda açma şeklinde çalışır
    router.replace("/");
    setShowExitPopup(false);
  }

  /* ---------------------------------------------------
      🔵 MİSAFİR ODAYI TERK EDER
  --------------------------------------------------- */
  async function leaveRoomAsGuest() {
    if (isOwner) return;

    const filtered = (room.onlineUsers || []).filter(
      (u: any) => u.uid !== user.uid
    );

    await updateDoc(doc(db, "rooms", room.roomId), {
      onlineUsers: filtered,
      onlineCount: filtered.length,
    });

    router.replace("/");
  }

  /* ---------------------------------------------------
      RENDER
  --------------------------------------------------- */
  return (
    <>
      <View style={styles.header}>
        {/* SOL TARAF – Oda adı + resim */}
        <TouchableOpacity style={styles.leftSide} onPress={onEditClick}>
          <View style={styles.row}>
            <Image
              source={{ uri: room.image || "" }}
              style={styles.roomImage}
            />
            <Text style={styles.roomName}>{room.name}</Text>
          </View>

          <Text style={styles.roomId}>ID: {room.roomNumber ?? "—"}</Text>
        </TouchableOpacity>

        {/* SAĞ TARAF – ikonlar */}
        <View style={styles.icons}>
          {isOwner && (
            <TouchableOpacity onPress={onSearchClick}>
              <Text style={styles.icon}>🔍</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onOnlineClick}>
            <Text style={styles.icon}>👥 {room.onlineCount}</Text>
          </TouchableOpacity>

          {isOwner && (
            <TouchableOpacity onPress={onDonationClick}>
              <Text style={styles.icon}>💰</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setShowExitPopup(true)}>
            <Text style={[styles.icon, { color: "red" }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------------------------------------------
            ÇIKIŞ POPUP (MODAL)
      --------------------------------------------------- */}
      <Modal visible={showExitPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>Oda Seçenekleri</Text>

            {/* KÜÇÜLT */}
            <TouchableOpacity
              onPress={handleMinimize}
              style={[styles.popupBtn, styles.blueBtn]}
            >
              <Text style={styles.popupBtnText}>Odayı Küçült</Text>
            </TouchableOpacity>

            {/* MİSAFİRSE → ODADAN ÇIK */}
            {!isOwner && (
              <TouchableOpacity
                onPress={leaveRoomAsGuest}
                style={[styles.popupBtn, styles.redBtn]}
              >
                <Text style={styles.popupBtnText}>Odadan Çık</Text>
              </TouchableOpacity>
            )}

            {/* OWNER → KAPAT */}
            {isOwner && (
              <TouchableOpacity
                onPress={closeRoom}
                style={[styles.popupBtn, styles.redBtn]}
              >
                <Text style={styles.popupBtnText}>Odayı Kapat</Text>
              </TouchableOpacity>
            )}

            {/* VAZGEÇ */}
            <TouchableOpacity
              onPress={() => setShowExitPopup(false)}
              style={[styles.popupBtn, styles.grayBtn]}
            >
              <Text style={styles.popupBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------------------------------------------------
      STYLE
--------------------------------------------------- */

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSide: {
    flexDirection: "column",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  roomImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },

  roomName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  roomId: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 2,
  },

  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  icon: {
    fontSize: 20,
    color: "white",
  },

  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },

  popupBox: {
    width: 240,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  popupTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  popupBtn: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  popupBtnText: {
    color: "white",
    fontWeight: "bold",
  },

  redBtn: {
    backgroundColor: "#dc2626",
  },

  blueBtn: {
    backgroundColor: "#2563eb",
  },

  grayBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
