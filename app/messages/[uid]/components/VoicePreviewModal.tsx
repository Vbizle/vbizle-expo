import { Audio } from "expo-av";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VoicePreviewModal({ data, onCancel, onSend }) {
  const [sound, setSound] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!data) return null;

  async function togglePlay() {
    try {
      if (isPlaying) {
        if (sound) await sound.stopAsync();
        setIsPlaying(false);
        return;
      }

      const { sound: s } = await Audio.Sound.createAsync(
        { uri: data.uri },
        { shouldPlay: true }
      );

      setSound(s);
      setIsPlaying(true);

      s.setOnPlaybackStatusUpdate((st) => {
        if (st.didJustFinish) setIsPlaying(false);
      });
    } catch (e) {
      console.log("PLAY ERROR:", e);
    }
  }

  return (
    <Pressable style={styles.overlay}>
      <View style={styles.popup}>
        {/* Süre */}
        <Text style={styles.duration}>{data.duration}s</Text>

        {/* ▶️ Dinle */}
        <TouchableOpacity onPress={togglePlay} style={styles.btn}>
          <Text style={{ color: "#2563eb", fontSize: 16 }}>
            {isPlaying ? "⏹ Durdur" : "▶️ Dinle"}
          </Text>
        </TouchableOpacity>

        {/* ❌ İptal */}
        <TouchableOpacity onPress={onCancel} style={styles.btn}>
          <Text style={{ color: "#dc2626", fontSize: 16 }}>İptal</Text>
        </TouchableOpacity>

        {/* ✔ Gönder */}
        <TouchableOpacity onPress={onSend} style={styles.btnSend}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -55,

    zIndex: 9999,
    elevation: 9999,

    // ⭐ Daha mat, premium blur hissi
    backgroundColor: "rgba(0,0,0,0.10)",

    justifyContent: "flex-end",
    paddingBottom: 65,
  },

  popup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",

    paddingVertical: 12,
    paddingHorizontal: 12,

    // ⭐ Mat beyaz light tema
    backgroundColor: "#F7F7F9",

    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  duration: {
    color: "#1C1C1E", // ⭐ Premium koyu gri
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },

  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#E2E3E7", // ⭐ Soft light gri
    borderRadius: 8,
  },

  btnSend: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#2563eb", // ⭐ Mavi güçlü CTA
    borderRadius: 8,
  },
});
