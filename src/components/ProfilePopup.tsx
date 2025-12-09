import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";

import { useRouter } from "expo-router";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import SendVbModal from "./SendVbModal";

interface Props {
  user: {
    uid: string;
    name: string;
    photo?: string;
    avatar?: string;
  };
  roomId?: string;
  visible: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export default function ProfilePopup({
  user,
  roomId,
  visible,
  onClose,
  isOwner,
}: Props) {
  const router = useRouter();
  const currentUid = auth.currentUser?.uid;

  const [vbId, setVbId] = useState("");
  const [roomData, setRoomData] = useState<any>(null);

  const [showSend, setShowSend] = useState(false);

  if (!visible || !user) return null;

  const isSelf = currentUid === user.uid;
  const userPhoto = user.photo || user.avatar || "";

  // -----------------------------------------------------
  // FIRESTORE → VB-ID çek
  // -----------------------------------------------------
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setVbId(snap.data().vbId || "");
      }
    }
    load();
  }, [user.uid]);

  // -----------------------------------------------------
  // Oda bilgisi
  // -----------------------------------------------------
  useEffect(() => {
    if (!roomId) return;

    getDoc(doc(db, "rooms", roomId)).then((s) => {
      if (s.exists()) setRoomData(s.data());
    });
  }, [roomId]);

  if (!roomData) return null;

  const cameraSeat = roomData.guestSeat || "";
  const audio1 = roomData.audioSeat1?.uid || "";
  const audio2 = roomData.audioSeat2?.uid || "";

  const cameraFull = !!cameraSeat;
  const audioFull = audio1 && audio2;

  const userInCamera = cameraSeat === user.uid;
  const userInAudio = audio1 === user.uid || audio2 === user.uid;
  const userOccupied = userInCamera || userInAudio;

  // -----------------------------------------------------
  // KAMERAYA DAVET
  // -----------------------------------------------------
  async function handleCameraInvite() {
    if (cameraFull || userOccupied) return;

    await updateDoc(doc(db, "rooms", roomId!), {
      invite: {
        toUid: user.uid,
        fromUid: currentUid ?? null,
        username: user.name,
        avatar: userPhoto,
        status: "pending",
        createdAt: serverTimestamp(),
      },
    });

    onClose();
  }

  // -----------------------------------------------------
  // SESE DAVET
  // -----------------------------------------------------
  async function handleAudioInvite() {
    if (audioFull || userOccupied) return;

    await updateDoc(doc(db, "rooms", roomId!), {
      audioInvite: {
        toUid: user.uid,
        fromUid: currentUid ?? null,
        username: user.name,
        avatar: userPhoto,
        status: "pending",
        createdAt: serverTimestamp(),
      },
    });

    onClose();
  }

  // -----------------------------------------------------
  // DM GÖNDER → EXPO
  // -----------------------------------------------------
  function handleSendDM() {
    router.push(`/messages/dm/${user.uid}`);
    onClose();
  }

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* Avatar */}

          <Image source={{ uri: userPhoto }} style={styles.avatar} />

          {vbId.length > 0 && (
            <Text style={styles.vbId}>ID: {vbId}</Text>
          )}

          <Text style={styles.name}>{user.name}</Text>

          {/* OWNER ACTIONS */}
          {isOwner && !isSelf && (
            <>
              {/* Kamera Daveti */}
              <TouchableOpacity
                disabled={cameraFull || userOccupied}
                onPress={handleCameraInvite}
                style={[
                  styles.button,
                  (cameraFull || userOccupied) && styles.disabled,
                ]}
              >
                <Text style={styles.buttonText}>Kameraya Davet</Text>
              </TouchableOpacity>

              {/* Ses Daveti */}
              <TouchableOpacity
                disabled={audioFull || userOccupied}
                onPress={handleAudioInvite}
                style={[
                  styles.buttonYellow,
                  (audioFull || userOccupied) && styles.disabled,
                ]}
              >
                <Text style={styles.buttonText}>🔊 Sese Davet</Text>
              </TouchableOpacity>
            </>
          )}

          {/* VB PARA */}
          {!isSelf && (
            <TouchableOpacity
              onPress={() => setShowSend(true)}
              style={styles.buttonGold}
            >
              <Text style={styles.buttonText}>💸 VB Gönder</Text>
            </TouchableOpacity>
          )}

          {/* DM */}
          {!isSelf && (
            <TouchableOpacity
              onPress={handleSendDM}
              style={styles.buttonBlue}
            >
              <Text style={styles.buttonText}>Mesaj Gönder</Text>
            </TouchableOpacity>
          )}

          {/* KAPAT */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.buttonText}>Kapat</Text>
          </TouchableOpacity>
        </View>

        {/* VB Modal */}
        {showSend && (
          <SendVbModal
            visible={showSend}
            onClose={() => setShowSend(false)}
            toUser={{
              uid: user.uid,
              name: user.name,
              avatar: userPhoto,
            }}
            roomId={roomId}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    width: 300,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 8,
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  vbId: {
    color: "white",
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 6,
  },

  button: {
    width: "100%",
    backgroundColor: "#7b3aed",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },

  buttonYellow: {
    width: "100%",
    backgroundColor: "#d4a017",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },

  buttonBlue: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },

  buttonGold: {
    width: "100%",
    backgroundColor: "#facc15",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },

  closeButton: {
    width: "100%",
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.4,
  },
});
