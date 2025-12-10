import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import { collectionGroup, doc, getDoc, onSnapshot } from "firebase/firestore";

const UiContext = createContext<any>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  /* ==========================
        ODA KÜÇÜLTME
  ========================== */
  const [minimizedRoom, setMinimizedRoom] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [skipNextJoinRoomId, setSkipNextJoinRoomId] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadState() {
      try {
        const savedRoom = await AsyncStorage.getItem("minimizedRoom");
        const savedMinimized = await AsyncStorage.getItem("isMinimized");

        if (savedRoom) setMinimizedRoom(JSON.parse(savedRoom));
        if (savedMinimized === "true") setIsMinimized(true);
      } catch (e) {
        console.log("UiProvider Load Error:", e);
      }
    }
    loadState();
  }, []);

  async function minimizeRoom({ roomId, roomImage }) {
    const data = { roomId, roomImage };

    setMinimizedRoom(data);
    setIsMinimized(true);

    await AsyncStorage.setItem("minimizedRoom", JSON.stringify(data));
    await AsyncStorage.setItem("isMinimized", "true");

    setSkipNextJoinRoomId(roomId);
  }

  async function clearRoom() {
    setMinimizedRoom(null);
    setIsMinimized(false);

    await AsyncStorage.removeItem("minimizedRoom");
    await AsyncStorage.setItem("isMinimized", "false");
  }

  function consumeSkipNextJoin(targetRoomId: string): boolean {
    if (skipNextJoinRoomId === targetRoomId) {
      setSkipNextJoinRoomId(null);
      return true;
    }
    return false;
  }

  /* ==========================
        DM – BİLDİRİM SİSTEMİ
  ========================== */

  const [activeDM, setActiveDM] = useState<string | null>(null);

  const [toastData, setToastData] = useState<any>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Aynı kişiden art arda popup çıkmasın
  const lastToastFrom = useRef<string | null>(null);

  /** ==========================
      🔥 DÜZELTİLMİŞ showToast
  ========================== **/
  function showToast({ uid, avatar, name }) {
    if (!uid) return;

    // Popup spam olmasın (sadece 1 kez)
    if (lastToastFrom.current === uid) return;

    lastToastFrom.current = uid;

    // UID + avatar + name artık garanti
    setToastData({
      uid,
      avatar: avatar || "/user.png",
      name: name || "Bilinmeyen Kullanıcı",
    });

    toastAnim.setValue(0);

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setToastData(null);
        });
      }, 2200);
    });
  }

  const translateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  /* ============================================================
      🔥 GLOBAL UNREAD LISTENER – Popup tüm sayfalarda çalışır!
  ============================================================ */
  useEffect(() => {
    if (!auth.currentUser) return;
    const me = auth.currentUser.uid;

    const unsub = onSnapshot(collectionGroup(db, "meta"), (snap) => {
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const path = docSnap.ref.path; // dm/convId/meta/info

        if (!path.includes("dm/")) return;

        const convId = path.split("/")[1];
        const [a, b] = convId.split("_");
        const otherId = a === me ? b : b === me ? a : null;
        if (!otherId) return;

        if (!data.unread || !data.unread[me]) return;

        const unreadCount = data.unread[me];
        if (unreadCount <= 0) return;

        // DM sayfası açıksa popup çıkmaz
        if (activeDM === otherId) return;

        // Aynı kullanıcı için popup tekrar çıkmasın
        if (lastToastFrom.current === otherId) return;

        // Kullanıcı bilgisi
        getDoc(doc(db, "users", otherId)).then((uSnap) => {
          if (!uSnap.exists()) return;
          const u = uSnap.data();

          showToast({
            uid: otherId,
            name: u.username,
            avatar: u.avatar || "/user.png",
          });
        });
      });
    });

    return () => unsub();
  }, [activeDM]);

  return (
    <UiContext.Provider
      value={{
        minimizedRoom,
        isMinimized,
        minimizeRoom,
        clearRoom,
        consumeSkipNextJoin,

        activeDM,
        setActiveDM,

        showToast,
      }}
    >
      {children}

      {/* Premium Toast Bildirimi */}
      {toastData && (
        <Animated.View
          style={[
            styles.toastCard,
            {
              opacity: toastAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Image source={{ uri: toastData.avatar }} style={styles.toastAvatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.toastName}>{toastData.name}</Text>
            <Text style={styles.toastMsg}>Sana mesaj gönderdi…</Text>
          </View>
        </Animated.View>
      )}
    </UiContext.Provider>
  );
}

export function useUi() {
  return useContext(UiContext);
}

/* ==========================
       STYLES
========================== */
const styles = StyleSheet.create({
  toastCard: {
    position: "absolute",
    top: 35,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFFEE",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 3000,
  },

  toastAvatar: {
    width: 45,
    height: 45,
    borderRadius: 999,
    marginRight: 10,
  },

  toastName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1E",
  },

  toastMsg: {
    fontSize: 13,
    color: "#6E6E73",
  },
});
