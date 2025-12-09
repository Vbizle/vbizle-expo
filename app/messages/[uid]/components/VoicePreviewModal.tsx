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

    backgroundColor: "rgba(0,0,0,0.15)", // beyaz tema için daha hafif blur
    justifyContent: "flex-end",
    paddingBottom: 65,
  },

  popup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",

    paddingVertical: 12,
    paddingHorizontal: 12,

    backgroundColor: "#fff",            // ⭐ BEYAZ POPUP
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",    // ⭐ Gri border
  },

  duration: {
    color: "#111",                      // ⭐ Koyu yazı
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },

  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e5e7eb",         // ⭐ Açık gri buton
    borderRadius: 8,
  },

  btnSend: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#2563eb",         // ⭐ Mavi güçlü buton
    borderRadius: 8,
  },
});
