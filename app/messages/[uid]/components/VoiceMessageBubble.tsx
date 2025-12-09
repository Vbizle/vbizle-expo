import { Audio } from "expo-av";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function VoiceMessageBubble({ m, mine, isSeen, isLastMyMessage }) {
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  async function togglePlay() {
    try {
      if (!playing) {
        // ▶️ PLAY
        const { sound } = await Audio.Sound.createAsync(
          { uri: m.voiceUrl },
          { shouldPlay: true }
        );

        setSoundObj(sound);
        setPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaying(false);
          }
        });
      } else {
        // ⏸ DURDUR
        if (soundObj) {
          await soundObj.stopAsync();
          await soundObj.unloadAsync();
        }
        setPlaying(false);
      }
    } catch (e) {
      console.log("PLAY ERROR:", e);
    }
  }

  return (
    <View
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        backgroundColor: mine ? "#2563eb" : "#222",
        paddingVertical: 0,
        paddingHorizontal: 9,
        borderRadius: 50,
        marginBottom: 11,
        maxWidth: "75%",

        flexDirection: "row",
        alignItems: "center",

        position: "relative",
      }}
    >
      {/* ▶️ PLAY / PAUSE BUTTON */}
      <TouchableOpacity
        onPress={togglePlay}
        style={{
          width: 40,
          height: 30,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: mine ? "#1e40af" : "#333",
          marginRight: 10,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>
          {playing ? "⏸" : "▶️"}
        </Text>
      </TouchableOpacity>

      {/* ⏱️ SÜRE (TAŞMAYAN HALİ) */}
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          marginRight: 8, // 🔥 taşmayı önler
        }}
      >
        {m.duration}s
      </Text>

      {/* ✔ SADECE SON KENDİ MESAJINDA VE GÖRÜLDÜ İSE */}
      {mine && isLastMyMessage && isSeen && (
        <Text
          style={{
            color: "#ddd",
            fontSize: 10,
            position: "absolute",
            right: 6,
            bottom: -12, // 🔥 artık mavi balonun altına taşmadan oturur
          }}
        >
          Görüldü
        </Text>
      )}
    </View>
  );
}
