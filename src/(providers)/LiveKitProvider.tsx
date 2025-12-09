import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  Room,
  connect,
  useRoom,
  setLogger,
  LogLevel,
  AudioSession,
} from "@livekit/react-native";

export default function LiveKitProvider({
  token,
  url,
  children,
}: {
  token: string;
  url: string;
  children: React.ReactNode;
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let currentRoom: Room | null = null;

    async function start() {
      try {
        // Mikrofon & hoparlör kontrolü (iOS/Android)
        await AudioSession.configureAudio({
          category: "playAndRecord",
          mode: "voiceChat",
          active: true,
        });

        setLogger(LogLevel.warn);

        // Odaya bağlan
        currentRoom = await connect(url, token, {
          autoSubscribe: true,
        });

        setRoom(currentRoom);
        setConnected(true);
      } catch (err) {
        console.log("LiveKit Connect Error:", err);
      }
    }

    start();

    return () => {
      if (currentRoom) {
        currentRoom.disconnect();
      }
    };
  }, [token, url]);

  if (!connected || !room) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return (
    <Room room={room} connect={false}>
      {children}
    </Room>
  );
}
