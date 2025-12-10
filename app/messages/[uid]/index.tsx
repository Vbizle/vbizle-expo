import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useDirectMessage from "./hooks/useDirectMessage";

import DmUserStatusHeader from "./components/DmUserStatusHeader";
import VoiceMessageBubble from "./components/VoiceMessageBubble";
import VoicePreviewModal from "./components/VoicePreviewModal";
import VoiceRecorder from "./components/VoiceRecorder";

export default function DirectMessagePage() {
  const {
    me,
    otherUser,
    messages,
    newMsg,
    setNewMsg,
    metaSeen,
    otherTyping,
    pendingImage,
    setPendingImage,
    imageModal,
    setImageModal,
    recordingPopup,
    setRecordingPopup,
    handleTyping,
    sendMessage,
    sendImage,
    uploadPendingImage,
    onFinishVoice,
    handleSendVoice,
    deleteMessage,
    scrollRef,
    convId,
  } = useDirectMessage();

  if (!me || !otherUser) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#1C1C1E" }}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  const lastMyMessageId = messages.filter((m) => m.uid === me.uid).at(-1)?.id;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F2F2F5" barStyle="dark-content" />

        {/* HEADER */}
        <DmUserStatusHeader
          styles={styles}
          otherUser={otherUser}
          otherTyping={otherTyping}
          convId={convId}
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

        {/* BEKLEYEN RESİM GÖSTERİM */}
        {pendingImage && (
          <Modal visible transparent animationType="fade">
            <View style={styles.modalBg}>
              <Image
                source={{ uri: pendingImage }}
                resizeMode="contain"
                style={styles.modalImg}
              />

              <View style={{ flexDirection: "row", marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => setPendingImage(null)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={uploadPendingImage}
                  style={styles.sendImgBtn}
                >
                  <Text style={styles.sendImgText}>Gönder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* RESİM TAM EKRAN */}
        {imageModal && (
          <Modal visible transparent animationType="fade">
            <TouchableOpacity
              style={styles.modalBg}
              onPress={() => setImageModal(null)}
            >
              <Image
                source={{ uri: imageModal }}
                resizeMode="contain"
                style={styles.modalImg}
              />
            </TouchableOpacity>
          </Modal>
        )}

        {/* MESAJ LİSTESİ */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.msgList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m) => {
            const mine = m.uid === me.uid;

            const seenInfo = metaSeen && metaSeen[otherUser.uid];
            const lastSeenTime = seenInfo?.lastSeenTime;
            const msgTime = m.time?.toMillis?.() ?? 0;
            const isSeen =
              mine && lastSeenTime && msgTime && msgTime <= lastSeenTime;

            if (m.voiceUrl)
              return (
                <VoiceMessageBubble
                  key={m.id}
                  m={m}
                  mine={mine}
                  isSeen={isSeen}
                  isLastMyMessage={m.id === lastMyMessageId}
                />
              );

            if (m.imgUrl)
              return (
                <View key={m.id} style={{ marginBottom: 8 }}>
                  <TouchableOpacity
                    onPress={() => setImageModal(m.imgUrl)}
                    onLongPress={() => mine && deleteMessage(m.id)}
                    style={[styles.imgBubble, mine ? styles.right : styles.left]}
                  >
                    <Image source={{ uri: m.imgUrl }} style={styles.msgImg} />
                  </TouchableOpacity>

                  {mine && m.id === lastMyMessageId && (
                    <Text style={styles.seenText}>{isSeen ? "Görüldü" : ""}</Text>
                  )}
                </View>
              );

            return (
              <View key={m.id} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  onLongPress={() => mine && deleteMessage(m.id)}
                  style={[
                    styles.bubble,
                    mine ? styles.myBubble : styles.otherBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{m.text}</Text>
                </TouchableOpacity>

                {mine && m.id === lastMyMessageId && (
                  <Text style={styles.seenText}>{isSeen ? "Görüldü" : ""}</Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* MESAJ GÖNDERME BAR */}
        <View style={styles.sendBar}>
          <TouchableOpacity onPress={sendImage} style={styles.hamburgerBtn}>
            <Text style={{ color: "#1C1C1E", fontSize: 22 }}>☰</Text>
          </TouchableOpacity>

          <VoiceRecorder onFinish={onFinishVoice} />

          <TextInput
            style={styles.input}
            value={newMsg}
            onChangeText={(t) => {
              setNewMsg(t);
              handleTyping();
            }}
            placeholder="Mesaj yaz..."
            placeholderTextColor="#9A9A9E"
          />

          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={styles.sendAirplane}>➤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F5",
  },
  msgList: { padding: 10, paddingBottom: 2 },
  bubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "75%",
    marginBottom: 3,
  },
  bubbleText: { color: "#1C1C1E" },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#88b4dd67",
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E8E8EB",
    borderBottomLeftRadius: 0,
  },
  imgBubble: { marginBottom: 10 },
  msgImg: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  right: { alignSelf: "flex-end" },
  left: { alignSelf: "flex-start" },
  seenText: {
    color: "#6E6E73",
    fontSize: 11,
    marginLeft: "auto",
    marginRight: 4,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 50,
  },
  modalImg: { width: "90%", height: "90%" },

  // Buttons
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    marginRight: 10,
  },
  cancelText: { color: "#1C1C1E", fontSize: 15 },

  sendImgBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },
  sendImgText: { color: "#fff", fontSize: 15 },

  sendBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: "#F2F2F5",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: "#FAFAFC",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginHorizontal: 1,
    color: "#1C1C1E",
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    height: 37,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sendAirplane: { color: "#fff", fontSize: 10 },

  hamburgerBtn: {
    width: 42,
    height: 32,
    backgroundColor: "#FAFAFC",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
});
