import React from "react";
import { View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { useYoutubePlayerNative } from "../../src/(hooks)/useYoutubePlayerNative";

export default function YoutubePlayerNative({ room, user, roomId }) {
  const { playerRef, onPlayerReady, onStateChange } =
    useYoutubePlayerNative(room, user, roomId);

  return (
    <View style={{ width: "100%", height: 220 }}>
      <YoutubePlayer
        ref={playerRef}
        height={220}
        play={room.playerState === 1}
        videoId={room.youtube}
        volume={room.videoVolume ?? 100}
        onReady={onPlayerReady}
        onChangeState={onStateChange}
      />
    </View>
  );
}
