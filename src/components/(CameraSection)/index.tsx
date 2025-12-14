import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import AudioSlot from "../AudioSlot";
import CameraSlot from "../CameraSlot";

import useLivekitRoom from "../useLivekitRoom";
import useSlotTracks from "../useSlotTracks";

const normalize = (v: any) => (v ? v.toString() : "");

const normalizeSeat = (seat: any) =>
  seat
    ? {
        uid: normalize(seat.uid),
        mic: !!seat.mic,
        hostMute: !!seat.hostMute,
      }
    : { uid: "", mic: false, hostMute: false };

export default function CameraSection({ room, user, roomId }: any) {
  /* 🔒 EK: mutasyon yapmadan güvenli roomId */
  const safeRoomId = roomId || room?.id;

  const currentUid = normalize(user?.uid);
  const hostUid = normalize(room?.ownerId);
  const guestUid = normalize(room?.guestSeat);

  const isHost = currentUid === hostUid;
  const isGuestSelf = currentUid === guestUid;

  const [hostProfile, setHostProfile] = useState<any>(null);
  const [guestProfile, setGuestProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (hostUid) {
        const snap = await getDoc(doc(db, "users", hostUid));
        if (snap.exists()) setHostProfile(snap.data());
      }
      if (guestUid) {
        const snap = await getDoc(doc(db, "users", guestUid));
        if (snap.exists()) setGuestProfile(snap.data());
      }
    }
    load();
  }, [hostUid, guestUid]);

  const audioSeat1 = normalizeSeat(room?.audioSeat1);
  const audioSeat2 = normalizeSeat(room?.audioSeat2);

  const a1 = audioSeat1.uid;
  const a2 = audioSeat2.uid;

  const [audio1Profile, setAudio1Profile] = useState(null);
  const [audio2Profile, setAudio2Profile] = useState(null);

  const isAudio1Self = currentUid === a1;
  const isAudio2Self = currentUid === a2;

  useEffect(() => {
    async function loadAudio() {
      if (a1) {
        const s = await getDoc(doc(db, "users", a1));
        if (s.exists()) setAudio1Profile(s.data());
      } else setAudio1Profile(null);

      if (a2) {
        const s = await getDoc(doc(db, "users", a2));
        if (s.exists()) setAudio2Profile(s.data());
      } else setAudio2Profile(null);
    }
    loadAudio();
  }, [a1, a2]);

  // 🔥 LIVEKIT (roomId güvenli)
  const lk = useLivekitRoom({
    roomId: safeRoomId,
    currentUid,
  });

  const {
    localVideoTrack,
    localAudioTrack,
    remoteHostVideo,
    remoteGuestVideo,
    audio1Track,
    audio2Track,
    hostMuteUser,
  } = useSlotTracks({
    lkRoom: lk.lkRoom,
    room,
    currentUid,
    hostUid,
    guestUid,
    audioSeat1,
    audioSeat2,
    roomId: safeRoomId,
  });

  const leaveAsHost = async () => {
    if (!safeRoomId) return;
    await updateDoc(doc(db, "rooms", safeRoomId), {
      "hostState.camera": false,
      "hostState.mic": false,
    });
  };

  const leaveAsGuest = async () => {
    if (!safeRoomId) return;
    await updateDoc(doc(db, "rooms", safeRoomId), {
      guestSeat: "",
      "guestState.camera": false,
      "guestState.mic": false,
    });
  };

  const leaveAudioSeat1 = async () => {
    if (!safeRoomId) return;
    await updateDoc(doc(db, "rooms", safeRoomId), {
      audioSeat1: { uid: "", mic: false, hostMute: false },
    });
  };

  const leaveAudioSeat2 = async () => {
    if (!safeRoomId) return;
    await updateDoc(doc(db, "rooms", safeRoomId), {
      audioSeat2: { uid: "", mic: false, hostMute: false },
    });
  };

  return (
    <View style={styles.row}>
      {/* HOST SLOT */}
      <CameraSlot
        nickname={hostProfile?.username}
        avatar={hostProfile?.avatar}
        seatNumber={1}
        isOccupied={true}
        isSelf={isHost}
        isHost={true}
        cameraOn={room?.hostState?.camera}
        micOn={room?.hostState?.mic}
        remoteTrack={!isHost ? remoteHostVideo : null}
        localTrack={isHost ? localVideoTrack : null}
        onToggleCamera={() =>
          safeRoomId &&
          updateDoc(doc(db, "rooms", safeRoomId), {
            "hostState.camera": !room?.hostState?.camera,
          })
        }
        onToggleMic={() =>
          safeRoomId &&
          updateDoc(doc(db, "rooms", safeRoomId), {
            "hostState.mic": !room?.hostState?.mic,
          })
        }
        onLeave={leaveAsHost}
      />

      {/* AUDIO SEAT 1 */}
      <AudioSlot
        seatNumber={3}
        occupant={
          a1
            ? {
                uid: a1,
                name: audio1Profile?.username,
                avatar: audio1Profile?.avatar,
                mic: audioSeat1.mic,
                hostMute: audioSeat1.hostMute,
                audioTrack: audio1Track,
              }
            : null
        }
        isSelf={isAudio1Self}
        isHost={isHost}
        onToggleMic={
          isAudio1Self
            ? () =>
                safeRoomId &&
                updateDoc(doc(db, "rooms", safeRoomId), {
                  "audioSeat1.mic": !audioSeat1.mic,
                })
            : undefined
        }
        onKick={leaveAudioSeat1}
        onHostMute={hostMuteUser}
      />

      {/* AUDIO SEAT 2 */}
      <AudioSlot
        seatNumber={4}
        occupant={
          a2
            ? {
                uid: a2,
                name: audio2Profile?.username,
                avatar: audio2Profile?.avatar,
                mic: audioSeat2.mic,
                hostMute: audioSeat2.hostMute,
                audioTrack: audio2Track,
              }
            : null
        }
        isSelf={isAudio2Self}
        isHost={isHost}
        onToggleMic={
          isAudio2Self
            ? () =>
                safeRoomId &&
                updateDoc(doc(db, "rooms", safeRoomId), {
                  "audioSeat2.mic": !audioSeat2.mic,
                })
            : undefined
        }
        onKick={leaveAudioSeat2}
        onHostMute={hostMuteUser}
      />

      {/* GUEST SLOT */}
      {guestUid ? (
        <CameraSlot
          nickname={guestProfile?.username}
          avatar={guestProfile?.avatar}
          seatNumber={2}
          isOccupied={true}
          isSelf={isGuestSelf}
          isHost={false}
          cameraOn={room?.guestState?.camera}
          micOn={room?.guestState?.mic}
          remoteTrack={!isGuestSelf ? remoteGuestVideo : null}
          localTrack={isGuestSelf ? localVideoTrack : null}
          onToggleCamera={() =>
            safeRoomId &&
            updateDoc(doc(db, "rooms", safeRoomId), {
              "guestState.camera": !room?.guestState?.camera,
            })
          }
          onToggleMic={() =>
            safeRoomId &&
            updateDoc(doc(db, "rooms", safeRoomId), {
              "guestState.mic": !room?.guestState?.mic,
            })
          }
          onLeave={leaveAsGuest}
        />
      ) : (
        <CameraSlot
          nickname="Boş"
          avatar={null}
          seatNumber={2}
          isOccupied={false}
          isSelf={false}
          isHost={false}
          cameraOn={false}
          micOn={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
});
