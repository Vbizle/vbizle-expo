import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Room,
  RoomEvent,
  Track,
  VideoView,
  connect,
  AudioSession,
} from "@livekit/react-native";

interface Props {
  url: string;
  token: string;
  isHost: boolean;
}

export default function LiveVideo({ url, token, isHost }: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [videoTrack, setVideoTrack] = useState<any>(null);

  useEffect(() => {
    let currentRoom: Room | null = null;

    async function init() {
      try {
        // 🔥 Kamera + mikrofon izni
        await AudioSession.requestRecordPermission();
        await AudioSession.requestCameraPermission();

        // 🔥 Ses ayarı
        await AudioSession.configureAudio({
          category: "playAndRecord",
          mode: "voiceChat",
          active: true,
        });

        // 🔥 Bağlan
        currentRoom = await connect(url, token, {
          autoSubscribe: true,
        });
        setRoom(currentRoom);

        // 🔥 Kendi kamera + mic aç
        await currentRoom.localParticipant.setCameraEnabled(true);
        await currentRoom.localParticipant.setMicrophoneEnabled(true);

        // 🔥 Kendi video trackini al (local preview için)
        const localPub = currentRoom.localParticipant.getTrackPublication(
          Track.Source.Camera
        );
        if (localPub?.track) {
          setVideoTrack(localPub.track);
        }

        // 🔥 Remote video track gelirse güncelle
        currentRoom.on(
          RoomEvent.TrackSubscribed,
          (track, publication, participant) => {
            if (track.kind === Track.Kind.Video) {
              setVideoTrack(track);
            }
          }
        );
      } catch (err) {
        console.log("LiveVideo connection error:", err);
      }
    }

    init();

    return () => {
      if (currentRoom) {
        currentRoom.disconnect();
      }
    };
  }, [url, token]);

  return (
    <View
      style={[
        styles.container,
        isHost ? styles.hostPosition : styles.guestPosition,
      ]}
    >
      {videoTrack && (
        <VideoView
          track={videoTrack}
          style={styles.video}
          objectFit="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 16,
    width: 90,
    height: 90,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  hostPosition: {
    right: 16,
  },
  guestPosition: {
    left: 16,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
