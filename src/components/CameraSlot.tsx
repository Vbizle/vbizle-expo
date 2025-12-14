import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";

import { VideoView } from "@livekit/react-native";

export default function CameraSlot({
  seatNumber,
  nickname,
  avatar,
  isOccupied,
  isSelf,
  isHost,
  cameraOn,
  micOn,
  onToggleCamera,
  onToggleMic,
  onLeave,
  localTrack,
  remoteTrack,
}) {
  const [showControls, setShowControls] = useState(false);

  // 🔒 EK: LiveKit track güvenli seçimi (mevcut mantık korunur)
  const activeTrack = isSelf ? localTrack : remoteTrack;

  /* 🔒 EK: undefined callback guard'ları */
  const handleToggleCamera = () => {
    if (onToggleCamera) onToggleCamera();
  };

  const handleToggleMic = () => {
    if (onToggleMic) onToggleMic();
  };

  const handleLeave = () => {
    if (onLeave) onLeave();
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.videoBox}
        onPress={() => setShowControls((v) => !v)}
      >
        {/* --- VIDEO GÖRÜNTÜ --- */}
        {isOccupied && cameraOn && activeTrack?.videoTrack && (
          <VideoView
            track={activeTrack}
            style={styles.video}
            mirror={isSelf}
            objectFit="cover"
          />
        )}

        {/* --- KAMERA KAPALIYSA AVATAR --- */}
        {isOccupied && (!cameraOn || !activeTrack) && (
          <Image
            source={{
              uri:
                avatar ||
                "https://i.imgur.com/4ZQZ4Z4.png",
            }}
            style={styles.avatar}
          />
        )}

        {/* --- BOŞ SLOT --- */}
        {!isOccupied && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyNumber}>{seatNumber}</Text>
            <Text style={styles.emptyText}>Boş</Text>
          </View>
        )}

        {/* 🔥 Kamera kapalı overlay */}
        {isOccupied && !cameraOn && (
          <View style={styles.cameraOffBadge}>
            <Text style={{ color: "white", fontSize: 12 }}>
              Kamera Kapalı
            </Text>
          </View>
        )}

        {/* 🔥 Mikrofon kapalı overlay */}
        {isOccupied && !micOn && (
          <View style={styles.micOffBadge}>
            <Text style={{ color: "white" }}>🔇</Text>
          </View>
        )}

        {/* --- KONTROL PANELİ (SADECE SELF GÖRÜR) --- */}
        {isOccupied && isSelf && showControls && (
          <View style={styles.controls}>
            <Pressable
              style={styles.ctrlBtn}
              onPress={handleToggleCamera}
            >
              <Text style={styles.ctrlText}>
                {cameraOn ? "🎥" : "🚫"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.ctrlBtn}
              onPress={handleToggleMic}
            >
              <Text style={styles.ctrlText}>
                {micOn ? "🎙" : "🔇"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.leaveBtn}
              onPress={handleLeave}
            >
              <Text style={styles.ctrlText}>⏹</Text>
            </Pressable>
          </View>
        )}
      </Pressable>

      {/* SLOT ALT YAZI */}
      <Text style={styles.nameText}>
        {isOccupied ? nickname : `${seatNumber}. Koltuk`}
      </Text>
    </View>
  );
}

/* ------------------------------ STYLES ------------------------------ */
const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginHorizontal: 4,
  },

  videoBox: {
    width: 120,
    height: 120,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },

  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  emptyBox: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  emptyNumber: {
    color: "white",
    opacity: 0.3,
    fontSize: 12,
  },

  emptyText: {
    color: "white",
    opacity: 0.4,
    fontSize: 11,
  },

  cameraOffBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
  },

  micOffBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 4,
    borderRadius: 10,
  },

  controls: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  leaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d63031",
    justifyContent: "center",
    alignItems: "center",
  },

  ctrlText: {
    fontSize: 18,
    color: "white",
  },

  nameText: {
    marginTop: 4,
    fontSize: 12,
    color: "white",
    opacity: 0.9,
  },
});
