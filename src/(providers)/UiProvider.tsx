import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, Animated } from "react-native";

const UiContext = createContext<any>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  /* ==========================
     ODA KÜÇÜLTME SİSTEMİ (MEVCUT)
     ========================== */
  const [minimizedRoom, setMinimizedRoom] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [skipNextJoinRoomId, setSkipNextJoinRoomId] = useState<string | null>(
    null
  );

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

    // sadece 1 kere atlanacak
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
     DM – YENİ BİLDİRİM SİSTEMİ
     ========================== */

  // Hangi DM ekranı açık? (o kişiden gelirse bildirim YOK)
  const [activeDM, setActiveDM] = useState<string | null>(null);

  // Yukarıdan kayan toast mesajı
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  function showToast(message: string) {
    // Aynı anda bir tane yeter
    setToastMsg(message);
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
          setToastMsg(null);
        });
      }, 2000); // 2 sn ekranda kal
    });
  }

  const translateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0], // yukarıdan kayarak gelsin
  });

  /* ==========================
     PROVIDER RETURN
     ========================== */

  return (
    <UiContext.Provider
      value={{
        minimizedRoom,
        isMinimized,
        minimizeRoom,
        clearRoom,
        consumeSkipNextJoin,

        // Yeni DM özellikleri ↓↓↓
        activeDM,
        setActiveDM,
        showToast,
      }}
    >
      {children}

      {/* Yukarıdan kayan toast bildirimi */}
      {toastMsg && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}
    </UiContext.Provider>
  );
}

export function useUi() {
  return useContext(UiContext);
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2000,
  },
  toastText: {
    backgroundColor: "rgba(0,0,0,0.85)",
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    borderRadius: 20,
  },
});
