"use client";

import React, { useCallback, useRef } from "react";
import YoutubePlayer from "react-native-youtube-iframe";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function YoutubeSectionNative({ room, user, roomId }) {
  /* 🔒 EK: güvenli roomId (id / roomId farkı + undefined riski) */
  const safeRoomId = roomId || room?.id || room?.roomId;

  const isHost = user?.uid === room?.ownerId;
  const playerRef = useRef(null);

  /* -------------------------------------------------------
     🔥 YouTube player state
  ------------------------------------------------------- */
  const onStateChange = useCallback((state) => {
    console.log("YT STATE:", state);
  }, []);

  /* -------------------------------------------------------
     🔥 Host ses kontrolü
  ------------------------------------------------------- */
  const handleVolumeChange = async (vol) => {
    if (!isHost) return;
    if (!safeRoomId) return;

    try {
      await updateDoc(doc(db, "rooms", safeRoomId), {
        videoVolume: Math.round(vol),
      });
    } catch (err) {
      console.log("Volume update error:", err);
    }
  };

  return (
    <View style={{ width: "100%", backgroundColor: "black" }}>
      {/* 🎥 PLAYER */}
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          backgroundColor: "black",
        }}
      >
        <YoutubePlayer
          ref={playerRef}
          height={240}
          play={room?.playerState === 1} // 1 = playing
          videoId={room?.youtube}
          volume={room?.videoVolume ?? 100}
          onChangeState={onStateChange}
        />
      </View>

      {/* 🎚 HOST SES SLIDER */}
      {isHost && (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text style={{ color: "white", marginBottom: 4 }}>🎚 Ses</Text>

          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={room?.videoVolume ?? 100}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#555"
            thumbTintColor="#fff"
          />
        </View>
      )}
    </View>
  );
}
