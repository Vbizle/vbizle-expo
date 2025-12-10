import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import VoiceMessageBubble from "./VoiceMessageBubble";

export default function MessagesList({
  messages,
  me,
  otherUser,
  metaSeen,
  lastMyMessageId,
  deleteMessage,
  setImageModal,
  scrollRef,
  styles,
}) {
  return (
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
        const msgTime = m.time && m.time.toMillis ? m.time.toMillis() : 0;

        const isSeen =
          mine && !!lastSeenTime && !!msgTime && msgTime <= lastSeenTime;

        // 🎤 SES MESAJI
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

        // 🖼️ RESİM MESAJI
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

        // ✉️ NORMAL METİN MESAJI
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
  );
}
