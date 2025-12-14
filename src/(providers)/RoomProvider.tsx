import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// ⭐ EKLENDİ — VIP / LEVEL FORMAT
import { getLevelInfo } from "@/src/utils/levelSystem";
import { getVipRank } from "@/src/utils/vipSystem";

const RoomContext = createContext<any>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [minimizedRoom, setMinimizedRoom] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // 🔥 Minimize sonrası join atlama flag’i
  const [skipNextJoinRoomId, setSkipNextJoinRoomId] = useState<string | null>(
    null
  );

  // ======================================================
  // Expo'da localStorage yerine storage load işlemi
  // ======================================================
  useEffect(() => {
    async function loadState() {
      try {
        const savedRoom = await AsyncStorage.getItem("minimizedRoom");
        const savedMinimized = await AsyncStorage.getItem("isMinimized");

        if (savedRoom) setMinimizedRoom(JSON.parse(savedRoom));
        if (savedMinimized === "true") setIsMinimized(true);
      } catch (e) {
        console.log("RoomProvider Load Error:", e);
      }
    }
    loadState();
  }, []);

  // ======================================================
  // 🎯 ODAYI KÜÇÜLT
  // ======================================================
  async function minimizeRoom({ roomId, roomImage }) {
    const data = { roomId, roomImage };

    setMinimizedRoom(data);
    setIsMinimized(true);

    await AsyncStorage.setItem("minimizedRoom", JSON.stringify(data));
    await AsyncStorage.setItem("isMinimized", "true");

    // Bu odadan sonraki ilk girişte join atlanacak
    setSkipNextJoinRoomId(roomId);
  }

  // ======================================================
  // 🎯 BALONU TEMİZLE (odalardan tamamen ayrılma)
  // ======================================================
  async function clearRoom() {
    setMinimizedRoom(null);
    setIsMinimized(false);

    await AsyncStorage.removeItem("minimizedRoom");
    await AsyncStorage.setItem("isMinimized", "false");
  }

  // ======================================================
  // 🎯 Minimize → geri açınca 1 kez join'i atla
  // ======================================================
  function consumeSkipNextJoin(targetRoomId: string): boolean {
    if (skipNextJoinRoomId === targetRoomId) {
      setSkipNextJoinRoomId(null); // sadece 1 kere çalışır
      return true;
    }
    return false;
  }

  // ======================================================
  // ⭐ EKLENDİ — ODAYA GİRİŞ MESAJI FORMATLAYICI
  // Mevcut sistemleri BOZMAZ, sadece yardımcıdır
  // ======================================================
  function formatJoinMessage(user: {
    username: string;
    vipScore?: number;
    vbTotalSent?: number;
  }): string {
    const vipRank = getVipRank(user.vipScore ?? 0);
    const levelInfo = getLevelInfo(user.vbTotalSent ?? 0);

    return `VIP${vipRank} • ${user.username} • ${levelInfo.label} odaya katıldı`;
  }

  return (
    <RoomContext.Provider
      value={{
        minimizedRoom,
        isMinimized,
        minimizeRoom,
        clearRoom,
        consumeSkipNextJoin,

        // ⭐ EKLENDİ — dışarıdan kullanılabilir
        formatJoinMessage,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomState() {
  return useContext(RoomContext);
}
