import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Audio } from "expo-av";

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
          <Text style={{ color: "#4ade80", fontSize: 16 }}>
            {isPlaying ? "⏹ Durdur" : "▶️ Dinle"}
          </Text>
        </TouchableOpacity>

        {/* ❌ İptal */}
        <TouchableOpacity onPress={onCancel} style={styles.btn}>
          <Text style={{ color: "#f87171", fontSize: 16 }}>İptal</Text>
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

    // 🔥 Popup HER ŞEYİN ÜSTÜNDE
    zIndex: 9999,
    elevation: 9999,

    backgroundColor: "rgba(0,0,0,0.30)", // hafif blur/karartma
    justifyContent: "flex-end", // popup en altta
    paddingBottom: 65, // input barın ÜSTÜNE denk gelir
  },

  popup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",

    paddingVertical: 12,
    paddingHorizontal: 12,

    backgroundColor: "rgba(0,0,0,0.85)",
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  duration: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },

  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#222",
    borderRadius: 8,
  },

  btnSend: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#2563eb",
    borderRadius: 8,
  },
});
