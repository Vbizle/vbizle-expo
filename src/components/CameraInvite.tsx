import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, CameraType } from "expo-camera";

import { db } from "@/firebase/firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";

export default function CameraInvite({ invite, roomId, user, onClose }: any) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  // Kamera izni iste
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Daveti kabul et
  const acceptInvite = async () => {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        guestSeat: user.uid,
        "guestState.camera": true,
        "guestState.mic": false,
        invite: {
          ...invite,
          status: "accepted",
        },
      });

      onClose();
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  // Daveti reddet
  const rejectInvite = async () => {
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        invite: {
          ...invite,
          status: "rejected",
        },
      });

      onClose();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>Kameraya Katıl</Text>

        {/* Kamera Ön İzleme */}
        <View style={styles.preview}>
          {permission?.granted ? (
            <Camera
              style={styles.camera}
              type={CameraType.front}
              onCameraReady={() => setCameraReady(true)}
            />
          ) : (
            <Text style={styles.permissionText}>Kamera izni gerekli…</Text>
          )}
        </View>

        {/* Butonlar */}
        <TouchableOpacity style={styles.btnAccept} onPress={acceptInvite}>
          <Text style={styles.btnText}>Katıl</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnReject} onPress={rejectInvite}>
          <Text style={styles.btnText}>Reddet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* -------------------------------------------
   STYLES (Web tasarımının Expo karşılığı)
------------------------------------------- */
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },

  box: {
    width: 330,
    backgroundColor: "#171717",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  title: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },

  preview: {
    width: "100%",
    height: 200,
    backgroundColor: "black",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },

  camera: {
    width: "100%",
    height: "100%",
  },

  permissionText: {
    color: "white",
    textAlign: "center",
    marginTop: 80,
  },

  btnAccept: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#16a34a",
    borderRadius: 10,
    marginBottom: 8,
  },

  btnReject: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#dc2626",
    borderRadius: 10,
  },

  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});
