import React, { useEffect, useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatSection({ messages, onUserClick }) {
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    // 🔥 Yeni mesaj geldiğinde aşağı kaydır
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, [messages]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ paddingVertical: 8 }}
    >
      {messages.map((m) => {
        /* -------------------------------------------------------
           JOIN mesajı
        ------------------------------------------------------- */
        if (m.type === "join") {
          return (
            <View key={m.id} style={styles.joinRow}>
              <Image
                source={{ uri: m.photo }}
                style={styles.joinAvatar}
              />
              <Text style={styles.joinText}>
                <Text style={{ fontWeight: "bold" }}>{m.name}</Text> odaya katıldı
              </Text>
            </View>
          );
        }

        /* -------------------------------------------------------
           PREMIUM VB MESAJI
        ------------------------------------------------------- */
        if (m.type === "system_vb") {
          return (
            <View key={m.id} style={styles.vbSystemMsg}>
              <Text style={styles.vbSystemText}>💸 {m.amount} VB gönderildi</Text>
            </View>
          );
        }

        /* -------------------------------------------------------
           Normal mesaj
        ------------------------------------------------------- */
        return (
          <TouchableOpacity
            key={m.id}
            style={styles.msgRow}
            onPress={() =>
              onUserClick({
                uid: m.uid,
                name: m.name,
                photo: m.photo,
              })
            }
          >
            <Image
              source={{ uri: m.photo }}
              style={styles.avatar}
            />

            <View style={{ flexShrink: 1 }}>
              <Text style={styles.msgName}>{m.name}</Text>
              <Text style={styles.msgText}>{m.text}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },

  /* JOIN message */
  joinRow: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.7,
    marginBottom: 6,
  },
  joinAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  joinText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

  /* VB SYSTEM MESSAGE */
  vbSystemMsg: {
    backgroundColor: "rgba(234,179,8,0.2)",
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.3)",
    padding: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  vbSystemText: {
    color: "#facc15",
    fontSize: 13,
    fontWeight: "600",
  },

  /* Normal mesaj */
  msgRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 8,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  msgName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    color: "white",
    flexShrink: 1,
  },
});
