import React, { useRef, useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import { Audio } from "expo-av";

export default function VoiceRecorder({ onFinish, onError }) {
  const recRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<any>(null);

  // ⏱ süre formatı
  function format(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  }

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      recRef.current = rec;
      setRecording(true);
      setSeconds(0);

      intervalRef.current = setInterval(() => {
        setSeconds((v) => v + 1);
      }, 1000);
    } catch (e) {
      onError?.(e);
    }
  }

  async function stopRecording() {
    try {
      clearInterval(intervalRef.current);

      const rec = recRef.current;
      if (!rec) return;

      await rec.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = rec.getURI();
      const status = await rec.getStatusAsync();
      const duration = Math.floor((status.durationMillis || 0) / 1000);

      setRecording(false);
      recRef.current = null;

      if (uri) onFinish?.({ uri, duration });
    } catch (e) {
      onError?.(e);
    }
  }

  function toggleRecord() {
    if (!recording) startRecording();
    else stopRecording();
  }

  return (
    <TouchableOpacity
      onPress={toggleRecord}
      style={{
        width: 38,
        height: 38,
        backgroundColor: recording ? "#dc2626" : "#fff", // ⭐ Beyaz tema
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: recording ? 0 : 1,
        borderColor: "#ddd", // ⭐ Gri ince border
        position: "relative",
      }}
    >
      {/* 🎤 / ⏹ ikon */}
      <Text style={{ color: recording ? "#fff" : "#111", fontSize: 20 }}>
        {recording ? "⏹" : "🎤"}
      </Text>

      {/* ⏱ Kayıt süresi */}
      {recording && (
        <Text
          style={{
            position: "absolute",
            top: -20,
            color: "#b91c1c", // Koyu kırmızı (beyaz temada okunaklı)
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {format(seconds)}
        </Text>
      )}
    </TouchableOpacity>
  );
}
