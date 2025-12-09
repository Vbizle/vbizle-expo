import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { db } from "../../firebase/firebaseConfig";

import {
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

function normalizeSeat(seat: any) {
  if (!seat) return { uid: "", mic: false };
  return {
    uid: seat.uid || "",
    mic: !!seat.mic,
  };
}

export default function AudioInvite({ invite, roomId, user, onClose }: any) {
  const [status, setStatus] = useState(invite?.status);
  const currentUid = user?.uid;

  // 🔵 Firestore canlı dinleme
  useEffect(() => {
    if (!roomId) return;

    const ref = doc(db, "rooms", roomId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (!data?.audioInvite) return;
      setStatus(data.audioInvite.status);
    });

    return () => unsub();
  }, [roomId]);

  // 🔵 Daveti kabul et → boş koltuğa oturt
  const acceptInvite = async () => {
    try {
      if (!roomId || !currentUid) return;

      const roomRef = doc(db, "rooms", roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;

      const data: any = snap.data() || {};

      const seat1 = normalizeSeat(data.audioSeat1);
      const seat2 = normalizeSeat(data.audioSeat2);

      let seatUpdate: any = {};

      if (!seat1.uid) {
        seatUpdate = {
          audioSeat1: { uid: currentUid, mic: true },
        };
      } else if (!seat2.uid) {
        seatUpdate = {
          audioSeat2: { uid: currentUid, mic: true },
        };
      } else {
        seatUpdate = {
          audioSeat2: { uid: currentUid, mic: true },
        };
      }

      await updateDoc(roomRef, {
        audioInvite: {
          ...(invite || {}),
          toUid: invite?.toUid ?? currentUid,
          status: "accepted",
          acceptedAt: serverTimestamp(),
        },
        ...seatUpdate,
      });

      onClose && onClose();
    } catch (err) {
      console.error("Audio accept error:", err);
    }
  };

  // 🔴 REDDET
  const rejectInvite = async () => {
    try {
      if (!roomId) return;

      await updateDoc(doc(db, "rooms", roomId), {
        audioInvite: {
          ...(invite || {}),
          status: "rejected",
          rejectedAt: serverTimestamp(),
        },
      });

      onClose && onClose();
    } catch (err) {
      console.error("Audio reject error:", err);
    }
  };

  // Uygun değilse hiç render etme
  if (!invite || invite.toUid !== currentUid || status !== "pending") return null;

  return (
    <Modal transparent={true} animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <View style={styles.box}>

          <Image
            source={{ uri: invite.avatar }}
            style={styles.avatar}
          />

          <Text style={styles.username}>{invite.username}</Text>

          <Text style={styles.text}>
            Seni <Text style={styles.highlight}>Ses Koltuğuna</Text> davet ediyor.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.acceptBtn} onPress={acceptInvite}>
              <Text style={styles.btnText}>Katıl</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rejectBtn} onPress={rejectInvite}>
              <Text style={styles.btnText}>Reddet</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Kapat</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

/* --------------------------------------------
   STYLES — Web görünümüne %95 benzer
---------------------------------------------*/
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
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 10,
  },

  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  text: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: 6,
    fontSize: 14,
  },

  highlight: {
    color: "#ff4fd4",
    fontWeight: "600",
  },

  buttons: {
    marginTop: 16,
    flexDirection: "column",
    gap: 10,
  },

  acceptBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 10,
  },

  rejectBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
  },

  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },

  closeBtn: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 10,
  },

  closeText: {
    color: "white",
    textAlign: "center",
  },
});
