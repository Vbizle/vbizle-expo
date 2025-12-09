import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { auth, db } from "../firebase/firebaseConfig";

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

// ⭐ THEME
import { useTheme } from "@/src/(providers)/ThemeProvider";

export default function HomePage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [myRoomId, setMyRoomId] = useState<string | null>(null);

  // ========================================================
  // 1) Giriş yapan kullanıcıyı dinle
  // ========================================================
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setFirebaseUser(u));
    return () => unsub();
  }, []);

  // ========================================================
  // 2) Kullanıcının kendi odası var mı?
  // ========================================================
  useEffect(() => {
    if (!firebaseUser) return;

    async function checkMyRoom() {
      const q = query(
        collection(db, "rooms"),
        where("ownerId", "==", firebaseUser.uid)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        setMyRoomId(snap.docs[0].id);
      } else {
        setMyRoomId(null);
      }
    }

    checkMyRoom();
  }, [firebaseUser]);

  // ========================================================
  // 3) Aktif odaları canlı dinle
  // ========================================================
  useEffect(() => {
    const q = query(collection(db, "rooms"), where("active", "==", true));

    const unsub = onSnapshot(q, (snap) => {
      let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      list.sort((a, b) => (b.onlineCount || 0) - (a.onlineCount || 0));

      setRooms(list);
    });

    return () => unsub();
  }, []);

  // ========================================================
  // 4) ODA AÇ
  // ========================================================
  async function handleCreateRoom() {
    if (!firebaseUser) {
      router.push("/login");
      return;
    }

    if (myRoomId) {
      const ref = doc(db, "rooms", myRoomId);
      await updateDoc(ref, {
        active: true,
        onlineUsers: [],
        onlineCount: 0,
      });

      router.push(`/rooms/${myRoomId}`);
    } else {
      router.push("/create-room");
    }
  }

  // ========================================================
  // RENDER
  // ========================================================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP BAR */}
      <View
        style={[
          styles.topBar,
          {
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Aktif Odalar</Text>

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={handleCreateRoom}
        >
          <Text style={[styles.createBtnText, { color: colors.text }]}>
            Oda Aç
          </Text>
        </TouchableOpacity>
      </View>

      {/* ROOM LIST */}
      <ScrollView style={styles.scroll}>
        {rooms.length === 0 && (
          <Text style={[styles.noRoomText, { color: colors.textMuted }]}>
            Şu anda aktif oda yok.
          </Text>
        )}

        <View style={styles.grid}>
          {rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              onPress={() => router.push(`/rooms/${room.id}`)}
              style={[
                styles.roomCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    room.image ||
                    "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
                }}
                style={styles.roomImage}
              />

              <View style={styles.roomInfo}>
                <Text style={[styles.roomName, { color: colors.text }]}>
                  {room.name}
                </Text>
                <Text
                  style={[styles.roomCount, { color: colors.textMuted }]}
                >
                  👥 {room.onlineCount || 0} kişi online
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBar: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  createBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  createBtnText: {
    fontWeight: "600",
  },

  scroll: {
    flex: 1,
    padding: 16,
  },

  noRoomText: {
    textAlign: "center",
    marginTop: 32,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  roomCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },

  roomImage: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
  },

  roomInfo: {
    padding: 10,
  },

  roomName: {
    fontSize: 14,
    fontWeight: "600",
  },

  roomCount: {
    marginTop: 4,
    fontSize: 12,
  },
});
