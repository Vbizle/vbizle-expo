import { Audio } from "expo-av";
import React, { useRef, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

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
      console.log("🎤 START RECORDING");

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

      // saniye sayacı
      intervalRef.current = setInterval(() => {
        setSeconds((v) => v + 1);
      }, 1000);
    } catch (e) {
      console.log("Start error:", e);
      onError?.(e);
    }
  }

  async function stopRecording() {
    try {
      console.log("🎤 STOP RECORDING");

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

      if (uri) {
        console.log("🎤 FINISHED:", uri, duration);
        onFinish?.({ uri, duration });
      }
    } catch (e) {
      console.log("Stop error:", e);
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
        backgroundColor: recording ? "#b91c1c" : "#222",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* 🎤 / ⏹ ikon */}
      <Text style={{ color: "#fff", fontSize: 20 }}>
        {recording ? "⏹" : "🎤"}
      </Text>

      {/* ⏱ Kayıt süresi */}
      {recording && (
        <Text
          style={{
            position: "absolute",
            top: -20,
            color: "#f87171",
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
