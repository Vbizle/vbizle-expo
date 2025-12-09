import { Audio } from "expo-av";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function VoiceMessageBubble({ m, mine, isSeen, isLastMyMessage }) {
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  async function togglePlay() {
    try {
      if (!playing) {
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
        backgroundColor: mine ? "#2563eb" : "#f1f1f1",   // ⭐ beyaz tema
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
          backgroundColor: mine ? "#1e40af" : "#d4d4d4", // ⭐ açık gri
          marginRight: 10,
        }}
      >
        <Text style={{ color: mine ? "#fff" : "#111", fontSize: 18 }}>
          {playing ? "⏸" : "▶️"}
        </Text>
      </TouchableOpacity>

      {/* ⏱️ SÜRE */}
      <Text
        style={{
          color: mine ? "#fff" : "#111",   // ⭐ siyah yazı
          fontSize: 16,
          marginRight: 8,
        }}
      >
        {m.duration}s
      </Text>

      {/* ✔ GÖRÜLDÜ */}
      {mine && isLastMyMessage && isSeen && (
        <Text
          style={{
            color: "#777",          // ⭐ gri
            fontSize: 10,
            position: "absolute",
            right: 6,
            bottom: -12,
          }}
        >
          Görüldü
        </Text>
      )}
    </View>
  );
}
