// app/rooms/[roomId]/hooks/useLivekitRoom.ts

import { useEffect, useRef, useState } from "react";
import { Room, connect, RoomEvent, AudioSession } from "@livekit/react-native";
import { Platform, AppState } from "react-native";
import Constants from "expo-constants";

interface Props {
  roomId: string;
  currentUid: string;
}

export default function useLivekitRoom({ roomId, currentUid }: Props) {
  const [lkRoom, setLkRoom] = useState<Room | null>(null);
  const connectingRef = useRef(false);

  // ENV VALUES (app.json → extra → Constants)
  const TOKEN_URL = Constants.expoConfig?.extra?.TOKEN_URL;
  const LIVEKIT_URL = Constants.expoConfig?.extra?.LIVEKIT_URL;

  useEffect(() => {
    if (!currentUid) return;
    if (!roomId) return;
    if (lkRoom) return;
    if (connectingRef.current) return;

    connectingRef.current = true;
    let cancelled = false;

    async function start() {
      try {
        console.log("🔵 [LiveKit] TOKEN_URL:", TOKEN_URL);
        console.log("🔵 [LiveKit] LIVEKIT_URL:", LIVEKIT_URL);
        console.log("🔵 room:", roomId, "identity:", currentUid);

        // ----------------------------------------------------
        // TOKEN REQUEST (Expo uyumlu)
        // ----------------------------------------------------
        const tokenRes = await fetch(
          `${TOKEN_URL}?room=${roomId}&identity=${currentUid}`
        );

        if (!tokenRes.ok) {
          console.error("❌ Token Server Error:", await tokenRes.text());
          connectingRef.current = false;
          return;
        }

        const { token } = await tokenRes.json();

        // ----------------------------------------------------
        // AUDIO SESSION — EXPO ZORUNLU AYAR
        // ----------------------------------------------------
        await AudioSession.configureAudio({
          category: "playAndRecord",
          mode: "videoChat",
          active: true,
        });

        // ----------------------------------------------------
        // LIVEKIT CONNECT
        // ----------------------------------------------------
        const room = await connect(LIVEKIT_URL, token, {
          autoSubscribe: true,
          adaptiveStream: true,
          dynacast: true,
        });

        if (cancelled) return;

        console.log("✅ LiveKit connected!");

        // ----------------------------------------------------
        // ROOM EVENTS
        // ----------------------------------------------------
        room.on(RoomEvent.Reconnecting, () =>
          console.log("⚠ LiveKit reconnecting...")
        );

        room.on(RoomEvent.Reconnected, () =>
          console.log("✅ LiveKit reconnected!")
        );

        room.on(RoomEvent.ParticipantConnected, (p) =>
          console.log("👤 Participant joined:", p.identity)
        );

        room.on(RoomEvent.ParticipantDisconnected, (p) =>
          console.log("❌ Participant left:", p.identity)
        );

        // ----------------------------------------------------
        // APP STATE (background → foreground)
        // ----------------------------------------------------
        const sub = AppState.addEventListener("change", (state) => {
          if (state === "active") {
            try {
              room.resumeConnection?.();
              console.log("🔄 Resumed LiveKit connection after foreground.");
            } catch (e) {
              console.error("LiveKit resume error:", e);
            }
          }
        });

        setLkRoom(room);

        return () => sub.remove();
      } catch (err) {
        console.error("❌ LiveKit Connect Error:", err);
      } finally {
        connectingRef.current = false;
      }
    }

    start();

    return () => {
      cancelled = true;
    };
  }, [currentUid, roomId, lkRoom]);

  return { lkRoom };
}
