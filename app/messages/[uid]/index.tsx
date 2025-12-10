import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DmUserStatusHeader from "./components/DmUserStatusHeader";
import MessagesList from "./components/MessagesList";
import ImageModals from "./components/ImageModals";
import SendBar from "./components/SendBar";
import VoicePreviewModal from "./components/VoicePreviewModal";

import { useDirectMessage } from "./hooks/useDirectMessage";

export default function DirectMessagePage() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();

  // 🔥 Tüm logic burada toplandı!
  const {
    me,
    otherUser,
    messages,
    metaSeen,
    lastMyMessageId,
    newMsg,
    setNewMsg,
    pendingImage,
    setPendingImage,
    uploadPendingImage,
    imageModal,
    setImageModal,
    sendMessage,
    sendImage,
    deleteMessage,
    onFinishVoice,
    handleSendVoice,
    handleTyping,
    otherTyping,
    recordingPopup,
    setRecordingPopup,
    menuOpen,
    setMenuOpen,
    scrollRef,
  } = useDirectMessage(String(uid), router);

  if (!me || !otherUser) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar backgroundColor="#F2F2F5" barStyle="dark-content" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F2F2F5" barStyle="dark-content" />

        {/* ÜST BAR */}
        <DmUserStatusHeader
          styles={styles}
          router={router}
          otherUser={otherUser}
          otherTyping={otherTyping}
          convId={`${me.uid}_${otherUser.uid}`}
          me={me}
          messages={messages}
          setMetaSeen={() => {}}
        />

        {/* SES ÖNİZLEME */}
        <VoicePreviewModal
          data={recordingPopup}
          onCancel={() => setRecordingPopup(null)}
          onSend={handleSendVoice}
        />

        {/* RESİM MODALLARI */}
        <ImageModals
          pendingImage={pendingImage}
          setPendingImage={setPendingImage}
          uploadPendingImage={uploadPendingImage}
          imageModal={imageModal}
          setImageModal={setImageModal}
          styles={styles}
        />

        {/* MESAJ LİSTESİ */}
        <MessagesList
          messages={messages}
          me={me}
          otherUser={otherUser}
          metaSeen={metaSeen}
          lastMyMessageId={lastMyMessageId}
          deleteMessage={deleteMessage}
          setImageModal={setImageModal}
          scrollRef={scrollRef}
          styles={styles}
        />

        {/* ALT BAR */}
        <SendBar
          newMsg={newMsg}
          setNewMsg={setNewMsg}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          sendMessage={sendMessage}
          sendImage={sendImage}
          handleTyping={handleTyping}
          onFinishVoice={onFinishVoice}
          styles={styles}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: "#F2F2F5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F5",
  },
};
