import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

/* 🔥 HOOKS */
import { useJoinMessage } from "../../src/(hooks)/useJoinMessageNative";
import { useMessages } from "../../src/(hooks)/useMessagesNative";
import { useRoomData } from "../../src/(hooks)/useRoomDataNative";
import { useRoomPresence } from "../../src/(hooks)/useRoomPresenceNative";
import { useSendMessage } from "../../src/(hooks)/useSendMessageNative";
import { useUserProfile } from "../../src/(hooks)/useUserProfile";

/* 🔥 COMPONENTS */
import CameraSection from "../../src/components/(CameraSection)";
import ChatInput from "../../src/components/ChatInputNative";
import ChatSection from "../../src/components/ChatSectionNative";
import OnlineUsers from "../../src/components/OnlineUsersNative";
import RoomHeader from "../../src/components/RoomHeaderNative";
import YoutubeSectionNative from "../../src/components/YoutubeSectionNative";

export default function RoomPage() {
  const params = useLocalSearchParams();
  const safeRoomId = params?.roomId as string;

  const { user, profile, loadingProfile } = useUserProfile();
  const { room, loadingRoom } = useRoomData(safeRoomId);

  const { messages } = useMessages(safeRoomId);
  const { newMsg, setNewMsg, sendMessage } = useSendMessage(
    safeRoomId,
    user,
    profile
  );

  useRoomPresence(safeRoomId, user, profile);
  useJoinMessage(safeRoomId, user, profile);

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
  onOnlineClick={() => setShowOnline(true)}

  // 🔥 HOST – oda adı / resmi düzenleme
  onEditClick={() => {
    console.log("EDIT ROOM CLICK");
    // ileride: RoomEditModal açılacak
  }}

  // 🔥 HOST – YouTube arama
  onSearchClick={() => {
    console.log("YOUTUBE SEARCH CLICK");
    // ileride: YoutubeSearchModal açılacak
  }}

  // 🔥 HOST – bağış paneli
  onDonationClick={() => {
    console.log("DONATION PANEL CLICK");
    // ileride: DonationPanel açılacak
  }}
/>


      <YoutubeSectionNative room={room} user={user} />

      <CameraSection room={room} user={user} roomId={safeRoomId} />

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
