import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useUi } from "@/src/(providers)/UiProvider";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function MiniRoomBubble() {
  const router = useRouter();
  const pathname = usePathname();
  const { minimizedRoom, clearRoom } = useUi();

  const [closing, setClosing] = useState(false);

  const screen = Dimensions.get("window");

  const [pos, setPos] = useState({
    x: screen.width - 110,
    y: screen.height - 200,
  });

  const posRef = useRef(pos);
  const moved = useRef(false);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  if (pathname.startsWith("/rooms/")) return null;
  if (!minimizedRoom?.roomId) return null;

  // =====================================================
  // 🔥 PAN / DRAG LOGIC
  // =====================================================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        moved.current = false;
      },

      onPanResponderMove: (_, gesture) => {
        const newX = posRef.current.x + gesture.dx;
        const newY = posRef.current.y + gesture.dy;

        if (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4) {
          moved.current = true;
        }

        setPos({
          x: newX,
          y: newY,
        });
      },

      onPanResponderRelease: () => {},
    })
  ).current;

  // =====================================================
  // 🔥 X BUTONU → ODADAN ÇIKAR
  // =====================================================
  async function handleCloseBubble() {
    if (closing) return;
    setClosing(true);

    try {
      const currentUser = auth.currentUser;
      const roomId = minimizedRoom.roomId;

      if (currentUser && roomId) {
        const uid = currentUser.uid;
        const ref = doc(db, "rooms", roomId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          const updatedOnline = (data.onlineUsers || []).filter(
            (u: any) => u.uid !== uid
          );

          const updates: any = {
            onlineUsers: updatedOnline,
            onlineCount: updatedOnline.length,
          };

          if (data.guestSeat === uid) updates.guestSeat = "";
          if (data.audioSeat1?.uid === uid) updates.audioSeat1 = null;
          if (data.audioSeat2?.uid === uid) updates.audioSeat2 = null;

          await updateDoc(ref, updates);
        }
      }
    } catch (err) {
      console.log("Bubble close error:", err);
    } finally {
      clearRoom();
      setClosing(false);
    }
  }

  // =====================================================
  // 🔥 BALON TIKLAMASI → ODAYA GERİ DÖN
  // =====================================================
  function handleBubblePress() {
    if (!moved.current) {
      router.push(`/rooms/${minimizedRoom.roomId}`);
    }
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          left: pos.x,
          top: pos.y,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* X BUTTON */}
      <TouchableOpacity style={styles.closeBtn} onPress={handleCloseBubble}>
        <View style={styles.closeInner}>
          <Image
            source={require("../../assets/icons/close.png")}
            style={{ width: 14, height: 14, tintColor: "white" }}
          />
        </View>
      </TouchableOpacity>

      {/* BUBBLE */}
      <View {...panResponder.panHandlers} style={styles.bubble}>
        <TouchableOpacity onPress={handleBubblePress} activeOpacity={0.8}>
          <Image
            source={{
              uri: minimizedRoom.roomImage || "https://via.placeholder.com/100",
            }}
            style={styles.image}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    zIndex: 99999,
  },

  bubble: {
    width: 80,
    height: 80,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 999,
    resizeMode: "cover",
  },

  closeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    zIndex: 100000,
  },

  closeInner: {
    width: 20,
    height: 20,
    backgroundColor: "red",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
});
