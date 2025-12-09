import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

/* 🔥 HOOKS (app/hooks) */
import { useUserProfile } from "../../src/(hooks)/useUserProfile";
import { useRoomData } from "../../src/(hooks)/useRoomDataNative";
import { useRoomPresence } from "../../src/(hooks)/useRoomPresenceNative";
import { useJoinMessage } from "../../src/(hooks)/useJoinMessageNative";
import { useMessages } from "../../src/(hooks)/useMessagesNative";
import { useSendMessage } from "../../src/(hooks)/useSendMessageNative";

/* 🔥 COMPONENTS (app/components) */
import RoomHeader from "../../src/components/RoomHeaderNative";
import OnlineUsers from "../../src/components/OnlineUsersNative";
import YoutubeSectionNative from "../../src/components/YoutubeSectionNative";
import CameraSection from "../../src/components/(CameraSection)";
import ChatSection from "../../src/components/ChatSectionNative";
import ChatInput from "../../src/components/ChatInputNative";

export default function RoomPage() {
  const { roomId } = useLocalSearchParams();

  const { user, profile, loadingProfile } = useUserProfile();
  const { room, loadingRoom } = useRoomData(roomId as string);

  const { messages } = useMessages(roomId as string);
  const { newMsg, setNewMsg, sendMessage } = useSendMessage(
    roomId as string,
    user,
    profile
  );

  useRoomPresence(roomId as string, user, profile);
  useJoinMessage(roomId as string, user, profile);

  const [showOnline, setShowOnline] = useState(false);

  if (loadingRoom || loadingProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Oda yükleniyor...</Text>
      </View>
    );
  }

  if (!room || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Oda verisi yok...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RoomHeader
        room={room}
        user={user}
        onOnline={() => setShowOnline(true)}
      />

      <YoutubeSectionNative room={room} user={user} />

      <CameraSection room={room} user={user} />

      <View style={styles.chatWrapper}>
        <ChatSection messages={messages} />
        <ChatInput
          newMsg={newMsg}
          setNewMsg={setNewMsg}
          sendMessage={sendMessage}
        />
      </View>

      {showOnline && (
        <OnlineUsers
          visible={showOnline}
          room={room}
          onClose={() => setShowOnline(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  chatWrapper: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: "white", fontSize: 18 },
});
